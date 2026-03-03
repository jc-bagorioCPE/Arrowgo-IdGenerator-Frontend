import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Shield, Clock, Upload, QrCode, Users } from "lucide-react";
import ContactModal from "../ContactModal";
import FAQImage from "../../assets/FAQ.png";
import RoleSelectionModal from '../RoleSelectionModal';
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "Who can use the ARROWGO ID Generator?",
    answer:
      "The system is designed for organizations, HR departments, and employees who need a secure and efficient ID generation process.",
    icon: Users,
  },
  {
    question: "Do employees need admin access?",
    answer:
      "No. Employees only complete registration and upload required information. Admin access is restricted to HR personnel.",
    icon: Shield,
  },
  {
    question: "How is the QR code used?",
    answer:
      "Each QR code uniquely identifies an employee and is used for verification, tracking, and ID claiming purposes.",
    icon: QrCode,
  },
  {
    question: "Can I upload my own photo and signature?",
    answer:
      "Yes. The system supports uploading existing images or capturing them directly using the built-in tools.",
    icon: Upload,
  },
  {
    question: "How long does it take to receive the ID?",
    answer:
      "Once HR verifies and prints the ID, the employee's name will appear on the ID claiming page.",
    icon: Clock,
  },
  {
    question: "How secure is the system?",
    answer:
      "The system uses admin authentication, QR validation, and controlled access to protect employee data.",
    icon: Shield,
  },
];

export default function FAQ() {
  return (
    <motion.section
      className="w-full min-h-screen bg-gradient-to-br from-[#A8DCD0] via-[#B5E3D8] to-[#C2EAE0] px-4 py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <HelpCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">FAQ</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-800 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-6 text-base md:text-lg text-green-900 max-w-2xl mx-auto">
            Everything you need to know about using the ARROWGO ID Generator.
          </p>
        </motion.div>

        {/* MAIN CONTENT - TWO COLUMN LAYOUT */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* LEFT SIDE - IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:sticky lg:top-24"
          >
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-3xl blur-3xl"></div>

            {/* Main Image Container */}
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center">
                {/* Replace this with your actual image */}
                <img
                  src={FAQImage}
                  alt="FAQ Support"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-500 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>
            </div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-green-100 relative z-10" // added relative + z-10
            >
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Need More Help?
              </h3>
              <p className="text-green-700 text-sm mb-4">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>

              <ContactModal />

            </motion.div>

          </motion.div>

          {/* RIGHT SIDE - FAQ ACCORDION */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-4"
          >
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => {
                const IconComponent = faq.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <AccordionItem
                      value={`faq-${index}`}
                      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-green-100 overflow-hidden data-[state=open]:shadow-2xl data-[state=open]:border-green-300"
                    >
                      <AccordionTrigger
                        className="cursor-pointer text-left px-6 py-5 hover:no-underline group"
                      >
                        <div className="flex items-start gap-4 w-full pr-4">
                          <div className="p-2 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg group-hover:from-green-200 group-hover:to-blue-200 transition-all duration-200 flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-green-700" />
                          </div>
                          <span className="text-lg md:text-xl font-semibold text-green-800 group-hover:text-green-900 transition-colors">
                            {faq.question}
                          </span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-6 pb-6 pt-2">
                        <div className="pl-14 text-green-700 text-sm md:text-base leading-relaxed">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                );
              })}
            </Accordion>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-center text-white shadow-xl"
            >
              <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
              <p className="text-green-50 mb-4">
                We're here to help you get started with ARROWGO ID Generator
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link to = "/Documentation">
                  <button  className="bg-white text-green-700 font-semibold py-2 px-6 rounded-lg hover:bg-green-50 transition-colors">
                    View Documentation
                  </button>
                </Link>
                  <RoleSelectionModal />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}