import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function ArchiveView({ employee, onClose }) {
  if (!employee) return null;
  const API = import.meta.env.VITE_API_BASE_URL;

  const [zoomImage, setZoomImage] = useState(null); // Holds URL of clicked image

  return (
    <>
      <Dialog open={!!employee} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-xl border-none">
          <Card className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <div className="flex flex-col lg:flex-row gap-6">

              {/* LEFT: Profile */}
              <div className="lg:w-1/4 flex flex-col items-center text-center space-y-4">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-slate-600 cursor-pointer hover:shadow-lg transition"
                  onClick={() => setZoomImage(`${API}/archive/${employee.employee_id}/photo`)}
                >
                  <img
                    src={`${API}/archive/${employee.employee_id}/photo`}
                    className="w-full h-full object-cover"
                    alt="Profile"
                  />
                </div>
                <h2 className="font-semibold text-lg text-gray-900 dark:text-slate-100">{employee.employee_name}</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">#{employee.employee_id}</p>
                <span className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-full text-xs capitalize">
                  {employee.status}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${employee.current_status === "claimed"
                      ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                      : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                    }`}
                >
                  {employee.current_status === "claimed" ? "Claimed" : "Not Claimed"}
                </span>

              </div>

              {/* CENTER: Info */}
              <div className="lg:w-2/4 space-y-4">
                <h3 className="font-semibold text-md text-gray-900 dark:text-slate-100">Employee Information</h3>
                <Info label="Position" value={employee.position} />
                <Info label="Contact Person" value={employee.contact_person} />
                <Info label="Contact Number" value={employee.contact_number} />

                <Separator className="dark:bg-slate-700" />

                <h3 className="font-semibold text-md text-gray-900 dark:text-slate-100">Government IDs</h3>
                <Info label="PhilHealth" value={employee.philhealth} />
                <Info label="SSS" value={employee.sss} />
                <Info label="Pag-IBIG" value={employee.pagibig} />
                <Info label="TIN" value={employee.tin} />
              </div>

              {/* RIGHT: Signature & QR */}
              <div className="lg:w-1/4 flex flex-col items-center space-y-4">
                {/* Signature */}
                <div className="w-full">
                  <h3 className="font-semibold text-md mb-2 text-gray-900 dark:text-slate-100">Signature</h3>
                  <div
                    className="border border-gray-300 dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-700 cursor-pointer hover:shadow-lg transition"
                    onClick={() => setZoomImage(`${API}/archive/${employee.employee_id}/signature`)}
                  >
                    <img
                      src={`${API}/archive/${employee.employee_id}/signature`}
                      className="w-full h-20 object-contain"
                      alt="Signature"
                    />
                  </div>

                </div>

                {/* QR Code */}
                <div className="w-full flex flex-col items-center">
                  <h3 className="font-semibold text-md mb-2 text-gray-900 dark:text-slate-100">QR Code</h3>
                  <div
                    className="border border-gray-300 dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-700 cursor-pointer hover:shadow-lg transition"
                    onClick={() => setZoomImage(`${API}/archive/${employee.employee_id}/qr`)}
                  >
                    <img
                      src={`${API}/archive/${employee.employee_id}/qr`}
                      className="w-24 h-24"
                      alt="QR Code"
                    />
                  </div>
                </div>

                <Button onClick={onClose} className="w-full mt-2 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Zoom Modal */}
      {zoomImage && (
        <Dialog open={!!zoomImage} onOpenChange={() => setZoomImage(null)}>
          <DialogContent
            className="max-w-lg p-0 bg-black/80 dark:bg-black/90 flex justify-center items-center rounded-xl cursor-pointer"
            onClick={() => setZoomImage(null)}
          >
            <img
              src={zoomImage}
              className="max-h-[80vh] max-w-full object-contain"
              alt="Zoomed"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

/* ================= HELPERS ================= */
function Info({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-slate-200">{value || "-"}</span>
    </div>
  );
}