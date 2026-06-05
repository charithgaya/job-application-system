// app/admin/layout.tsx
import AdminSidebar from "@/src/app/admin/components/AdminSideBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <div className="flex">
        <AdminSidebar adminName="Admin" />
        <main className="min-h-screen flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}