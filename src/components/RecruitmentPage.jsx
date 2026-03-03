import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Send, Briefcase, Mail, User, FileText } from "lucide-react";

export default function RecruitmentPage() {
  const fileInputRef = useRef(null); // NEW

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    message: "",
    resume: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // NEW
  const [fileName, setFileName] = useState(""); // NEW

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "resume") {
      const file = files[0];
      if (!file) return;

      // ✅ Client-side validation
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("Only PDF, DOC, and DOCX files are allowed.");
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB.");
        e.target.value = "";
        return;
      }

      setError(null);
      setFileName(file.name);
      setFormData({ ...formData, resume: file });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("position", formData.position);
      submitData.append("message", formData.message);

      if (formData.resume) {
        submitData.append("resume", formData.resume);
      }

      const response = await fetch(
        "http://localhost:5000/api/recruitment",
        {
          method: "POST",
          body: submitData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      alert("Application submitted successfully!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        message: "",
        resume: null,
      });
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-green-600 to-green-500 text-white py-16 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Join Our Team
          </h1>
          <p className="text-lg sm:text-xl text-green-100 max-w-2xl mx-auto">
            Submit your application and let’s build something amazing.
          </p>
        </div>
      </motion.div>

      {/* FORM */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-10"
        >
          <h2 className="text-3xl font-bold text-green-800 mb-2">
            Application Form
          </h2>

          {error && (
            <div className="mb-4 text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* NAME */}
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg border-green-200"
            />

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg border-green-200"
            />

            {/* PHONE */}
            <input
              type="tel"
              name="phone"
              placeholder="Phone (optional)"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg border-green-200"
            />

            {/* POSITION */}
            <select
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg border-green-200 bg-white"
            >
              <option value="">Select position</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
            </select>

            {/* RESUME */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                name="resume"
                onChange={handleChange}
                accept=".pdf,.doc,.docx"
                className="w-full"
              />
              {fileName && (
                <p className="text-sm text-green-700 mt-1">
                  Selected: {fileName}
                </p>
              )}
            </div>

            {/* MESSAGE */}
            <textarea
              name="message"
              placeholder="Cover letter / message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 border rounded-lg border-green-200"
            />

            {/* SUBMIT */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-xl"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
