import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

const service = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const template = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY; 


export default function ContactModal() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await emailjs.send(
        service,
        template,
        formData,
        publicKey
      );
      alert("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg">
          Contact Support
        </Button>
      </DialogTrigger>

      {/* Portal ensures modal is outside normal DOM flow */}
      <DialogPortal>
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 sm:p-8 relative"
          >
            {/* Close button */}
            <DialogTitle className="text-2xl font-bold text-green-800 flex justify-between items-center">
              Contact Support
              <X
                className="cursor-pointer hover:text-red-500"
                onClick={() => setOpen(false)}
              />
            </DialogTitle>

            <DialogDescription className="text-green-700 mt-2 mb-6 text-sm sm:text-base">
              Fill out the form below and we’ll get back to you as soon as possible.
            </DialogDescription>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border rounded-lg border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              />
              <Button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
