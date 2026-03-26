import React, { useEffect, useRef, useState } from "react";
import api from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";                          // ← NEW

import IDFront from "../../components/IDFront";
import IDBack from "../../components/IDBack";
import ID_Form_Front from "../../components/ID_Form_Front";
import ID_Form_Back from "../../components/ID_Form_Back";

import TemplateFront from "../../assets/NewIDFront1.png";
import TemplateBack from "../../assets/NewIDBack.png";
// JSZip & file-saver no longer needed — removed
import {
  User, Briefcase, Hash, Clock, CheckCircle2, ChevronRight,
  Search, Filter, Download, CreditCard, SlidersHorizontal,
  Loader2, AlertCircle, LayoutTemplate, ChevronLeft,
} from "lucide-react";
import { Input } from "../../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";

const LOCATIONS = [
  ["all", "All Locations"],
  ["ALIMDC", "ALIMDC"],
  ["ALITAG", "ALITAG"],
  ["ALIPAL", "ALIPAL"],
  ["TEMPO-ALICEBU", "TEMPO-ALICEBU"],
  ["TEMPO-ALIDAVAO", "TEMPO-ALIDAVAO"],
];

// CR80 standard ID card: 3.375" × 2.125" landscape
const CR80_W = 3.375;
const CR80_H = 2.125;

export default function IdCreator() {
  // ── form state ─────────────────────────────────────────────────────────────
  const [employeeName, setEmployeeName] = useState("");
  const [position, setPosition] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [philhealth, setPhilhealth] = useState("");
  const [sss, setSSS] = useState("");
  const [pagibig, setPagibig] = useState("");
  const [tin, setTIN] = useState("");
  const [showBack, setShowBack] = useState(false);

  const idRef = useRef();
  const [signature, setSignature] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [qrCodeFile, setQrCodeFile] = useState(null);

  // ── list state ─────────────────────────────────────────────────────────────
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [locationFilter, setLocationFilter] = useState("all");

  // mobile panel toggle: "list" | "editor"
  const [mobilePanel, setMobilePanel] = useState("list");

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchPendingEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/employees/pending");
      setPendingEmployees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEmployees();
    const interval = setInterval(fetchPendingEmployees, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchQrFromDB = async (empId) => {
    const res = await api.get(`/api/employees/${empId}/qr`, { responseType: "blob" });
    return new File([res.data], `${empId}-qr.png`, { type: "image/png" });
  };

  const handleSelectEmployee = async (emp) => {
    setSelectedEmployeeId(emp.employee_id);
    setEmployeeName(emp.employee_name);
    setPosition(emp.position);
    setEmployeeId(emp.employee_id);
    setContactPerson(emp.contact_person || "");
    setContactNumber(emp.contact_number || "");
    setPhilhealth(emp.philhealth || "");
    setSSS(emp.sss || "");
    setPagibig(emp.pagibig || "");
    setTIN(emp.tin || "");

    try { setQrCodeFile(await fetchQrFromDB(emp.employee_id)); } catch { setQrCodeFile(null); }
    try {
      const r = await api.get(`/api/employees/${emp.employee_id}/photo`, { responseType: "blob" });
      setPhoto(URL.createObjectURL(r.data));
    } catch { setPhoto(null); }
    try {
      const r = await api.get(`/api/employees/${emp.employee_id}/signature`, { responseType: "blob" });
      setSignature(URL.createObjectURL(r.data));
    } catch { setSignature(null); }

    setShowBack(false);
    setMobilePanel("editor");
  };

  // ── PDF helpers ────────────────────────────────────────────────────────────

  /**
   * Converts any img src (local Vite asset, blob URL, http URL) into a
   * base64 data URL using an off-screen canvas.
   * This prevents html-to-image from re-fetching assets over the network,
   * which causes ERR_INTERNET_DISCONNECTED on local dev servers.
   */
  const toBase64 = (url) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext("2d").drawImage(img, 0, 0);
        resolve(c.toDataURL("image/png"));
      };
      img.onerror = () => resolve(url); // fallback: keep original src
      img.src = url;
    });

  /**
   * Walks every <img> inside a container and converts each src to base64
   * so html-to-image never needs to hit the network.
   */
  const preloadImages = async (container) => {
    const imgs = [...container.querySelectorAll("img")];
    await Promise.all(
      imgs.map(async (img) => {
        if (img.src && !img.src.startsWith("data:")) {
          img.src = await toBase64(img.src);
        }
      })
    );
    // Wait for all replacements to fully load
    await Promise.all(
      [...container.querySelectorAll("img")].map(
        (img) =>
          new Promise((res) => {
            if (img.complete) res();
            else { img.onload = res; img.onerror = res; }
          })
      )
    );
  };

  /**
   * Captures the card DOM node as a high-resolution PNG data URL.
   * pixelRatio:4 gives ~384 DPI source resolution before embedding into PDF.
   */
  const captureNode = async (node) => {
    await preloadImages(node);
    return htmlToImage.toPng(node, {
      pixelRatio: 4,     // 4× screen res = ~384 DPI — crisp inside PDF
      quality: 1,
      skipAutoScale: true,
      cacheBust: false, // MUST be false — prevents network re-fetch errors
    });
  };

  // ── Main download: generates a print-ready CR80 PDF ───────────────────────
  const handleDownloadBoth = async () => {
    if (!idRef.current || !employeeId) return;
    setDownloading(true);

    try {
      const cleanName = employeeName.replace(/\s+/g, "_").toLowerCase();

      // 1. Capture FRONT
      setShowBack(false);
      await new Promise((r) => setTimeout(r, 200)); // let React re-render
      const frontDataUrl = await captureNode(idRef.current);

      // 2. Capture BACK
      setShowBack(true);
      await new Promise((r) => setTimeout(r, 200));
      const backDataUrl = await captureNode(idRef.current);

      // 3. Build PDF — CR80 landscape, one page per side
      //    Page size exactly matches CR80 so print shops get bleed-to-edge output
      const pdf = new jsPDF({
        orientation: "portrait",   // card is taller than wide in your preview
        unit: "in",
        format: [CR80_W, CR80_H * 2.54], // jsPDF portrait: width < height
      });

      // Page 1 — Front (fill entire page, no margins)
      pdf.addImage(frontDataUrl, "PNG", 0, 0, CR80_W, CR80_H * 2.54, "", "SLOW");

      // Page 2 — Back
      pdf.addPage([CR80_W, CR80_H * 2.54], "portrait");
      pdf.addImage(backDataUrl, "PNG", 0, 0, CR80_W, CR80_H * 2.54, "", "SLOW");

      pdf.save(`${cleanName}_ID.pdf`);
      // In handleDownloadBoth, before the api.put call, add temporarily:
      console.log("Gov IDs being sent:", { philhealth, sss, pagibig, tin });
      // 4. Update employee status to "done"
      await api.put(`/api/employees/${employeeId}`, {
        employee_name: employeeName,
        position,
        contact_person: contactPerson || null,
        contact_number: contactNumber || null,
        status: "done",
        philhealth: philhealth || null,
        sss: sss || null,
        pagibig: pagibig || null,
        tin: tin || null,
        ID_created: new Date().toISOString(),
      });

      await fetchPendingEmployees();

      // 5. Reset all state
      setEmployeeName(""); setPosition(""); setEmployeeId("");
      setContactPerson(""); setContactNumber("");
      setPhilhealth(""); setSSS(""); setPagibig(""); setTIN("");
      setSignature(null); setPhoto(null); setQrCodeFile(null);
      setShowBack(false); setSelectedEmployeeId(null);
      setMobilePanel("list");

    } catch (err) {
      console.error("Download error:", err.response || err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // ── filtering ──────────────────────────────────────────────────────────────
  const filteredEmployees = pendingEmployees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      emp.employee_name.toLowerCase().includes(q) ||
      emp.employee_id.toLowerCase().includes(q) ||
      emp.position.toLowerCase().includes(q);
    const matchesLocation =
      locationFilter === "all" || emp.employee_id?.includes(locationFilter);
    return matchesSearch && matchesLocation;
  });

  const hasSelection = !!selectedEmployeeId;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 w-full min-w-0">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <CreditCard size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-foreground leading-tight tracking-tight">
              ID Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              Select an employee to generate their ID card
            </p>
          </div>
        </div>

        {mobilePanel === "editor" && (
          <Button
            variant="outline"
            size="sm"
            className="xl:hidden gap-1.5 rounded-xl h-8 text-xs"
            onClick={() => setMobilePanel("list")}
          >
            <ChevronLeft size={14} />
            Back to list
          </Button>
        )}
      </div>

      {/* ── Main two-column layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 w-full min-w-0 items-start">

        {/* ═══ LEFT — ID EDITOR ═══════════════════════════════════════════════ */}
        <div className={`min-w-0 ${mobilePanel === "list" ? "hidden xl:block" : "block"}`}>
          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/30 py-3.5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <LayoutTemplate size={16} className="text-emerald-500" />
                  ID Card Editor
                </CardTitle>
                <div className="flex items-center gap-1 bg-muted rounded-xl p-1 border border-border">
                  <button
                    onClick={() => setShowBack(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${!showBack
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setShowBack(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${showBack
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Back
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {!hasSelection ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <CreditCard size={28} className="text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">No employee selected</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose an employee from the list to start generating their ID
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-2 xl:hidden"
                    onClick={() => setMobilePanel("list")}
                  >
                    <ChevronLeft size={14} />
                    Go to employee list
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                  {/* ID Preview */}
                  <div className="flex flex-col items-center gap-3 flex-shrink-0 w-full lg:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60">
                        Preview
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="relative">
                      <div className="absolute -inset-3 bg-emerald-500/10 rounded-2xl blur-xl pointer-events-none" />
                      <div
                        ref={idRef}
                        className="relative w-[320px] h-[512px] overflow-hidden rounded-2xl shadow-2xl bg-white ring-1 ring-border"
                        style={{ maxWidth: "min(320px, calc(100vw - 3rem))" }}
                      >
                        <img
                          src={showBack ? TemplateBack : TemplateFront}
                          alt="ID Template"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {!showBack ? (
                          <IDFront
                            employeeName={employeeName} position={position} employeeId={employeeId}
                            signatureDraw={signature} signatureUpload={signature} uploadSize={signature}
                            photo={photo}
                          />
                        ) : (
                          <IDBack
                            contactPerson={contactPerson}
                            contactNumber={contactNumber}
                            qrCodeFile={qrCodeFile}
                            philhealth={philhealth}
                            sss={sss}
                            pagibig={pagibig}
                            tin={tin}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowBack(false)}
                        className={`w-2 h-2 rounded-full transition-all ${!showBack ? "bg-emerald-500 scale-125" : "bg-muted-foreground/25 hover:bg-muted-foreground/50"}`}
                      />
                      <button
                        onClick={() => setShowBack(true)}
                        className={`w-2 h-2 rounded-full transition-all ${showBack ? "bg-emerald-500 scale-125" : "bg-muted-foreground/25 hover:bg-muted-foreground/50"}`}
                      />
                    </div>
                  </div>

                  {/* Form + Actions */}
                  <div className="flex flex-col gap-5 flex-1 min-w-0 w-full lg:max-w-xs">
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                        {employeeName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate leading-tight">{employeeName || "—"}</p>
                        <p className="text-[10px] text-muted-foreground truncate font-mono">{employeeId}</p>
                      </div>
                      <Badge className="text-[9px] px-1.5 h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-none flex-shrink-0">
                        Selected
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                        {showBack ? "Back Side Fields" : "Front Side Fields"}
                      </span>
                      <div className="h-px flex-1 bg-border opacity-50" />
                    </div>

                    {!showBack ? (
                      <ID_Form_Front
                        employeeName={employeeName} setEmployeeName={setEmployeeName}
                        position={position} setPosition={setPosition}
                        employeeId={employeeId} setEmployeeId={setEmployeeId}
                        signature={signature} setSignature={setSignature}
                        photo={photo} setPhoto={setPhoto}
                      />
                    ) : (
                      <ID_Form_Back
                        contactPerson={contactPerson} setContactPerson={setContactPerson}
                        contactNumber={contactNumber} setContactNumber={setContactNumber}
                        qrCodeFile={qrCodeFile} setQrCodeFile={setQrCodeFile}
                        philhealth={philhealth}
                        sss={sss}
                        pagibig={pagibig}
                        tin={tin}
                      />
                    )}

                    {/* Download button — now outputs PDF */}
                    <Button
                      onClick={handleDownloadBoth}
                      disabled={downloading || !employeeId}
                      className="w-full h-11 rounded-xl gap-2 font-bold text-sm bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all disabled:opacity-60"
                    >
                      {downloading ? (
                        <><Loader2 size={16} className="animate-spin" /> Generating PDF…</>
                      ) : (
                        <><Download size={16} /> Download Print-Ready PDF</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ═══ RIGHT — PENDING EMPLOYEES PANEL ════════════════════════════════ */}
        <div className={`min-w-0 self-start sticky top-6 ${mobilePanel === "editor" ? "hidden xl:block" : "block"}`}>
          <Card
            className="border-border bg-card flex flex-col overflow-hidden"
            style={{ height: "calc(100vh - 8rem)" }}
          >
            <CardHeader className="border-b border-border bg-muted/20 flex-shrink-0 py-3.5 px-4 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Clock size={15} className="text-emerald-500" />
                  Pending Employees
                </CardTitle>
                <Badge
                  className={`text-[10px] px-2 h-5 font-bold border shadow-none ${filteredEmployees.length > 0
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                    : "bg-muted text-muted-foreground border-border"
                    }`}
                >
                  {filteredEmployees.length} pending
                </Badge>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search name, ID, position…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs bg-background border-border text-foreground placeholder:text-muted-foreground/60 rounded-xl focus-visible:ring-emerald-500/40"
                />
              </div>

              <div className="relative">
                <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none z-10" />
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="pl-9 h-9 text-xs bg-background border-border text-foreground rounded-xl focus:ring-emerald-500/40 [&>span]:truncate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border rounded-xl">
                    {LOCATIONS.map(([v, l]) => (
                      <SelectItem
                        key={v} value={v}
                        className="text-xs font-medium text-popover-foreground focus:bg-accent rounded-lg"
                      >
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-3 min-h-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-[3px] border-emerald-200/30 dark:border-emerald-900/30" />
                    <div className="absolute inset-0 rounded-full border-[3px] border-emerald-500 border-t-transparent animate-spin" />
                  </div>
                  <p className="text-xs text-muted-foreground">Loading employees…</p>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                    <User size={22} className="text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {searchQuery || locationFilter !== "all" ? "No matches found" : "All clear!"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {searchQuery || locationFilter !== "all"
                        ? "Try adjusting your search or filter"
                        : "All employees have been processed"}
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {filteredEmployees.map((emp) => {
                    const isSelected = selectedEmployeeId === emp.employee_id;
                    return (
                      <li
                        key={emp.employee_id}
                        onClick={() => handleSelectEmployee(emp)}
                        className={`
                          group relative rounded-xl border px-3 py-2.5 cursor-pointer
                          transition-all duration-150 select-none
                          ${isSelected
                            ? "border-emerald-500/60 bg-emerald-500/8 shadow-sm"
                            : "border-border bg-card hover:border-emerald-500/30 hover:bg-muted/40"
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-emerald-500" />
                        )}
                        <div className="flex items-center gap-2.5 pl-1">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                            style={{ background: "linear-gradient(135deg, #3ecf8e, #2aa876)" }}
                          >
                            {emp.employee_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate leading-tight">
                              {emp.employee_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{emp.position}</p>
                            <p className="text-[10px] text-muted-foreground/60 truncate font-mono">{emp.employee_id}</p>
                          </div>
                          {isSelected ? (
                            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight
                              size={15}
                              className="text-muted-foreground/30 flex-shrink-0 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all"
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>

            <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex-shrink-0">
              <p className="text-[10px] text-muted-foreground text-center">
                Showing <span className="font-bold text-foreground">{filteredEmployees.length}</span> of{" "}
                <span className="font-bold text-foreground">{pendingEmployees.length}</span> pending employees
              </p>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}