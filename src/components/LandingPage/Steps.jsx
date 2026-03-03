import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  UserPlus,
  QrCode,
  ScanLine,
  Camera,
  PenTool,
  Clock,
  CreditCard,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import VerifyEmployeeModal from "@/pages/Public/VerifyEmployee";

const steps = [
  {
    title: "Verify Employee ID",
    description:
      "Enter your Employee ID to verify your identity before proceeding with registration.",
    icon: ShieldCheck,
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    title: "Register",
    description: "Click Register and fill up all required employee details.",
    icon: UserPlus,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Save & Generate QR",
    description: "Click Save to generate your unique QR code.",
    icon: QrCode,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Scan QR Code",
    description: "Scan the generated QR code to proceed.",
    icon: ScanLine,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    title: "Upload Photo",
    description: "Take a picture or insert an existing photo.",
    icon: Camera,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    title: "Add Signature",
    description: "Draw your signature or upload an image file.",
    icon: PenTool,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Wait for Approval",
    description: "Wait for your name to appear on the ID claiming page.",
    icon: Clock,
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    title: "Claim ID",
    description: "Claim your printed ID from the HR department.",
    icon: CreditCard,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
  },
];

export default function Step() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="relative w-full bg-gradient-to-br from-[#A8DCD0] via-[#B5E3D8] to-[#C2EAE0] py-24 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 shadow-lg border border-green-200"
          >
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-bold text-green-700 tracking-wide">PROCESS FLOW</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-800 mb-6">
            ID Generator Process Flow
          </h2>
          <p className="text-green-900 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            A step-by-step flow showing how employee IDs are created and claimed.
          </p>
        </motion.div>

        {/* FLOWCHART */}
        <div className="relative">
          {/* CENTER LINE */}
          <div className="absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-teal-300 via-blue-300 to-green-400 hidden md:block transform -translate-x-1/2 rounded-full opacity-40" />

          <div className="space-y-12 md:space-y-20">
            {steps.map((step, index) => {
              const isLeft = index % 2 === 0;
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              const isFirst = index === 0;

              const StepCard = () => (
                <Card
                  className={`group relative rounded-3xl border-2 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden hover:scale-[1.02] ${
                    isFirst
                      ? "border-teal-200 ring-2 ring-teal-300/50"
                      : "border-green-100"
                  }`}
                >
                  {/* "Start Here" badge for first step */}
                  {isFirst && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-flex items-center gap-1 bg-teal-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md tracking-wide uppercase">
                        <ShieldCheck className="h-3 w-3" />
                        Start Here
                      </span>
                    </div>
                  )}

                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  <CardContent className="relative p-8">
                    <div className="flex items-start gap-5 mb-5">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500`}
                        />
                        <Icon
                          className="relative h-8 w-8 text-gray-700 group-hover:text-white transition-colors duration-500"
                          strokeWidth={2.5}
                        />
                      </motion.div>

                      {/* Title */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-green-700 transition-colors mb-2">
                          {step.title}
                        </h3>
                        <div
                          className={`h-1 w-12 bg-gradient-to-r ${step.color} rounded-full group-hover:w-20 transition-all duration-500`}
                        />
                      </div>

                      {/* Step Number Badge */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold shadow-lg ${isFirst ? "mt-6" : ""}`}
                      >
                        {index + 1}
                      </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed text-base pl-21">
                      {step.description}
                    </p>
                  </CardContent>

                  <div
                    className={`h-1.5 bg-gradient-to-r ${step.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                  />
                </Card>
              );

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* LEFT SIDE */}
                    {isLeft ? (
                      <div className="w-full md:w-1/2 md:pr-12">
                        <StepCard />
                      </div>
                    ) : (
                      <div className="w-full md:w-1/2 md:order-2 md:pl-12">
                        <StepCard />
                      </div>
                    )}

                    {/* CENTER DOT */}
                    <div className="hidden md:flex items-center justify-center md:order-1 relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                        viewport={{ once: true }}
                        className="relative"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color}`}
                        />
                        <div
                          className={`relative w-8 h-8 rounded-full bg-gradient-to-br ${step.color} border-4 border-white shadow-xl flex items-center justify-center`}
                        >
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      </motion.div>
                    </div>

                    {/* Arrow connector for mobile */}
                    {!isLast && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="md:hidden flex justify-center"
                      >
                        <ArrowRight className="h-8 w-8 text-green-600 rotate-90" />
                      </motion.div>
                    )}

                    {/* SPACER for right side cards */}
                    {!isLeft && <div className="hidden md:block md:w-1/2" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <div className="inline-flex flex-col items-center bg-white rounded-3xl shadow-2xl p-10 border-2 border-green-100">
            <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Follow these simple steps to generate your employee ID quickly and securely.
            </p>
            <motion.button
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              Start Registration
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      <VerifyEmployeeModal open={isOpen} onOpenChange={setIsOpen} />
    </section>
  );
}