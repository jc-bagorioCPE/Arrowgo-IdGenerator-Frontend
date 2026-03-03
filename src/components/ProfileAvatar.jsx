import { Camera, User, CheckCircle, AlertCircle } from "lucide-react";

export default function ProfileAvatar({
  photo,
  employee,
  saved,
  onAddPhoto,
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-blue-100 to-purple-100">
          {photo ? (
            <img src={photo} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        {!saved && (
          <button
            onClick={onAddPhoto}
            className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all group-hover:scale-110"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      <h2 className="mt-4 text-2xl font-bold text-gray-800">
        {employee.employee_name}
      </h2>

      <div className="mt-2 px-4 py-1 bg-blue-100 rounded-full">
        <p className="text-sm font-mono font-bold text-blue-700">
          {employee.employee_id}
        </p>
      </div>

      <div
        className={`mt-4 px-4 py-2 rounded-xl flex items-center gap-2 ${
          saved
            ? "bg-green-100 border border-green-300"
            : "bg-yellow-100 border border-yellow-300"
        }`}
      >
        {saved ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">Verified</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-700">Pending</span>
          </>
        )}
      </div>
    </div>
  );
}
