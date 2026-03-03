import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  X,
  Check,
  RotateCcw,
} from "lucide-react";

/* ================= CAMERA GUIDE COMPONENT ================= */
export default function CameraGuide({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [facing, setFacing] = useState("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  useEffect(() => {
    checkCameras();
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facing]);

  const checkCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    } catch (err) {
      console.error("Error checking cameras:", err);
    }
  };

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Check if running on HTTPS or localhost
      const isSecureContext = window.isSecureContext ||
        location.protocol === 'https:' ||
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1';

      if (!isSecureContext) {
        alert("Camera access requires HTTPS. Please use HTTPS or localhost to access the camera.");
        onCancel();
        return;
      }

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera access is not supported in this browser. Please try Chrome, Safari, or Firefox.");
        onCancel();
        return;
      }

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);

      let errorMessage = "Unable to access camera. ";

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += "Please allow camera access in your browser settings.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += "No camera found on this device.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += "Camera is already in use by another application.";
      } else if (err.name === 'TypeError') {
        errorMessage += "Camera access requires HTTPS. Please use a secure connection.";
      } else {
        errorMessage += "Error: " + err.message + ". Try using HTTPS or check camera permissions.";
      }

      alert(errorMessage);
      onCancel();
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    setPhoto(imageData);
    setCaptured(true);
  };

  const retake = () => {
    setCaptured(false);
    setPhoto(null);
  };

  const confirm = () => {
    if (photo) {
      onCapture(photo);
    }
  };

  const switchCamera = async () => {
    try {
      // Stop current stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Switch facing mode
      const newFacing = facing === "user" ? "environment" : "user";
      setFacing(newFacing);
      setCaptured(false);
      setPhoto(null);

      // Start new camera with updated facing mode
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error switching camera:", err);
      alert("Unable to switch camera. This device may only have one camera.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>

          <h3 className="text-white font-bold text-lg">
            {facing === "user" ? "Front Camera" : "Back Camera"}
          </h3>

          <Button
            variant="ghost"
            size="icon"
            onClick={switchCamera}
            className="text-white hover:bg-white/20"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {!captured ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: facing === "user" ? 'scaleX(-1)' : 'none' }}
            />

            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <mask id="guideMask">
                  <rect width="100" height="100" fill="white" />
                  <ellipse cx="50" cy="30" rx="22" ry="15" fill="black" />
                </mask>
              </defs>

              {/* Dark overlay with cutout */}
              <rect
                width="100"
                height="100"
                fill="black"
                opacity="0.6"
                mask="url(#guideMask)"
              />

              {/* Main head oval guide - white solid */}
              <ellipse
                cx="50"
                cy="30"
                rx="22"
                ry="15"
                fill="none"
                stroke="white"
                strokeWidth="0.4"
                opacity="1"
              />

              {/* Inner reference oval */}
              <ellipse
                cx="50"
                cy="30"
                rx="22"
                ry="15"
                fill="none"
                stroke="white"
                strokeWidth="0.2"
                strokeDasharray="1,0.5"
                opacity="0.5"
              />

              {/* Eye level guide - horizontal line */}
              <line
                x1="30"
                y1="25"
                x2="70"
                y2="25"
                stroke="#00ff00"
                strokeWidth="0.3"
                opacity="0.8"
              />
              <text x="23" y="23" fill="#00ff00" fontSize="2.5" opacity="0.8">Eyes</text>

              {/* Nose/mouth level guide */}
              <line
                x1="35"
                y1="32"
                x2="65"
                y2="32"
                stroke="#ffff00"
                strokeWidth="0.2"
                strokeDasharray="1,0.5"
                opacity="0.6"
              />

              {/* Chin guide */}
              <line
                x1="35"
                y1="40"
                x2="65"
                y2="40"
                stroke="#ff9900"
                strokeWidth="0.3"
                opacity="0.7"
              />
              <text x="69" y="40" fill="#ff9900" fontSize="2.5" opacity="0.8">Chin</text>

              {/* Shoulder guidelines - more accurate */}
              <line
                x1="21"
                y1="48"
                x2="45"
                y2="52"
                stroke="white"
                strokeWidth="0.4"
                opacity="0.8"
              />
              <line
                x1="80"
                y1="48"
                x2="55"
                y2="52"
                stroke="white"
                strokeWidth="0.4"
                opacity="0.8"
              />

              {/* Center vertical alignment */}
              <line
                x1="50"
                y1="15"
                x2="50"
                y2="75"
                stroke="#00ffff"
                strokeWidth="0.2"
                strokeDasharray="2,1"
                opacity="0.5"
              />

              {/* Top of head marker */}
              <circle cx="50" cy="15" r="0.8" fill="#00ff00" opacity="0.8" />
              <text x="52" y="16" fill="#00ff00" fontSize="2" opacity="0.8">Top</text>

              {/* Corner guides for frame alignment */}
              <line x1="15" y1="15" x2="20" y2="15" stroke="white" strokeWidth="0.3" opacity="0.6" />
              <line x1="15" y1="15" x2="15" y2="20" stroke="white" strokeWidth="0.3" opacity="0.6" />

              <line x1="85" y1="15" x2="80" y2="15" stroke="white" strokeWidth="0.3" opacity="0.6" />
              <line x1="85" y1="15" x2="85" y2="20" stroke="white" strokeWidth="0.3" opacity="0.6" />

              <line x1="15" y1="85" x2="20" y2="85" stroke="white" strokeWidth="0.3" opacity="0.6" />
              <line x1="15" y1="85" x2="15" y2="80" stroke="white" strokeWidth="0.3" opacity="0.6" />

              <line x1="85" y1="85" x2="80" y2="85" stroke="white" strokeWidth="0.3" opacity="0.6" />
              <line x1="85" y1="85" x2="85" y2="80" stroke="white" strokeWidth="0.3" opacity="0.6" />
            </svg>

            <div className="absolute bottom-32 left-0 right-0 px-6">
              <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto border border-white/20">
                <p className="text-white text-center text-sm font-bold mb-2">
                  📸 Positioning Guide
                </p>
                <div className="space-y-1 text-xs">
                  <p className="text-green-400">• Align eyes with <span className="font-bold">green line</span></p>
                  <p className="text-orange-400">• Position chin on <span className="font-bold">orange line</span></p>
                  <p className="text-cyan-400">• Keep face centered on <span className="font-bold">cyan line</span></p>
                  <p className="text-white/80">• Shoulders should be visible at bottom</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <img
            src={photo}
            alt="Captured"
            className="w-full h-full object-cover"
            style={{ transform: facing === "user" ? 'scaleX(-1)' : 'none' }}
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8">
        <div className="flex items-center justify-center gap-6">
          {captured ? (
            <>
              <Button
                onClick={retake}
                size="lg"
                variant="outline"
                className="h-14 px-8 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Retake
              </Button>
              <Button
                onClick={confirm}
                size="lg"
                className="h-14 px-8 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-5 w-5 mr-2" />
                Use Photo
              </Button>
            </>
          ) : (
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 hover:bg-gray-100 transition-all active:scale-95 shadow-lg"
            >
              <div className="w-full h-full rounded-full border-2 border-gray-400 flex items-center justify-center">
                <Camera className="h-8 w-8 text-gray-700" />
              </div>
            </button>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}