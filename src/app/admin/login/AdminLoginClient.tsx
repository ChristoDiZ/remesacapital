"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginClient() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.message || "Error al iniciar sesión");
      setLoading(false);
      return;
    }

    router.replace(next);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f1029]">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
      >
        <h1 className="text-xl font-bold text-white">Admin RemesaCapital</h1>
        <p className="text-white/70 mt-1 text-sm">
          Ingresa tus credenciales de administrador.
        </p>

        <label className="block mt-5 text-sm text-white/80">Usuario</label>
        <input
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white outline-none focus:border-white/30"
          placeholder="admin"
          autoFocus
        />

        <label className="block mt-4 text-sm text-white/80">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white outline-none focus:border-white/30"
          placeholder="••••••••"
        />

        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={loading || user.trim().length === 0 || password.trim().length === 0}
          className="mt-5 w-full rounded-xl bg-white text-black font-semibold py-3 disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}