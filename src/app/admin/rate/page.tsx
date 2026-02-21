"use client";

import { useEffect, useState } from "react";

export default function AdminRatePage() {
  const [clpToBobRate, setClpToBobRate] = useState<string>("");
  const [bobToClpRate, setBobToClpRate] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/admin/rate", { cache: "no-store" });
      const data = await res.json();

      setClpToBobRate(String(data?.settings?.clpToBobRate ?? "0"));
      setBobToClpRate(String(data?.settings?.bobToClpRate ?? "0"));

      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);

    const res = await fetch("/api/admin/rate", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clpToBobRate: Number(clpToBobRate),
        bobToClpRate: Number(bobToClpRate),
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setMsg(data?.message || "Error al guardar");
      setSaving(false);
      return;
    }

    setMsg("Guardado ✅");
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
      <h1 className="text-xl font-extrabold">Tasas de cambio</h1>
      <p className="mt-1 text-white/70 text-sm">
        Configura ambas tasas. Se aplicará automáticamente según lo que elija el cliente.
      </p>

      {loading ? (
        <p className="mt-6 text-white/60">Cargando...</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-white/80">CLP → BOB (BOB por 1.000 CLP)</label>
              <input
                value={clpToBobRate}
                onChange={(e) => setClpToBobRate(e.target.value)}
                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                placeholder="10.35"
              />
              <p className="mt-2 text-xs text-white/50">Ejemplo: 1000 CLP = 10.35 BOB</p>
            </div>

            <div>
              <label className="text-sm text-white/80">BOB → CLP (CLP por 1 BOB)</label>
              <input
                value={bobToClpRate}
                onChange={(e) => setBobToClpRate(e.target.value)}
                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                placeholder="96"
              />
              <p className="mt-2 text-xs text-white/50">Ejemplo: 1 BOB = 96 CLP</p>
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="mt-6 rounded-xl bg-white text-black font-semibold px-5 py-3 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>

          {msg && <p className="mt-3 text-sm text-white/80">{msg}</p>}
        </>
      )}
    </div>
  );
}