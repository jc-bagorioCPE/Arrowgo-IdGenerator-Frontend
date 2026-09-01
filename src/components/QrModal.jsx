import { useRef, useState } from "react"
import { QRCodeCanvas } from "qrcode.react" // npm install qrcode.react
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { QrCode, Copy, Check, Download } from "lucide-react"

// Drop this into AdminApplications.jsx (or wherever you manage applications).
// It renders a "Share Application Link" button that opens a modal with a
// scannable QR code pointing to your public /apply page.
//
// Usage inside AdminApplications.jsx CardHeader button row:
//   <ApplyQRModal />

// Change this to your deployed frontend origin in production
// (falls back to the current origin so it works in dev automatically).
const PUBLIC_APPLY_URL = `${window.location.origin}/apply`

export default function ApplyQRModal() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(PUBLIC_APPLY_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas")
    if (!canvas) return
    const url = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = url
    link.download = "arrowgo-application-qr.png"
    link.click()
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 rounded-xl h-9 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <QrCode className="h-4 w-4" />
        <span className="hidden sm:inline">Share Application Link</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              Scan to Apply
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            <div
              ref={canvasRef}
              className="p-4 bg-white rounded-xl border border-slate-200 dark:border-zinc-800"
            >
              <QRCodeCanvas
                value={PUBLIC_APPLY_URL}
                size={200}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
                includeMargin={false}
              />
            </div>

            <p className="text-xs text-center text-slate-500 dark:text-zinc-500 break-all">
              {PUBLIC_APPLY_URL}
            </p>

            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-1 gap-2 rounded-xl border-slate-200 dark:border-zinc-800"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy Link"}
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="flex-1 gap-2 rounded-xl bg-gradient-to-r from-[#70B9A1] to-[#5A9A85] text-white border-0 hover:from-[#5A9A85] hover:to-[#4A8A75]"
              >
                <Download className="h-4 w-4" />
                Download QR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}