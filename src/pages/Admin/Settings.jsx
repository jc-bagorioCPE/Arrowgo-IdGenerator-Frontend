import { useEffect, useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Shield, 
  Save,
  X,
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import AccountSettings from "../../components/AccountSettings";
import CreateAdminForm from "../Admin/CreateAccount";

export default function SettingsModal({ open, onOpenChange }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id || 1;
  
  const [settings, setSettings] = useState({
    language: "en",
    timezone: "Asia/Manila",
    auto_logout: 30,
    session_timeout: 60,
    two_factor_enabled: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState("account");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
 
  // Fetch user settings when modal opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      api
        .get(`/api/settings/${userId}`)
        .then((res) => {
          setSettings((prev) => ({ ...prev, ...res.data }));
          setHasUnsavedChanges(false);
        })
        .catch((err) => {
          console.error("Failed to fetch settings:", err);
          setSaveStatus('error');
          setSaveMessage("Failed to load settings. Please try again.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [open, userId]);

  // Reset save status after 4 seconds
  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => {
        setSaveStatus(null);
        setSaveMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    setSaveMessage("");

    try {
      await api.post(
        `/api/settings/${userId}`,
        settings
      );
      
      setSaveStatus('success');
      setSaveMessage("Settings saved successfully!");
      setHasUnsavedChanges(false);
      
      // Auto-close after successful save
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setSaveStatus('error');
      setSaveMessage(err.response?.data?.message || "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onOpenChange(false);
        setHasUnsavedChanges(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  const tabs = [
    {
      value: "account",
      label: "Account",
      icon: User,
      description: "Manage administrators and security",
      component: <AccountSettings />,
    },
    {
      value: "create",
      label: "Create Admin",
      icon: Shield,
      description: "Add new administrator",
      component: <CreateAdminForm />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl xl:max-w-7xl w-full max-h-[95vh] p-0 overflow-hidden gap-0">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-900 border-b px-6 py-5">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
                  <SettingsIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Settings
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Manage your account preferences and security settings
                  </DialogDescription>
                </div>
              </div>
              
              {/* Unsaved Changes Indicator */}
              <AnimatePresence>
                {hasUnsavedChanges && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium"
                  >
                    <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                    Unsaved changes
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-[calc(95vh-120px)] overflow-hidden">
          
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 xl:w-72 border-b lg:border-b-0 lg:border-r bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              orientation="vertical"
              className="w-full"
            >
              <TabsList className="flex flex-row lg:flex-col w-full h-auto bg-transparent p-3 gap-1.5 overflow-x-auto lg:overflow-x-visible">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="group relative w-auto lg:w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm rounded-xl transition-all whitespace-nowrap"
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-md"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      
                      {/* Content */}
                      <div className="relative flex items-center gap-3 w-full">
                        <div className={`p-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-700'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="hidden lg:block text-left flex-1">
                          <div className={`font-semibold text-sm ${
                            isActive 
                              ? 'text-slate-900 dark:text-slate-100' 
                              : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {tab.label}
                          </div>
                          <div className={`text-xs ${
                            isActive 
                              ? 'text-slate-600 dark:text-slate-400' 
                              : 'text-slate-500 dark:text-slate-500'
                          }`}>
                            {tab.description}
                          </div>
                        </div>
                        <span className="lg:hidden font-medium text-sm">
                          {tab.label}
                        </span>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Loading settings...</p>
                </div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
                {tabs.map((tab) => (
                  <TabsContent 
                    key={tab.value} 
                    value={tab.value}
                    className="m-0 h-full p-6 data-[state=inactive]:hidden"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={tab.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        {tab.component}
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </div>


      </DialogContent>
    </Dialog>
  );
}