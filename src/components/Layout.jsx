import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  FolderKanban,
  ClipboardCheck,
  FileText,
  LogOut,
  ChevronRight,
  Menu,
  HelpCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import logo2 from "../assets/logo2.png";
import { NotificationBell } from "../components/Notification";
import { ThemeToggle } from "../components/ThemeToggle";
import HelpSupportModal from "../components/Report";
import { performLogout } from "../lib/api";

const BRAND = "#3ecf8e";
const BRAND_DARK = "#2aa876";

const navItems = [
  { to: "/adminRoutes/Dashboard",    icon: LayoutDashboard, label: "Dashboard"     },
  { to: "/adminRoutes/idCreator",    icon: BarChart3,        label: "Generate ID"   },
  { to: "/adminRoutes/EmployeeList", icon: FolderKanban,     label: "Employee List" },
  { to: "/adminRoutes/Claims",       icon: ClipboardCheck,   label: "Claims"        },
  { to: "/adminRoutes/Applications", icon: FileText,         label: "Applications"  },
];

function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 select-none ${
          isActive
            ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-emerald-500 dark:bg-emerald-400" />
          )}
          <item.icon
            size={17}
            className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
              isActive ? "text-emerald-500 dark:text-emerald-400" : ""
            }`}
          />
          <span className="truncate flex-1">{item.label}</span>
          {isActive && <ChevronRight size={13} className="opacity-40 flex-shrink-0" />}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ user, onSignOut, isSigningOut, onHelp, closeSidebar }) {
  return (
    <div className="flex h-full flex-col bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <div className="relative flex-shrink-0">
          <div
            className="absolute inset-0 rounded-xl blur-lg opacity-50"
            style={{ background: BRAND }}
          />
          <div
            className="relative flex h-9 w-9 items-center justify-center rounded-xl shadow-lg"
            style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
          >
            <img src={logo2} alt="Arrowgo" className="h-5 w-5 object-contain" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[15px] font-black tracking-tight leading-none"
            style={{
              background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Arrowgo
          </p>
          <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Logistics Inc.</p>
        </div>
        <Badge className="text-[9px] px-1.5 h-5 font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 shadow-none flex-shrink-0">
          Admin
        </Badge>
      </div>

      <Separator />

      {/* User card */}
      <div className="px-3 py-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-accent transition-colors duration-150 text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
              <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-emerald-200 dark:ring-emerald-800/60">
                <AvatarFallback
                  className="text-[11px] font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
                >
                  {(user.name?.charAt(0) || user.username?.charAt(0) || "A").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate leading-snug">
                  {user.name || user.username}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{user.role || "Administrator"}</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-card flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={6} className="w-52">
            <DropdownMenuLabel className="font-normal pb-1.5">
              <p className="text-sm font-semibold">{user.name || user.username}</p>
              <p className="text-xs text-muted-foreground">{user.role || "Administrator"}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onSignOut}
              disabled={isSigningOut}
              className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/40"
            >
              <LogOut size={14} className={isSigningOut ? "animate-spin" : ""} />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator />

      {/* Nav */}
      <ScrollArea className="flex-1">
        <div className="px-3 pt-3 pb-2 space-y-4">
          {/* Main nav */}
          <div>
            <p className="mb-1.5 px-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
              Main Menu
            </p>
            <nav className="space-y-0.5">
              {navItems.map((item) => (
                <NavItem key={item.to} item={item} onClick={closeSidebar} />
              ))}
            </nav>
          </div>

          <Separator className="opacity-40" />

          {/* Quick actions */}
          <div>
            <p className="mb-1.5 px-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
              Support
            </p>
            <button
              onClick={() => { onHelp(); closeSidebar?.(); }}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
            >
              <HelpCircle size={17} className="flex-shrink-0 group-hover:scale-105 transition-transform duration-200" />
              <span>Help & Support</span>
            </button>
          </div>

          {/* Info card */}
          <div className="rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={12} className="text-emerald-500" />
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Admin Access</p>
            </div>
            <p className="text-[10px] leading-relaxed text-emerald-600/70 dark:text-emerald-400/60">
              You have standard admin privileges for Arrowgo operations.
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* Sign out */}
      <div className="p-3 border-t bg-card">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-300 font-semibold h-10"
          onClick={onSignOut}
          disabled={isSigningOut}
        >
          <LogOut size={15} className={`flex-shrink-0 ${isSigningOut ? "animate-spin" : ""}`} />
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [user, setUser] = useState({});
  const [isSigningOut, setIsSigningOut] = useState(false);
  const timerRef = useRef(null);
  const warnedRef = useRef(false);

  const getTokenExpiry = (token) => {
    try { return JSON.parse(atob(token.split(".")[1])).exp * 1000; }
    catch { return null; }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) { navigate("/"); return; }
    setUser(JSON.parse(storedUser));
    const expiresAt = getTokenExpiry(token);
    if (!expiresAt) { navigate("/"); return; }
    warnedRef.current = false;
    const msUntilExpiry = expiresAt - Date.now();
    if (msUntilExpiry <= 0) { performLogout(); return; }
    const warnAt = msUntilExpiry - 60_000;
    if (warnAt > 0) {
      timerRef.current = setTimeout(() => {
        if (!warnedRef.current) { warnedRef.current = true; alert("Your session will expire in 1 minute. Please save your work!"); }
      }, warnAt);
    }
    const expireTimer = setTimeout(() => { console.warn("⏰ Token expired"); performLogout(); }, msUntilExpiry);
    return () => { clearTimeout(timerRef.current); clearTimeout(expireTimer); };
  }, [navigate]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    document.documentElement.classList.remove("dark");
    await performLogout();
  };

  const sharedProps = {
    user,
    onSignOut: handleSignOut,
    isSigningOut,
    onHelp: () => setHelpModalOpen(true),
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">

        {/* Ambient background */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 70% 50% at 10% -10%, ${BRAND}1a 0%, transparent 55%),
              radial-gradient(ellipse 50% 40% at 90% 110%, ${BRAND}12 0%, transparent 55%)
            `,
          }}
        />

        {/* Desktop sidebar */}
        <aside className="hidden sm:flex fixed inset-y-0 left-0 z-40 w-[240px] flex-col border-r shadow-sm">
          <SidebarContent {...sharedProps} closeSidebar={() => {}} />
        </aside>

        {/* Mobile sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[240px] p-0 border-r">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent {...sharedProps} closeSidebar={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Content area */}
        <div className="flex flex-1 flex-col sm:pl-[240px] min-w-0">

          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-xl px-4 shadow-sm">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden h-8 w-8 rounded-lg"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </Button>

            {/* Mobile logo */}
            <div className="flex items-center gap-2 sm:hidden">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
              >
                <img src={logo2} alt="Arrowgo" className="h-4 w-4 object-contain" />
              </div>
              <span
                className="font-black text-[13px]"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Arrowgo
              </span>
            </div>

            {/* Desktop greeting */}
            <div className="hidden sm:flex items-center gap-2">
              <Zap size={14} className="text-emerald-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-foreground">
                Welcome back,{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {user.name?.split(" ")[0] || "Admin"}
                </span>
              </p>
            </div>

            <div className="flex-1" />

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              <NotificationBell />
              <Separator orientation="vertical" className="h-5 opacity-40 mx-0.5" />
              <ThemeToggle />

              {/* Desktop avatar dropdown */}
              <div className="hidden sm:block ml-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2">
                      <Avatar className="h-8 w-8 ring-2 ring-emerald-200 dark:ring-emerald-800/60 hover:ring-emerald-400 dark:hover:ring-emerald-500 transition-all duration-200 cursor-pointer">
                        <AvatarFallback
                          className="text-[10px] font-bold text-white"
                          style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
                        >
                          {(user.name?.charAt(0) || user.username?.charAt(0) || "A").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-semibold">{user.name || user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.role || "Administrator"}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
                    >
                      <LogOut size={14} />
                      {isSigningOut ? "Signing out..." : "Sign out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>

        <HelpSupportModal open={helpModalOpen} onOpenChange={setHelpModalOpen} />
      </div>
    </TooltipProvider>
  );
}