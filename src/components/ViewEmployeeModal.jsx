import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  QrCode,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  ZoomIn,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ViewEmployeeModal({ employee, onClose }) {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [visibleIds, setVisibleIds] = useState({
    philhealth: false,
    sss: false,
    pagibig: false,
    tin: false,
  });

  const api = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!employee?.employee_id) {
      setLoading(false);
      return;
    }
    fetchEmployeeData();
  }, [employee?.employee_id]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        `${api}/api/employees/${employee.employee_id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setEmployeeData(response.data);
    } catch (err) {
      console.error("❌ Error fetching employee:", err);
      // Axios error handling
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch employee";
      setError(errorMessage);
      setEmployeeData(employee);
    } finally {
      setLoading(false);
    }
  };

  // Format government IDs according to Philippine standards
  const formatGovId = (value, type) => {
    if (!value) return null;

    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    switch (type) {
      case 'philhealth':
        // Format: XX-XXXXXXXXX-X (12 digits total)
        if (digits.length === 12) {
          return `${digits.slice(0, 2)}-${digits.slice(2, 11)}-${digits.slice(11)}`;
        }
        break;

      case 'sss':
        // Format: XX-XXXXXXX-X (10 digits total)
        if (digits.length === 10) {
          return `${digits.slice(0, 2)}-${digits.slice(2, 9)}-${digits.slice(9)}`;
        }
        break;

      case 'pagibig':
        // Format: XXXX-XXXX-XXXX (12 digits total)
        if (digits.length === 12) {
          return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
        }
        break;

      case 'tin':
        // Format: XXX-XXX-XXX-XXX (9-12 digits)
        if (digits.length >= 9) {
          const parts = [];
          for (let i = 0; i < digits.length; i += 3) {
            parts.push(digits.slice(i, i + 3));
          }
          return parts.join('-');
        }
        break;

      default:
        return value;
    }

    // Return original value if format doesn't match expected length
    return value;
  };

  const toggleIdVisibility = (idType) => {
    setVisibleIds(prev => ({
      ...prev,
      [idType]: !prev[idType]
    }));
  };

  if (!employee) return null;

  const data = employeeData || employee;
  const employeeId = data.employeeId || data.employee_id;
  const employeeName = data.employeeName || data.employee_name;
  const isClaimed = data.currentStatus === "claimed" || data.current_status === "claimed";

  return (
    <>
      <Dialog open={!!employee} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl w-[calc(100%-2rem)] sm:w-[95vw] max-h-[90vh] p-0 gap-0 flex flex-col">
          {/* Header */}
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 flex-shrink-0">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <Avatar
                  className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform shrink-0"
                  onClick={() => setZoomImage(`${api}/api/employees/${employeeId}/photo`)}
                >
                  <AvatarImage
                    src={`${api}/api/employees/${employeeId}/photo`}
                    alt={employeeName}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg sm:text-xl font-bold">
                    {employeeName?.split(" ").map(n => n[0]).join("").slice(0, 2) || "EMP"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 truncate">
                    {employeeName}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <Badge variant="outline" className="font-mono text-[10px] sm:text-xs">
                      ID: {employeeId}
                    </Badge>
                    <Badge variant={data.status === "active" ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                      {data.status}
                    </Badge>
                    {isClaimed ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100 text-[10px] sm:text-xs">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                        Claimed
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                        Not Claimed
                      </Badge>
                    )}
                  </div>
                  {data.position && (
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
                      {data.position}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Content Area with ScrollArea */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {loading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState error={error} onRetry={fetchEmployeeData} />
              ) : (
                <div className="p-4 sm:p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
                      <TabsTrigger value="overview" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                        <User className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Overview</span>
                        <span className="xs:hidden">Info</span>
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Documents</span>
                        <span className="xs:hidden">Docs</span>
                      </TabsTrigger>
                      <TabsTrigger value="ids" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">IDs</span>
                        <span className="xs:hidden">IDs</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Contact Information */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                              Contact Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 sm:space-y-4">
                            <InfoField
                              icon={<User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                              label="Contact Person"
                              value={data.contactPerson || data.contact_person}
                            />
                            <InfoField
                              icon={<Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                              label="Contact Number"
                              value={data.contactNumber || data.contact_number}
                            />
                            <InfoField
                              icon={<MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                              label="Position"
                              value={data.position}
                            />
                          </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                              Timeline
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 sm:space-y-4">
                            {(data.createdAt || data.created_at) && (
                              <InfoField
                                icon={<Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                label="Created"
                                value={new Date(data.createdAt || data.created_at).toLocaleString(
                                  "en-US",
                                  {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  }
                                )}
                              />
                            )}
                            {(data.claimedAt || data.claimed_at) && (
                              <InfoField
                                icon={<CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                label="Claimed At"
                                value={new Date(data.claimedAt || data.claimed_at).toLocaleString(
                                  "en-US",
                                  {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  }
                                )}
                              />
                            )}
                            {!isClaimed && (
                              <Alert className="text-xs sm:text-sm">
                                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <AlertDescription>
                                  This employee record has not been claimed yet.
                                </AlertDescription>
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-4 sm:space-y-6 mt-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Digital Signature */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                              Digital Signature
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div
                              className="relative group cursor-pointer rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 flex items-center justify-center min-h-[140px] sm:min-h-[180px]"
                              onClick={() => setZoomImage(`${api}/api/employees/${employeeId}/signature`)}
                            >
                              <img
                                src={`${api}/api/employees/${employeeId}/signature`}
                                className="max-w-full max-h-24 sm:max-h-32 object-contain"
                                alt="Signature"
                                onError={(e) => {
                                  e.target.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100'%3E%3Crect fill='%23f9fafb' width='200' height='100'/%3E%3Ctext fill='%239ca3af' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14'%3ENo Signature%3C/text%3E%3C/svg%3E";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="text-center text-white">
                                  <ZoomIn className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                                  <p className="text-xs sm:text-sm font-medium">Click to enlarge</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* QR Code */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                              <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                              QR Code
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div
                              className="relative group cursor-pointer rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all bg-white dark:bg-gray-900 p-4 sm:p-6 flex items-center justify-center min-h-[140px] sm:min-h-[180px]"
                              onClick={() => setZoomImage(`${api}/api/employees/${employeeId}/qr`)}
                            >
                              <img
                                src={`${api}/api/employees/${employeeId}/qr`}
                                className="w-28 h-28 sm:w-36 sm:h-36 object-contain"
                                alt="QR Code"
                                onError={(e) => {
                                  e.target.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Crect fill='%23ffffff' width='160' height='160'/%3E%3Ctext fill='%239ca3af' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14'%3ENo QR Code%3C/text%3E%3C/svg%3E";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="text-center text-white">
                                  <ZoomIn className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                                  <p className="text-xs sm:text-sm font-medium">Click to enlarge</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Alert className="text-xs sm:text-sm">
                        <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <AlertDescription>
                          Click on any image to view it in full size. These documents are
                          securely stored and encrypted.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>

                    {/* Government IDs Tab */}
                    <TabsContent value="ids" className="space-y-4 sm:space-y-6 mt-0">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                            Government-Issued IDs
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <SensitiveInfoCard
                              label="PhilHealth"
                              value={formatGovId(data.philhealth, 'philhealth')}
                              format="XX-XXXXXXXXX-X"
                              isVisible={visibleIds.philhealth}
                              onToggle={() => toggleIdVisibility('philhealth')}
                            />
                            <SensitiveInfoCard
                              label="SSS"
                              value={formatGovId(data.sss, 'sss')}
                              format="XX-XXXXXXX-X"
                              isVisible={visibleIds.sss}
                              onToggle={() => toggleIdVisibility('sss')}
                            />
                            <SensitiveInfoCard
                              label="Pag-IBIG"
                              value={formatGovId(data.pagibig, 'pagibig')}
                              format="XXXX-XXXX-XXXX"
                              isVisible={visibleIds.pagibig}
                              onToggle={() => toggleIdVisibility('pagibig')}
                            />
                            <SensitiveInfoCard
                              label="TIN"
                              value={formatGovId(data.tin, 'tin')}
                              format="XXX-XXX-XXX-XXX"
                              isVisible={visibleIds.tin}
                              onToggle={() => toggleIdVisibility('tin')}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Alert variant="destructive" className="text-xs sm:text-sm">
                        <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <AlertDescription>
                          <strong>Confidential Information:</strong> Government IDs are
                          encrypted and should be handled with care. Do not share this
                          information with unauthorized personnel.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Footer */}
          <Separator className="flex-shrink-0" />
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-end gap-2 sm:gap-3 bg-gray-50 dark:bg-slate-900 flex-shrink-0">
            <Button variant="outline" onClick={onClose} className="text-sm">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Modal */}
      {zoomImage && (
        <Dialog open={!!zoomImage} onOpenChange={() => setZoomImage(null)}>
          <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 bg-white dark:bg-slate-900 border-none">
            <div className="relative w-full h-[95vh] flex items-center justify-center p-4 sm:p-8">
              <img
                src={zoomImage}
                className="max-h-full max-w-full object-contain rounded-lg"
                alt="Zoomed view"
              />
              <Button
                onClick={() => setZoomImage(null)}
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 sm:top-4 sm:right-4 rounded-full h-8 w-8 sm:h-10 sm:w-10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

/* ==================== COMPONENTS ==================== */

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24">
      <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-600 mb-3 sm:mb-4" />
      <p className="text-muted-foreground text-sm sm:text-base">Loading employee data...</p>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4">
      <Alert variant="destructive" className="max-w-md text-xs sm:text-sm">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Error Loading Data:</strong> {error}
        </AlertDescription>
      </Alert>
      <Button onClick={onRetry} variant="outline" className="mt-4 sm:mt-6 gap-2 text-sm">
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );
}

function InfoField({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">
          {label}
        </p>
        <p className="text-xs sm:text-sm font-medium text-foreground break-words">
          {value || <span className="text-muted-foreground italic">Not provided</span>}
        </p>
      </div>
    </div>
  );
}

function SensitiveInfoCard({ label, value, format, isVisible, onToggle }) {
  const maskValue = (val) => {
    if (!val) return 'N/A';
    // Replace all characters except dashes with dots
    return val.replace(/[^-]/g, '•');
  };

  return (
    <div className="rounded-lg border bg-card p-3 sm:p-4 shadow-sm">
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            {isVisible ? (
              <EyeOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
            ) : (
              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
      <p className="text-xs sm:text-sm font-mono font-bold tracking-wide break-all">
        {value ? (
          isVisible ? (
            <span className="text-foreground">{value}</span>
          ) : (
            <span className="text-muted-foreground select-none">{maskValue(value)}</span>
          )
        ) : (
          <span className="text-muted-foreground italic font-sans font-normal">N/A</span>
        )}
      </p>
      {format && (
        <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 font-mono">
          Format: {format}
        </p>
      )}
    </div>
  );
}