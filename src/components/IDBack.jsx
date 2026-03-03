export default function IdBack({ contactPerson, contactNumber, qrCodeFile, philhealth, sss, pagibig, tin }) {
  return (
    <div className="absolute inset-0">

      {/* Government IDs — positioned inside the table boxes on the template */}
      <div
        className="absolute w-[55%]"
        style={{
          top: "46px",
          left: "50%",
        }}
      >
        {/* PhilHealth value */}
        <div style={{ height: "28px", display: "flex", alignItems: "center" }}>
          <span className="text-[12px] font-semibold text-black font-mono">
            {philhealth || ""}
          </span>
        </div>

        {/* SSS value */}
        <div style={{ height: "26px", display: "flex", alignItems: "center" }}>
          <span className="text-[12px] font-semibold text-black font-mono">
            {sss || ""}
          </span>
        </div>

        {/* Pag-IBIG value */}
        <div style={{ height: "26px", display: "flex", alignItems: "center" }}>
          <span className="text-[12px] font-semibold text-black font-mono">
            {pagibig || ""}
          </span>
        </div>

        {/* TIN value */}
        <div style={{ height: "28px", display: "flex", alignItems: "center" }}>
          <span className="text-[12px] font-semibold text-black font-mono">
            {tin || ""}
          </span>
        </div>
      </div>

      {/* QR Code */}
      {qrCodeFile ? (
        <img
          src={URL.createObjectURL(qrCodeFile)}
          alt="QR Code"
          className="absolute w-30 h-30 object-contain"
          style={{
            top: "163px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      ) : (
        <div
          className="absolute w-3- h-30 bg-gray-200 flex items-center justify-center text-xs text-gray-500"
          style={{
            top: "163px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          No QR
        </div>
      )}

      {/* Contact Info */}
      <div
        className="absolute text-center font-semibold text-black w-[75%]"
        style={{
          top: "320px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "15px",
        }}
      >
        {contactNumber}
        <div className="text-[16px] font-medium">
          {contactPerson}
        </div>
      </div>

    </div>
  );
}