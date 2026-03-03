import { useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function PhotoUploader({ onChange }) {
  const inputRef = useRef(null);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handlePhoto}
      />
      <Button size="sm" variant="outline" onClick={clearPhoto}>
        Remove Photo
      </Button>
    </div>
  );
}
