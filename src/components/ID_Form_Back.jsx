import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, User, Upload, X, QrCode, Lock } from "lucide-react";

export default function IDFormBack({
  contactPerson,
  setContactPerson,
  contactNumber,
  setContactNumber,
  qrCodeFile,
  setQrCodeFile,
  philhealth,
  sss,
  pagibig,
  tin,
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setQrCodeFile(file);
    }
  };
  const handleQrUpload = (e) => handleFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const clearFile = (e) => {
    e.stopPropagation();
    setQrCodeFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const GovIdField = ({ label, value }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Lock
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none"
        />
        <Input
          value={value || ""}
          readOnly
          className="pl-9 h-10 bg-muted/50 border-border text-foreground rounded-xl cursor-not-allowed opacity-70 select-none font-mono text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">

      {/* ── Government IDs (locked) ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Government IDs
          </span>
          <div className="h-px flex-1 bg-border opacity-50" />
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted border border-border">
            <Lock size={9} className="text-muted-foreground/50" />
            <span className="text-[9px] text-muted-foreground/50 font-semibold">Read only</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <GovIdField label="PhilHealth" value={philhealth} />
          <GovIdField label="SSS"        value={sss} />
          <GovIdField label="Pag-IBIG"   value={pagibig} />
          <GovIdField label="TIN"        value={tin} />
        </div>
      </div>

      {/* ── Contact Person ── */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Emergency Contact Person
        </Label>
        <div className="relative">
          <User
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="e.g. Juan Dela Cruz"
            className="pl-9 h-10 bg-background border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/60 rounded-xl transition-colors"
          />
        </div>
      </div>

      {/* ── Contact Number ── */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Emergency Contact Number
        </Label>
        <div className="relative">
          <Phone
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="e.g. 09XX-XXX-XXXX"
            className="pl-9 h-10 bg-background border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/60 rounded-xl transition-colors"
          />
        </div>
      </div>

      {/* ── QR Code Upload ── */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          QR Code
        </Label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
            cursor-pointer transition-all duration-200 min-h-[130px] px-4 py-5
            ${dragOver
              ? "border-emerald-500 bg-emerald-500/5 scale-[1.01]"
              : qrCodeFile
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-border bg-muted/30 hover:border-emerald-500/50 hover:bg-muted/50"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleQrUpload}
            className="hidden"
          />
          {qrCodeFile ? (
            <div className="flex items-center gap-4 w-full">
              <div className="relative flex-shrink-0">
                <img
                  src={URL.createObjectURL(qrCodeFile)}
                  alt="QR Preview"
                  className="w-20 h-20 object-contain rounded-lg border border-border bg-white dark:bg-slate-900 p-1 shadow-sm"
                />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                >
                  <X size={11} />
                </button>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                  {qrCodeFile.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {(qrCodeFile.size / 1024).toFixed(1)} KB
                </p>
                <p className="text-[10px] text-muted-foreground mt-2 underline underline-offset-2">
                  Click to replace
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                {dragOver
                  ? <Upload size={18} className="text-emerald-500 animate-bounce" />
                  : <QrCode size={18} className="text-emerald-500" />
                }
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {dragOver ? "Drop to upload" : "Click or drag & drop"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  PNG, JPG, WEBP up to 5 MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}