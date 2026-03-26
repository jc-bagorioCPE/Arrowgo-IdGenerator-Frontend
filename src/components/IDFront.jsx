import { useState } from "react";
import front from "../assets/arrow1.png";

function IdFront({
  employeeName,
  position,
  employeeId,
  signatureDraw,
  signatureUpload,
  photo,
  photoOffsetX = 0,
  photoOffsetY = 0,       // Reset offset — we control position directly
  photoWidth = "2.1in",   // Wider than before (was 1.7in)
  photoHeight = "2.6in",  // Taller than before (was 2.2in)
}) {
  const signature = signatureDraw || signatureUpload;

  const MAX_SIGNATURE_WIDTH = 200;
  const MAX_SIGNATURE_HEIGHT = 60;

  const [signatureStyle, setSignatureStyle] = useState({
    width: MAX_SIGNATURE_WIDTH,
    height: "auto",
  });

  const handleSignatureLoad = (e) => {
    const img = e.target;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const aspectRatio = naturalWidth / naturalHeight;

    let finalWidth = naturalWidth;
    let finalHeight = naturalHeight;

    if (naturalWidth > MAX_SIGNATURE_WIDTH) {
      finalWidth = MAX_SIGNATURE_WIDTH;
      finalHeight = finalWidth / aspectRatio;
    }

    if (finalHeight > MAX_SIGNATURE_HEIGHT) {
      finalHeight = MAX_SIGNATURE_HEIGHT;
      finalWidth = finalHeight * aspectRatio;
    }

    setSignatureStyle({
      width: `${finalWidth}px`,
      height: `${finalHeight}px`,
    });
  };

  return (
    <div className="relative w-full h-full">
      {/* 🖼 Employee Photo – larger, higher, centered in the logo circle */}
      {photo && (
        <img
          src={photo}
          alt="Employee"
          className="absolute object-cover object-top"
          style={{
            top: `calc(40px + ${photoOffsetY}px)`,   // Moved up (was 80px)
            left: `calc(50% + ${photoOffsetX}px)`,
            transform: "translateX(-50%)",
            width: photoWidth,
            height: photoHeight,
            clipPath: "circle(55%)",                  // Slightly tighter clip
          }}
        />
      )}

      {/* 🔷 Background Overlay */}
      <img
        src={front}
        alt="Company Template"
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      />

      {/* ✍ Signature */}
      {signature && (
        <img
          src={signature}
          onLoad={handleSignatureLoad}
          alt="Signature"
          className="absolute"
          style={{
            width: signatureStyle.width,
            height: signatureStyle.height,
            pointerEvents: "none",
            top: "395px",
            left: "50%",
            transform: "translateX(-50%)",
            objectFit: "contain",
          }}
        />
      )}

      {/* 👤 Employee Name */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[86%] text-center text-black font-bold tracking-wide uppercase"
        style={{ top: "430px", fontSize: "16px" }}
      >
        {employeeName}
      </div>

      {/* 📌 Position */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[70%] text-center text-black font-bold"
        style={{ top: "453px", fontSize: "12px" }}
      >
        {position}
      </div>

      {/* 🆔 Employee ID */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[86%] text-center text-black font-medium tracking-widest"
        style={{ top: "472px", fontSize: "11px" }}
      >
        {employeeId}
      </div>
    </div>
  );
}

export default IdFront;