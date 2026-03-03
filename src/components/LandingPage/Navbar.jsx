import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  X,
  Home,
  BadgeCheck,
  UserPlus,
  LogIn,
  Info,
  List,
  Zap,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

import logo2 from "../../assets/logo2.png";
import AdminLogin from "./Login";
import VerifyEmployeeModal from "../../pages/Public/VerifyEmployee"; // Import the new modal

const SECTIONS = ["home", "about", "steps", "values", "faq"];

export default function PublicNavbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showVerify, setShowVerify] = useState(false); // New state for verify modal
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll + navigate handler
  const scrollToSection = (id) => {
    setActiveSection(id);

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }

    setMobileOpen(false);
  };

  // Detect active section on scroll (home page only)
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.6 }
    );

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const navLinks = [
    { id: "home", label: "Home", icon: Home },
    { id: "about", label: "About", icon: Info },
    { id: "steps", label: "Steps", icon: List },
    { id: "values", label: "Values", icon: Zap },
    { id: "faq", label: "FAQ", icon: HelpCircle },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-white/95 shadow-lg border-b border-green-200"
            : "backdrop-blur-md bg-white/80 border-b border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* LOGO */}
          <button
            onClick={() => scrollToSection("home")}
            className="cursor-pointer flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src={logo2} alt="Logo" className="w-12 h-12 rounded-xl" />
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold text-gray-800">
                ID Generator
              </span>
              <span className="text-xs text-gray-500 font-medium -mt-1">
                by ARROWGO
              </span>
            </div>
          </button>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                activeSection === link.id && location.pathname === "/";
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`cursor-pointer px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-green-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </button>
              );
            })}

            {/* IDs to Claim */}
            <button
              onClick={() => navigate("/IDGenerated")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                location.pathname === "/IDGenerated"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <BadgeCheck className="h-4 w-4" />
              IDs to Claim
            </button>
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg px-5 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Admin Login
            </Button>

            <Button
              onClick={() => setShowVerify(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg px-5 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Verify & Register
            </Button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <Button
            variant="ghost"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 top-20 bg-black/20 backdrop-blur-sm z-30"
              onClick={() => setMobileOpen(false)}
            />

            <div className="lg:hidden fixed inset-x-0 top-20 z-40">
              <div className="mx-4 mt-2 rounded-2xl bg-white shadow-xl border border-gray-200">
                <div className="p-4 space-y-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive =
                      activeSection === link.id && location.pathname === "/";
                    return (
                      <button
                        key={link.id}
                        onClick={() => scrollToSection(link.id)}
                        className={`flex items-center gap-3 w-full h-12 px-4 rounded-lg text-base font-medium transition-all ${
                          isActive
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => {
                      navigate("/IDGenerated");
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full h-12 px-4 rounded-lg font-medium transition-all ${
                      location.pathname === "/IDGenerated"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <BadgeCheck className="h-5 w-5" />
                    IDs to Claim
                  </button>

                  <Separator className="my-3" />

                  <Button
                    onClick={() => {
                      setShowVerify(true);
                      setMobileOpen(false);
                    }}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg shadow-md flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Verify & Register
                  </Button>

                  <Button
                    onClick={() => {
                      setShowLogin(true);
                      setMobileOpen(false);
                    }}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md flex items-center justify-center gap-2"
                  >
                    <LogIn className="h-5 w-5" />
                    Admin Login
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* MODALS */}
      <AdminLogin open={showLogin} onOpenChange={setShowLogin} />
      <VerifyEmployeeModal open={showVerify} onOpenChange={setShowVerify} />
    </>
  );
}