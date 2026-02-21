"use client";

import Link from "next/link";

export default function PublicNavbar() {
  return (
    <header className="w-full bg-white border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* Logo simple */}
          <div className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center">
            <span className="font-black text-emerald-700">RC</span>
          </div>

          <div className="leading-tight">
            <p className="font-extrabold tracking-tight text-green-800">REMESACAPITAL</p>
            <p className="text-xs text-slate-500">Casa de cambio</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm ">
          <a href="#inicio" className="text-slate-700 hover:text-emerald-700">
            Inicio
          </a>
          <a href="#nosotros" className="text-slate-700 hover:text-emerald-700">
            Nosotros
          </a>
          <a href="#contacto" className="text-slate-700 hover:text-emerald-700">
            Contacto
          </a>
          
        </nav>
      </div>
    </header>
  );
}