"use client";

import { useEffect, useMemo, useState } from "react";

type Exec = { _id: string; name: string };

type Lead = {
  _id: string;
  executiveId: string;
  executiveNameSnapshot: string;

  // nuevo
  fromCurrency?: "CLP" | "BOB";
  toCurrency?: "CLP" | "BOB";
  amountFrom?: number;
  amountTo?: number;

  rateSnapshot: number;
  createdAt: string;

  // compat
  amount?: number;
  currency?: "CLP" | "BOB";
  computedResult?: number;
  computedCurrency?: "CLP" | "BOB";
};

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(n);
}

function leadFrom(lead: Lead) {
  const fromCurrency = lead.fromCurrency ?? lead.currency ?? "CLP";
  const toCurrency = lead.toCurrency ?? lead.computedCurrency ?? (fromCurrency === "CLP" ? "BOB" : "CLP");
  const amountFrom = lead.amountFrom ?? lead.amount ?? 0;
  const amountTo = lead.amountTo ?? lead.computedResult ?? 0;
  return { fromCurrency, toCurrency, amountFrom, amountTo };
}

export default function AdminLeadsPage() {
  const [execs, setExecs] = useState<Exec[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExec, setSelectedExec] = useState<string>("");

  async function loadExecutives() {
    const res = await fetch("/api/admin/executives", { cache: "no-store" });
    const data = await res.json();
    setExecs((data?.executives || []).map((e: any) => ({ _id: e._id, name: e.name })));
  }

  async function loadLeads(executiveId?: string) {
    setLoading(true);
    const url =
      executiveId && executiveId.length > 0
        ? `/api/admin/leads?executiveId=${encodeURIComponent(executiveId)}&limit=200`
        : `/api/admin/leads?limit=200`;

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    setLeads(data?.leads || []);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      await loadExecutives();
      await loadLeads();
    })();
  }, []);

  useEffect(() => {
    loadLeads(selectedExec);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExec]);

  const totals = useMemo(() => {
    // suma por ejecutivo del "monto de origen" (puede ser CLP o BOB, se muestra con moneda)
    const map = new Map<string, { totalCLP: number; totalBOB: number }>();

    for (const l of leads) {
      const name = l.executiveNameSnapshot;
      const { fromCurrency, amountFrom } = leadFrom(l);

      if (!map.has(name)) map.set(name, { totalCLP: 0, totalBOB: 0 });

      const obj = map.get(name)!;
      if (fromCurrency === "CLP") obj.totalCLP += amountFrom;
      else obj.totalBOB += amountFrom;
    }

    return Array.from(map.entries()).sort((a, b) => {
      const aSum = a[1].totalCLP + a[1].totalBOB;
      const bSum = b[1].totalCLP + b[1].totalBOB;
      return bSum - aSum;
    });
  }, [leads]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-extrabold">Registros (WhatsApp)</h1>
        <p className="mt-1 text-white/70 text-sm">
          Cada registro incluye dirección (CLP↔BOB), monto y simulación guardada.
        </p>

        <div className="mt-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">Filtrar por ejecutivo:</span>
            <select
              value={selectedExec}
              onChange={(e) => setSelectedExec(e.target.value)}
              className="rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
            >
              <option value="">Todos</option>
              {execs.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => loadLeads(selectedExec)}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
          >
            Refrescar
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-bold text-lg">Totales (monto ingresado por clientes)</h2>
        <p className="text-white/60 text-sm mt-1">
          Se separa por moneda de origen (CLP / BOB).
        </p>

        {totals.length === 0 ? (
          <p className="mt-4 text-white/60">Sin registros.</p>
        ) : (
          <div className="mt-4 grid gap-2">
            {totals.map(([name, t]) => (
              <div
                key={name}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <span className="font-semibold">{name}</span>
                <div className="text-white/80 text-sm flex gap-4">
                  <span>CLP: {fmt(t.totalCLP)}</span>
                  <span>BOB: {fmt(t.totalBOB)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-bold text-lg">Detalle</h2>

        {loading ? (
          <p className="mt-4 text-white/60">Cargando...</p>
        ) : leads.length === 0 ? (
          <p className="mt-4 text-white/60">Sin registros.</p>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-white/70">
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 pr-3">Fecha</th>
                  <th className="text-left py-3 pr-3">Ejecutivo</th>
                  <th className="text-left py-3 pr-3">Dirección</th>
                  <th className="text-left py-3 pr-3">Monto</th>
                  <th className="text-left py-3 pr-3">Simulación</th>
                  <th className="text-left py-3 pr-3">Tasa</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const x = leadFrom(l);
                  return (
                    <tr key={l._id} className="border-b border-white/10">
                      <td className="py-3 pr-3 text-white/80">
                        {new Date(l.createdAt).toLocaleString("es-CL")}
                      </td>
                      <td className="py-3 pr-3 font-semibold">{l.executiveNameSnapshot}</td>
                      <td className="py-3 pr-3">{x.fromCurrency} → {x.toCurrency}</td>
                      <td className="py-3 pr-3">{fmt(x.amountFrom)} {x.fromCurrency}</td>
                      <td className="py-3 pr-3 text-white/80">
                        {fmt(x.amountTo)} {x.toCurrency}
                      </td>
                      <td className="py-3 pr-3 text-white/60">1 CLP = {l.rateSnapshot} BOB</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}