import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  Camera,
  Upload,
  Check,
  X,
  User,
  Briefcase,
  Phone,
  Users,
  Heart,
  CreditCard,
  Home,
  FileText,
  Edit,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  PenTool,
} from "lucide-react";
import CameraGuide from "../../components/CameraGuide";
import axios from "axios";


/* ================= MAIN COMPONENT ================= */
export default function UserInfo() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [signature, setSignature] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [showCameraGuide, setShowCameraGuide] = useState(false);
  const sigRef = useRef(null);
  const uploadInputRef = useRef(null);

  const api = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${api}/api/employees/${id}`);
        const data = res.data;
        if (!data?.employeeId) {
          setEmployee(null);
          return;
        }
        setEmployee(data);
        let hasPhoto = false;
        let hasSignature = false;
        try {
          const photoRes = await axios.get(`${api}/api/employees/${id}/photo`, {
            responseType: "blob",
          });
          setPhoto(URL.createObjectURL(photoRes.data));
          hasPhoto = true;
        } catch (err) {
          console.log("No photo found");
        }
        try {
          const sigRes = await axios.get(`${api}/api/employees/${id}/signature`, {
            responseType: "blob",
          });
          setSignature(URL.createObjectURL(sigRes.data));
          hasSignature = true;
        } catch (err) {
          console.log("No signature found");
        }
        setSaved(hasPhoto && hasSignature);
      } catch (err) {
        console.error("Fetch error:", err);
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (photoData) => {
    setPhoto(photoData);
    setShowCameraGuide(false);
  };

  const handleCameraCancel = () => {
    setShowCameraGuide(false);
  };

  const getPos = (e) => {
    const canvas = sigRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const ctx = sigRef.current.getContext("2d");
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const ctx = sigRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    if (!drawing) return;
    setDrawing(false);
    setSignature(sigRef.current.toDataURL("image/png"));
  };

  const clearSignature = () => {
    const canvas = sigRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const uploadSignature = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSignature(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`${api}/api/employees/${id}/media`, {
        photoBase64: photo,
        signatureBase64: signature,
      });
      alert("Photo & Signature saved successfully!");
      setSaved(true);
    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err.message);
      alert("Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-red-200">
          <CardContent className="p-6 sm:p-8 text-center">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
            <p className="text-sm sm:text-base text-gray-600">The requested employee information could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const infoSections = [
    {
      title: "Employee Information",
      icon: User,
      items: [
        { label: "Position", value: employee.position, icon: Briefcase },
        { label: "Contact Person", value: employee.contactPerson, icon: Users },
        { label: "Contact Number", value: employee.contactNumber, icon: Phone },
      ],
    },
    {
      title: "Government IDs",
      icon: FileText,
      items: [
        { label: "PhilHealth", value: employee.philhealth, icon: Heart },
        { label: "SSS", value: employee.sss, icon: CreditCard },
        { label: "Pag-IBIG", value: employee.pagibig, icon: Home },
        { label: "TIN", value: employee.tin, icon: FileText },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-6">
      {/* Background decorative elements - hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full mb-3 sm:mb-4 shadow-lg border border-blue-200">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span className="text-xs sm:text-sm font-bold text-blue-700 tracking-wide">EMPLOYEE PROFILE</span>
          </div>
          {saved && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 bg-green-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-green-300"
            >
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <span className="text-xs sm:text-sm font-bold text-green-700">Profile Complete</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl sm:shadow-2xl border-2 border-blue-200 rounded-2xl sm:rounded-3xl overflow-hidden">
            {/* Header gradient - reduced height on mobile */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-20 sm:h-32" />
            
            <CardContent className="p-4 sm:p-8 -mt-12 sm:-mt-16">
              {/* Mobile: Single column stack */}
              {/* Desktop: 3-column grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
                
                {/* Profile Photo Section */}
                <div className="lg:col-span-3">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="relative group">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-blue-100 to-purple-100">
                        {photo ? (
                          <img src={photo} className="w-full h-full object-cover" alt="Employee" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      {!saved && (
                        <button
                          onClick={() => setShowPhotoDialog(true)}
                          className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-full flex items-center justify-center shadow-lg transition-all"
                          aria-label="Add photo"
                        >
                          <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </button>
                      )}
                    </div>
                    <h2 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-bold text-gray-800 px-2">
                      {employee.employeeName}
                    </h2>
                    <div className="mt-2 px-3 sm:px-4 py-1 bg-blue-100 rounded-full">
                      <p className="text-xs sm:text-sm font-mono font-bold text-blue-700">
                        {employee.employeeId}
                      </p>
                    </div>
                    <div className={`mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center gap-2 ${
                      saved ? "bg-green-100 border border-green-300" : "bg-yellow-100 border border-yellow-300"
                    }`}>
                      {saved ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-xs sm:text-sm font-semibold text-green-700">Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-xs sm:text-sm font-semibold text-yellow-700">Pending</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Information Sections */}
                <div className="lg:col-span-6 space-y-4 sm:space-y-6">
                  {infoSections.map((section, sectionIdx) => {
                    const SectionIcon = section.icon;
                    return (
                      <motion.div
                        key={sectionIdx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + sectionIdx * 0.1 }}
                      >
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
                          <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                            <SectionIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            {section.title}
                          </h3>
                          <div className="space-y-2 sm:space-y-3">
                            {section.items.map((item, idx) => {
                              const ItemIcon = item.icon;
                              return (
                                <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl hover:shadow-md transition-shadow">
                                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                      <ItemIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                                    </div>
                                    <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">{item.label}</span>
                                  </div>
                                  <span className="font-semibold text-xs sm:text-sm text-gray-800 ml-2 flex-shrink-0">{item.value || "-"}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Signature Section */}
                <div className="lg:col-span-3">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3 sm:space-y-4"
                  >
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-100">
                      <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                        <PenTool className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                        Signature
                      </h3>
                      <div
                        onClick={() => !saved && setShowSignatureDialog(true)}
                        className={`relative border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-white transition-all ${
                          !saved ? "cursor-pointer hover:border-purple-400 active:border-purple-500 hover:shadow-lg" : "border-gray-200"
                        }`}
                      >
                        {signature ? (
                          <img src={signature} className="h-24 sm:h-32 w-full object-contain" alt="Signature" />
                        ) : (
                          <div className="h-24 sm:h-32 flex flex-col items-center justify-center text-gray-400">
                            <PenTool className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
                            <p className="text-xs sm:text-sm font-medium">Tap to add</p>
                          </div>
                        )}
                        {!saved && (
                          <div className="absolute bottom-2 right-2">
                            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                              <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Save Button */}
                    {!saved && (
                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                          className="w-full h-12 sm:h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:from-green-800 active:to-emerald-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                          onClick={handleSave}
                          disabled={!photo || !signature || saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                              Save Information
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Add Photo
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Choose how you'd like to add your photo
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 pt-4">
            <Button
              onClick={() => {
                setShowPhotoDialog(false);
                setShowCameraGuide(true);
              }}
              className="h-12 sm:h-14 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 flex items-center gap-2 sm:gap-3"
            >
              <Camera className="h-5 w-5" />
              Use Camera
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowPhotoDialog(false);
                setTimeout(() => uploadInputRef.current?.click(), 200);
              }}
              className="h-12 sm:h-14 text-base sm:text-lg border-2 flex items-center gap-2 sm:gap-3"
            >
              <Upload className="h-5 w-5" />
              Upload Photo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signature Dialog */}
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="sm:max-w-2xl w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <PenTool className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              Add Signature
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Draw your signature or upload an image
            </DialogDescription>
          </DialogHeader>
          <div className="border-2 border-gray-300 rounded-xl p-2 bg-white touch-none">
            <canvas
              ref={sigRef}
              width={700}
              height={250}
              className="w-full h-48 sm:h-64 touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
              style={{ touchAction: 'none' }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pt-4">
            <Button
              variant="outline"
              onClick={clearSignature}
              className="flex items-center gap-2 border-2 h-10 sm:h-auto px-3 sm:px-4 text-sm sm:text-base"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
            <label className="flex items-center gap-2 px-3 sm:px-4 py-2 border-2 rounded-lg cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors h-10 sm:h-auto text-sm sm:text-base">
              <Upload className="h-4 w-4" />
              <span className="font-medium">Upload</span>
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={uploadSignature}
              />
            </label>
            <Button
              onClick={() => setShowSignatureDialog(false)}
              className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 flex items-center gap-2 h-10 sm:h-auto px-3 sm:px-4 text-sm sm:text-base"
            >
              <Check className="h-4 w-4" />
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Guide */}
      {showCameraGuide && (
        <CameraGuide
          onCapture={handleCameraCapture}
          onCancel={handleCameraCancel}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handlePhoto}
      />
    </div>
  );
}