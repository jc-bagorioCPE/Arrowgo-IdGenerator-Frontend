import { useRef, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function SignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [size, setSize] = useState({ width: 200, height: 60 });
  let drawing = false;

  useEffect(() => {
    if (!uploadedImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = uploadedImage;

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, size.width, size.height);
      onChange(canvas.toDataURL("image/png"));
    };
  }, [uploadedImage, size, onChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(0,0,0,0.9)";
    ctx.lineCap = "round";

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      return { x, y };
    };

    const start = (e) => {
      if (uploadedImage) return;
      drawing = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e) => {
      if (!drawing || uploadedImage) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const end = () => {
      if (!drawing || uploadedImage) return;
      drawing = false;
      onChange(canvas.toDataURL("image/png"));
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", end);
    canvas.addEventListener("mouseleave", end);

    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", end);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", end);
      canvas.removeEventListener("mouseleave", end);

      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", end);
    };
  }, [uploadedImage, onChange]);

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setUploadedImage(null);
    onChange(null);
  };

  const uploadSignature = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2 w-full">

      <canvas
        ref={canvasRef}
        width={260}
        height={90}
        className="border bg-white rounded-md w-full touch-none cursor-crosshair"
      />

      <div className="flex justify-between items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          Clear Signature
        </Button>

        <Input
          type="file"
          accept="image/*"
          className="w-40 cursor-pointer"
          onChange={uploadSignature}
        />
      </div>

      {uploadedImage && (
        <div className="flex flex-col gap-2">
          {/* Width Slider */}
          <div className="flex items-center gap-2">
            <label className="text-sm w-20">Width</label>
            <input
              type="range"
              min="50"
              max="260"
              value={size.width}
              onChange={(e) => setSize((s) => ({ ...s, width: Number(e.target.value) }))}
              className="w-full"
            />
          </div>

          {/* Height Slider */}
          <div className="flex items-center gap-2">
            <label className="text-sm w-20">Height</label>
            <input
              type="range"
              min="20"
              max="120"
              value={size.height}
              onChange={(e) => setSize((s) => ({ ...s, height: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
