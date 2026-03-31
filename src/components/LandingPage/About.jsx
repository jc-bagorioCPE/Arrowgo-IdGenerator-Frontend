import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import {
  ShieldCheck,
  Zap,
  Users,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

// ID EXAMPLE IMAGES
import idFront from "../../assets/sampleFront.png";
import idBack from "../../assets/sampleBack.png";

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    },
  };

  const objectives = [
    {
      icon: Zap,
      text: "Fast and accurate employee ID generation",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: ShieldCheck,
      text: "Secure QR-based identification",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: CheckCircle,
      text: "Efficient photo and signature handling",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Users,
      text: "Improved HR and employee coordination",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="relative w-full min-h-screen px-6 py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header Badge */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-lg border border-green-200">
            <Sparkles className="h-5 w-5 text-green-600" />
            <span className="text-sm font-bold text-green-700 tracking-wide">ABOUT THE SYSTEM</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* LEFT COLUMN */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Main Header Card */}
            <Card className="group relative border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative space-y-4 pb-6">
                <Badge className="w-fit bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-md">
                  <Sparkles className="h-3 w-3 mr-1" />
                  About ARROWGO
                </Badge>
                <CardTitle className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent leading-tight">
                  ARROWGO ID Generator
                </CardTitle>
                <div className="h-1 w-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full" />
                <CardDescription className="text-gray-700 text-base md:text-lg leading-relaxed">
                  A modern, secure, and efficient system designed to simplify
                  employee ID creation and management.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* What is Card */}
            <Card className="group border-2 border-green-100 shadow-lg hover:shadow-xl transition-all duration-500 bg-white hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
              
              <CardHeader className="relative">
                <CardTitle className="text-2xl text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-600 transition-colors duration-300">
                    <ArrowRight className="h-5 w-5 text-green-700 group-hover:text-white transition-colors duration-300" />
                  </div>
                  What is this system?
                </CardTitle>
              </CardHeader>
              <CardContent className="relative text-gray-700 leading-relaxed text-base">
                ARROWGO ID Generator is a digital identification platform that
                enables organizations to register employees, generate QR-based
                IDs, upload photos and signatures, and manage the ID claiming
                process efficiently—reducing errors and improving HR workflows.
              </CardContent>
            </Card>

            {/* Objectives Card */}
            <Card className="border-2 border-green-100 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  System Objectives
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-1">
                {objectives.map((objective, index) => {
                  const Icon = objective.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                      className="group/item relative"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 cursor-pointer">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`flex-shrink-0 p-3 ${objective.bgColor} rounded-xl shadow-sm group-hover/item:shadow-md transition-all`}
                        >
                          <Icon className={`${objective.color}`} size={20} strokeWidth={2.5} />
                        </motion.div>
                        <p className="text-gray-700 leading-relaxed flex-1 pt-2 group-hover/item:text-gray-900 transition-colors">
                          {objective.text}
                        </p>
                      </div>
                      {index < objectives.length - 1 && (
                        <Separator className="my-1" />
                      )}
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* RIGHT COLUMN — ID EXAMPLES */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Header for ID samples */}
            <div className="text-center lg:text-left mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-2">ID Samples</h3>
              <p className="text-gray-600">Preview of the generated employee ID cards</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* ID FRONT */}
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group relative border-2 border-green-200 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white">
                  {/* Badge overlay */}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-green-600 text-white border-0 shadow-lg">
                      Front
                    </Badge>
                  </div>

                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="p-4">
                    <AspectRatio ratio={3 / 4} className="h-[420px]">
                      <img
                        src={idFront}
                        alt="Employee ID Front"
                        className="w-full h-full object-contain rounded-lg border-2 border-green-100 group-hover:border-green-300 transition-colors duration-300"
                      />
                    </AspectRatio>
                  </div>

                  <CardContent className="text-center text-sm font-semibold text-gray-700 pt-3 pb-4 group-hover:text-green-700 transition-colors">
                    Front ID Sample
                  </CardContent>

                  {/* Bottom accent */}
                  <div className="h-1 bg-gradient-to-r from-green-600 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </Card>
              </motion.div>

              {/* ID BACK */}
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group relative border-2 border-green-200 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white">
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-blue-600 text-white border-0 shadow-lg">
                      Back
                    </Badge>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="p-4">
                    <AspectRatio ratio={3 / 4} className="h-[420px]">
                      <img
                        src={idBack}
                        alt="Employee ID Back"
                        className="w-full h-full object-contain rounded-lg border-2 border-green-100 group-hover:border-blue-300 transition-colors duration-300"
                      />
                    </AspectRatio>
                  </div>

                  <CardContent className="text-center text-sm font-semibold text-gray-700 pt-3 pb-4 group-hover:text-blue-700 transition-colors">
                    Back ID Sample
                  </CardContent>

                  <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </Card>
              </motion.div>
            </div>

            {/* Info card below samples */}
            <Card className="border-2 border-green-100 bg-gradient-to-br from-white to-green-50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Professional Quality</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Each ID card is generated with high-quality QR codes, employee photos, and digital signatures for secure identification.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}