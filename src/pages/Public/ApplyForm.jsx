import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  UploadCloud,
  Loader2,
  FileText,
  X,
  AlertCircle,
} from "lucide-react"

// Public page — no auth. Mount this at a route like /apply in your router,
// OUTSIDE any authenticated/admin layout wrapper.
//
// Example (react-router-dom v6):
//   <Route path="/apply" element={<ApplyForm />} />

const API_BASE = import.meta.env.VITE_API_BASE_URL 

const POSITIONS = [
  "Truck Driver",
  "Warehouse Staff",
  "Dispatcher",
  "Logistics Coordinator",
  "Fleet Mechanic",
  "Customer Service Representative",
  "Admin Staff",
  "Other",
]

const MAX_FILE_MB = 5
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

export default function ApplyForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    otherPosition: "",
    message: "",
  })
  const [resume, setResume] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleFile = (file) => {
    if (!file) return
    setErrors((prev) => ({ ...prev, resume: undefined }))

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        resume: "Please upload a PDF or Word document (.pdf, .doc, .docx).",
      }))
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        resume: `File is too large. Max size is ${MAX_FILE_MB}MB.`,
      }))
      return
    }
    setResume(file)
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = "Full name is required."
    if (!form.email.trim()) next.email = "Email is required."
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email."
    if (!form.phone.trim()) next.phone = "Phone number is required."
    if (!form.position) next.position = "Please select a position."
    if (form.position === "Other" && !form.otherPosition.trim())
      next.otherPosition = "Please specify the position."
    if (!resume) next.resume = "Please attach your resume."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError("")
    if (!validate()) return

    setSubmitting(true)
    try {
      const payload = new FormData()
      payload.append("name", form.name.trim())
      payload.append("email", form.email.trim())
      payload.append("phone", form.phone.trim())
      payload.append(
        "position",
        form.position === "Other" ? form.otherPosition.trim() : form.position
      )
      payload.append("message", form.message.trim())
      payload.append("resume", resume)

      const res = await fetch(`${API_BASE}/api/recruitment/applications`, {
        method: "POST",
        body: payload,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "Something went wrong. Please try again.")
      }

      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setServerError(err.message || "Failed to submit application. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  /* ===============================
     SUCCESS STATE
  =============================== */
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#70B9A1]/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-[#70B9A1]" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
          <p className="text-sm text-slate-500 mb-6">
            Thanks for applying, {form.name.split(" ")[0]}. Our recruitment team will review
            your application and get back to you via email or phone.
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setForm({ name: "", email: "", phone: "", position: "", otherPosition: "", message: "" })
              setResume(null)
            }}
            className="w-full h-11 rounded-xl bg-[#70B9A1] text-white font-semibold hover:bg-[#5A9A85] transition-colors"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    )
  }

  /* ===============================
     FORM
  =============================== */
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#70B9A1] flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Arrowgo Logistics Inc.</h1>
          <p className="text-sm text-slate-500 mt-1">Join our team — fill out the form below to apply</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5"
        >
          {serverError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-3">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Name */}
          <Field label="Full Name" error={errors.name}>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Juan Dela Cruz"
              className={inputClass(errors.name)}
            />
          </Field>

          {/* Email */}
          <Field label="Email Address" error={errors.email}>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="juan@example.com"
              className={inputClass(errors.email)}
            />
          </Field>

          {/* Phone */}
          <Field label="Phone Number" error={errors.phone}>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="09XX XXX XXXX"
              className={inputClass(errors.phone)}
            />
          </Field>

          {/* Position */}
          <Field label="Position Applying For" error={errors.position}>
            <select
              name="position"
              value={form.position}
              onChange={handleChange}
              className={inputClass(errors.position)}
            >
              <option value="">Select a position…</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>

          {form.position === "Other" && (
            <Field label="Specify Position" error={errors.otherPosition}>
              <input
                name="otherPosition"
                value={form.otherPosition}
                onChange={handleChange}
                placeholder="e.g. Inventory Analyst"
                className={inputClass(errors.otherPosition)}
              />
            </Field>
          )}

          {/* Message */}
          <Field label="Message (optional)">
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={3}
              placeholder="Anything you'd like us to know…"
              className={inputClass(false) + " resize-none"}
            />
          </Field>

          {/* Resume Upload */}
          <Field label="Resume / CV" error={errors.resume}>
            {!resume ? (
              <label
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 px-4 cursor-pointer transition-colors ${
                  errors.resume
                    ? "border-red-300 bg-red-50"
                    : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-[#70B9A1]"
                }`}
              >
                <UploadCloud className="w-7 h-7 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">
                  Tap to upload your resume
                </span>
                <span className="text-xs text-slate-400">PDF or Word, max {MAX_FILE_MB}MB</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-[#70B9A1] flex-shrink-0" />
                  <span className="text-sm text-slate-700 truncate">{resume.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setResume(null)}
                  className="text-slate-400 hover:text-red-500 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-xl bg-[#70B9A1] text-white font-semibold hover:bg-[#5A9A85] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-5">
          By submitting, you agree that Arrowgo Logistics Inc. may contact you regarding this application.
        </p>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function inputClass(hasError) {
  return `w-full h-11 rounded-xl border px-3.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? "border-red-300 focus:ring-red-200"
      : "border-slate-200 focus:ring-[#70B9A1]/30 focus:border-[#70B9A1]"
  }`
}