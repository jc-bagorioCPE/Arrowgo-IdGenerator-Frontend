import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Info,
  Target,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
  Shield,
  Zap,
  Users,
} from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id) => {
    // If not on home page, go home first
    if (location.pathname !== "/") {
      navigate("/");

      // Wait for page render before scrolling
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    } else {
      // Already on home page
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const navigationLinks = [
    { name: "Home", icon: Home, id: "home" },
    { name: "About", icon: Info, id: "about" },
    { name: "System Values", icon: Target, id: "values" },
    { name: "FAQ", icon: HelpCircle, id: "faq" },
  ];


  const processSteps = [
    { name: "Register Employee", icon: Users },
    { name: "Generate QR Code", icon: Zap },
    { name: "Upload Photo & Signature", icon: Shield },
    { name: "ID Approval & Claiming", icon: ArrowRight },
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/arrowgologisticsofficial" },
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/arrowgo-logistics-official/posts/?feedView=all" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/arrowgologisticsincofficial/" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },


  };

  return (
    <footer className="relative w-full bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 border-t-4 border-green-600 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-200 rounded-full filter blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl" />
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-6 py-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* BRAND SECTION */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
                  <Shield className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl font-extrabold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                  ARROWGO
                </h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                ARROWGO ID Generator is a modern system designed to simplify
                employee identification, improve HR workflows, and ensure
                secure ID processing.
              </p>

              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2.5 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-green-600 group transition-all duration-300 border border-gray-200"
                    >
                      <Icon className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors" strokeWidth={2} />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {/* NAVIGATION SECTION */}
            <motion.div variants={itemVariants}>
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full" />
                Quick Links
              </h4>
              <ul className="space-y-3">
                {navigationLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.name}>
                      <button
                        onClick={() => scrollToSection(link.id)}
                        className="cursor-pointer group flex items-center gap-3 text-gray-700 hover:text-green-600 transition-all duration-300"
                      >
                        <div className="p-1.5 bg-green-100 rounded-lg group-hover:bg-green-600 transition-colors">
                          <Icon className="h-4 w-4 text-green-700 group-hover:text-white transition-colors" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-medium group-hover:translate-x-1 transition-transform">
                          {link.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* PROCESS SECTION */}
            <motion.div variants={itemVariants}>
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full" />
                Process Flow
              </h4>
              <ul className="space-y-3">
                {processSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <li key={step.name} className="group flex items-start gap-3 text-gray-700">
                      <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-colors mt-0.5">
                        <Icon className="h-4 w-4 text-blue-700 group-hover:text-white transition-colors" strokeWidth={2.5} />
                      </div>
                      <div>
                        <span className="text-sm font-medium block">{step.name}</span>
                        <span className="text-xs text-gray-500">Step {index + 1}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* CONTACT SECTION */}
            <motion.div variants={itemVariants}>
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full" />
                Get In Touch
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-700">
                  <div className="p-2 bg-purple-100 rounded-lg mt-0.5">
                    <Mail className="h-4 w-4 text-purple-700" strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Email</span>
                    <a href="mailto:query@arrowgologistics.com" className="text-sm font-medium hover:text-green-600 transition-colors">
                      query@arrowgologistics.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <div className="p-2 bg-orange-100 rounded-lg mt-0.5">
                    <Phone className="h-4 w-4 text-orange-700" strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Phone</span>
                    <span className="text-sm font-medium">(02) 7001-4088</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <div className="p-2 bg-red-100 rounded-lg mt-0.5">
                    <MapPin className="h-4 w-4 text-red-700" strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Location</span>
                    <span className="text-sm font-medium">HR Department</span>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Newsletter Section */}
          <motion.div
            variants={itemVariants}
            className="mt-16 p-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl shadow-2xl"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white">
                <h4 className="text-2xl font-bold mb-2">Stay Updated</h4>
                <p className="text-green-100 text-sm">
                  Get the latest updates on system features and improvements.
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white text-gray-800 flex-1 md:w-64"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-green-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  Subscribe
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="border-t border-gray-200 bg-white/50 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                © {new Date().getFullYear()}
                <span className="font-bold text-green-700">ARROWGO ID Generator</span>
                · All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-green-600 transition-colors font-medium">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-green-600 transition-colors font-medium">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-green-600 transition-colors font-medium">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}