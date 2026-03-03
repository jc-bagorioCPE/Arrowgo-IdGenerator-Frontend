import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

export default function PhotoDialog({ open, onOpenChange, onCamera, onUpload }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Photo</DialogTitle>
          <DialogDescription>
            Choose how you'd like to add your photo
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 pt-4">
          <Button onClick={onCamera} className="h-14 text-lg">
            <Camera className="mr-2" /> Use Camera
          </Button>

          <Button variant="outline" onClick={onUpload} className="h-14 text-lg">
            <Upload className="mr-2" /> Upload Photo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
