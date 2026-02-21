// src/app/admin/login/page.tsx
import { Suspense } from "react";
import AdminLoginClient from "./AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1029]" />}>
      <AdminLoginClient />
    </Suspense>
  );
}