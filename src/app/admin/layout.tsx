import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070818]">
      <AdminNav />
      <div className="mx-auto max-w-6xl px-6 py-8 text-white">{children}</div>
    </div>
  );
}