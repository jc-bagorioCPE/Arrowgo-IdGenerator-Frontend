
export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen w-full">
      {/* Page Content */}
      <div className="flex-1 p-6 overflow-auto bg-gray-50">
        {children}
      </div>
    </div>
  );
}
