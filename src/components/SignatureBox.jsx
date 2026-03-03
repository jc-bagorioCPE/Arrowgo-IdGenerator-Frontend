import { PenTool, Edit } from "lucide-react";

export default function SignatureBox({ signature, saved, onClick }) {
  return (
    <div
      onClick={!saved ? onClick : undefined}
      className={`relative border-2 rounded-xl p-4 bg-white transition-all ${
        !saved
          ? "cursor-pointer hover:border-purple-400 hover:shadow-lg"
          : "border-gray-200"
      }`}
    >
      {signature ? (
        <img src={signature} className="h-32 w-full object-contain" />
      ) : (
        <div className="h-32 flex flex-col items-center justify-center text-gray-400">
          <PenTool className="h-8 w-8 mb-2" />
          <p className="text-sm font-medium">Click to add</p>
        </div>
      )}

      {!saved && (
        <div className="absolute bottom-2 right-2 p-2 bg-purple-100 rounded-lg">
          <Edit className="h-4 w-4 text-purple-600" />
        </div>
      )}
    </div>
  );
}
