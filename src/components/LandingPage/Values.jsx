import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  Target,
  Smile,
  CheckCircle2,
  Layers,
  Sparkles
} from "lucide-react";

const values = [
  {
    title: "Efficiency",
    icon: Zap,
    description:
      "Automates ID registration, QR generation, and approval workflows to minimize manual effort.",
    color: "from-yellow-400 to-orange-500",
    bgColor: "bg-yellow-50",
    hoverBg: "group-hover:bg-yellow-500",
  },
  {
    title: "Security",
    icon: ShieldCheck,
    description:
      "QR-based identification and admin-controlled access ensure secure and trusted ID processing.",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
    hoverBg: "group-hover:bg-blue-600",
  },
  {
    title: "Accuracy",
    icon: Target,
    description:
      "Digital forms, photo uploads, and signatures reduce errors in ID creation.",
    color: "from-red-400 to-pink-500",
    bgColor: "bg-red-50",
    hoverBg: "group-hover:bg-red-500",
  },
  {
    title: "User-Friendly Design",
    icon: Smile,
    description:
      "A clean and intuitive interface allows employees and HR staff to use the system with ease.",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-50",
    hoverBg: "group-hover:bg-purple-600",
  },
  {
    title: "Reliability",
    icon: CheckCircle2,
    description:
      "Built to support consistent ID generation and claiming with minimal downtime.",
    color: "from-green-400 to-emerald-600",
    bgColor: "bg-green-50",
    hoverBg: "group-hover:bg-green-600",
  },
  {
    title: "Scalability",
    icon: Layers,
    description:
      "Easily expandable to support large organizations and future enhancements.",
    color: "from-indigo-400 to-indigo-600",
    bgColor: "bg-indigo-50",
    hoverBg: "group-hover:bg-indigo-600",
  },
];

export default function Values() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      className="relative w-full min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden px-4 py-20"
      initial="hidden"
      animate="show"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          variants={fadeUp}
          className="text-center mb-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 shadow-lg border border-green-200"
          >
            <Sparkles className="h-5 w-5 text-green-600" />
            <span className="text-sm font-bold text-green-700 tracking-wide">OUR VALUES</span>
          </motion.div>

          {/* Title with Gradient */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 leading-tight">
            System Values
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            The core principles that guide the design and functionality of the
            <span className="font-bold text-green-700"> ARROWGO ID Generator</span>.
          </motion.p>
        </motion.div>

        {/* VALUES GRID */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {values.map((value, index) => {
            const Icon = value.icon;

            return (
              <motion.div key={index} variants={cardVariants}>
                <Card className="group relative h-full rounded-3xl border-2 border-transparent bg-white shadow-lg hover:shadow-2xl hover:border-green-200 transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                  {/* Gradient Border Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 from-green-400 to-blue-500 pointer-events-none" />
                  
                  <CardContent className="relative p-8 text-center flex flex-col items-center h-full">
                    {/* ICON with Animated Background */}
                    <motion.div
                      className="relative mb-6"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${value.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                      <div className={`relative flex h-20 w-20 items-center justify-center rounded-2xl ${value.bgColor} text-gray-700 ${value.hoverBg} group-hover:text-white transition-all duration-500 shadow-md group-hover:shadow-xl`}>
                        <Icon size={36} strokeWidth={2.5} />
                      </div>
                    </motion.div>

                    {/* Number Badge */}
                    <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                      {index + 1}
                    </div>

                    {/* TITLE */}
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-green-700 transition-colors duration-300">
                      {value.title}
                    </h3>

                    {/* Divider */}
                    <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mb-4 group-hover:w-24 transition-all duration-500" />

                    {/* DESCRIPTION */}
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed flex-grow">
                      {value.description}
                    </p>

                    {/* Hover Effect - Bottom Accent */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${value.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-20 text-center"
        >
        </motion.div>
      </div>
    </motion.div>
  );
}