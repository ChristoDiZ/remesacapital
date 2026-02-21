"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "rounded-xl px-3 py-2 text-sm transition",
        active ? "bg-white text-black font-semibold" : "text-white/80 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function AdminNav() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="w-full border-b border-white/10 bg-[#0f1029]">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white font-extrabold">RemesaCapital</span>
          <span className="text-white/40 text-sm">Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <NavItem href="/admin" label="Dashboard" />
          <NavItem href="/admin/rate" label="Tasa" />
          <NavItem href="/admin/executives" label="Ejecutivos" />
          <NavItem href="/admin/leads" label="Registros" />

          <button
            onClick={logout}
            className="ml-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}