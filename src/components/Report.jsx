import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  HelpCircle,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mail,
  User,
  MessageSquare,
} from "lucide-react";
import emailjs from "@emailjs/browser";

export default function HelpSupportModal({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // null, 'success', 'error'

  const service = import.meta.env.VITE_EMAILJS_SERVICE_ID 
  const template = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    try {
      // Initialize EmailJS (only needed once, but safe to call multiple times)
      emailjs.init(publicKey);

      // Send email using EmailJS
      const response = await emailjs.send(
        service,
        template,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_name: "Support Team", // You can customize this
        },
        publicKey
      );

      if (response.status === 200) {
        setStatus("success");
        // Reset form after 2 seconds
        setTimeout(() => {
          setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
          });
          setStatus(null);
          onOpenChange(false);
        }, 2000);
      }
    } catch (error) {
      console.error("EmailJS Error:", error);
      setStatus("error");
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setSending(false);
    }
  };

  const isFormValid = 
    formData.name.trim() && 
    formData.email.trim() && 
    formData.subject.trim() && 
    formData.message.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <HelpCircle className="h-6 w-6 text-[#70B9A1]" />
            Help & Support
          </DialogTitle>
          <DialogDescription>
            Need assistance? Send us a message and we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              Your Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-[#70B9A1]"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              Your Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-[#70B9A1]"
            />
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              Subject
            </Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              placeholder="How can we help you?"
              value={formData.subject}
              onChange={handleChange}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-[#70B9A1]"
            />
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Please describe your issue or question in detail..."
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="transition-all duration-200 focus:ring-2 focus:ring-[#70B9A1] resize-none"
            />
          </div>

          {/* Status Messages */}
          {status === "success" && (
            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">
                Message sent successfully! We'll get back to you soon.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">
                Failed to send message. Please try again or contact us directly.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || sending}
              className="bg-gradient-to-r from-[#70B9A1] to-[#5A9A85] hover:from-[#5A9A85] hover:to-[#4A8A75] text-white"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-gradient-to-r from-[#E8F5F1] to-[#D4EDE5] dark:from-slate-700 dark:to-slate-600 rounded-lg border border-[#70B9A1]/20">
          <p className="text-sm text-gray-700 dark:text-slate-300">
            <strong>Note:</strong> For urgent matters, please contact us directly at{" "}
            <a
              href="mailto:support@arrowgo.com"
              className="text-[#70B9A1] hover:underline font-medium"
            >
              support@arrowgo.com
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}