"use client";

import { useEffect, useMemo, useState } from "react";
import ContactModal from "./ContactModal";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

type Executive = { _id: string; name: string; phone: string };

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtBOB(n: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export default function Simulator() {
  const [clpToBobRate, setClpToBobRate] = useState<number>(0); // 1000 CLP = X BOB
  const [bobToClpRate, setBobToClpRate] = useState<number>(0); // 1 BOB = Y CLP

  const [amount, setAmount] = useState<string>("");
  const [fromCurrency, setFromCurrency] = useState<"CLP" | "BOB">("CLP");

  const toCurrency = useMemo(
    () => (fromCurrency === "CLP" ? "BOB" : "CLP"),
    [fromCurrency]
  );

  const [executives, setExecutives] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExec, setSelectedExec] = useState<Executive | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [r, e] = await Promise.all([
        fetch("/api/public/rate", { cache: "no-store" }).then((x) => x.json()),
        fetch("/api/public/executives", { cache: "no-store" }).then((x) => x.json()),
      ]);

      setClpToBobRate(Number(r?.rates?.clpToBob?.value || 0));
      setBobToClpRate(Number(r?.rates?.bobToClp?.value || 0));

      setExecutives(e.executives || []);
      setLoading(false);
    })();
  }, []);

  const amountNum = Number(amount || 0);

  const converted = useMemo(() => {
    if (!Number.isFinite(amountNum) || amountNum <= 0) return 0;

    if (fromCurrency === "CLP") {
      // ✅ CLP -> BOB: (CLP/1000) * rate
      return (amountNum / 1000) * clpToBobRate;
    } else {
      // ✅ BOB -> CLP: BOB * rate
      return amountNum * bobToClpRate;
    }
  }, [amountNum, fromCurrency, clpToBobRate, bobToClpRate]);

  const formattedFrom = useMemo(() => {
    if (!Number.isFinite(amountNum) || amountNum <= 0)
      return fromCurrency === "CLP" ? fmtCLP(0) : fmtBOB(0);
    return fromCurrency === "CLP" ? fmtCLP(amountNum) : fmtBOB(amountNum);
  }, [amountNum, fromCurrency]);

  const formattedTo = useMemo(() => {
    if (!Number.isFinite(converted) || converted <= 0)
      return toCurrency === "CLP" ? fmtCLP(0) : fmtBOB(0);
    return toCurrency === "CLP" ? fmtCLP(converted) : fmtBOB(converted);
  }, [converted, toCurrency]);

  function swapDirection() {
    setFromCurrency((p) => (p === "CLP" ? "BOB" : "CLP"));
  }

  async function contact(exec: Executive) {
    setSelectedExec(exec);
    setModalOpen(true);
  }

  async function confirmLead(finalAmount: number, finalFromCurrency: "CLP" | "BOB") {
    if (!selectedExec) return;

    const res = await fetch("/api/public/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        executiveId: selectedExec._id,
        amount: finalAmount,
        fromCurrency: finalFromCurrency,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.whatsappUrl) {
      alert(data?.message || "No se pudo continuar a WhatsApp");
      return;
    }

    window.location.href = data.whatsappUrl;
  }

  const rateText =
    fromCurrency === "CLP"
      ? `1000 CLP = ${clpToBobRate} BOB`
      : `1 BOB = ${bobToClpRate} CLP`;

  return (
    <div id="inicio" className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <section className="mx-auto max-w-6xl px-6 pt-10">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="max-w-xl">
  <p className="text-xs font-semibold tracking-widest text-emerald-700">
    CASA DE CAMBIO
  </p>

  <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
    Cambia de forma rápida y segura
  </h1>

  <p className="mt-4 text-slate-600 text-base leading-relaxed">
    Ingresa tu monto, elige la dirección (CLP ↔ BOB) y revisa la conversión.
    Operamos con transparencia y tasas actualizadas en tiempo real.
  </p>

  {/* 🔒 Bloque de confianza */}
  <div className="mt-8 grid gap-4 sm:grid-cols-2">
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
        ✓
      </div>
      <div>
        <p className="font-semibold text-slate-900">Transferencias seguras</p>
        <p className="text-sm text-slate-600">
          Operaciones verificadas y protegidas.
        </p>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
        ✓
      </div>
      <div>
        <p className="font-semibold text-slate-900">Tasas competitivas</p>
        <p className="text-sm text-slate-600">
          Tipo de cambio actualizado constantemente.
        </p>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
        ✓
      </div>
      <div>
        <p className="font-semibold text-slate-900">Atención personalizada</p>
        <p className="text-sm text-slate-600">
          Ejecutivos dedicados a tu operación.
        </p>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
        ✓
      </div>
      <div>
        <p className="font-semibold text-slate-900">Operaciones rápidas</p>
        <p className="text-sm text-slate-600">
          Procesamiento ágil y eficiente.
        </p>
      </div>
    </div>
  </div>
  {/* 📊 Barra de estadísticas */}
<div className="mt-10 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8">
  <div>
    <p className="text-2xl font-extrabold text-slate-900">+160</p>
    <p className="text-xs text-slate-500">Operaciones realizadas</p>
  </div>

  <div>
    <p className="text-2xl font-extrabold text-slate-900">98%</p>
    <p className="text-xs text-slate-500">Clientes satisfechos</p>
  </div>

  <div>
    <p className="text-2xl font-extrabold text-slate-900">24/7</p>
    <p className="text-xs text-slate-500">Atención personalizada</p>
  </div>
</div>

{/* 🏛️ Bloque institucional */}
<div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
  <p className="text-xs font-semibold tracking-widest text-slate-500">
    COMPROMISO Y TRANSPARENCIA
  </p>

  <p className="mt-3 text-sm text-slate-700 leading-relaxed">
    En <span className="font-semibold">RemesaCapital</span> trabajamos con
    estándares de seguridad y validación en cada operación. Nuestro objetivo
    es ofrecer un tipo de cambio competitivo, atención directa con ejecutivos
    y procesos claros para cada cliente.
  </p>
</div>
</div>

            <div className="w-full md:max-w-md">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold tracking-tight text-green-800">REMESACAPITAL</p>
                    <p className="text-xs text-slate-500">Simulador CLP ↔ BOB</p>
                  </div>

                  <div className="text-right text-xs text-slate-500">
                    <div className="font-semibold text-slate-700">Tasa</div>
                    <div>{rateText}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setFromCurrency("CLP")}
                    className={[
                      "flex-1 rounded-xl px-3 py-2 text-sm border transition",
                      fromCurrency === "CLP"
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    CLP → BOB
                  </button>

                  <button
                    onClick={() => setFromCurrency("BOB")}
                    className={[
                      "flex-1 rounded-xl px-3 py-2 text-sm border transition",
                      fromCurrency === "BOB"
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    BOB → CLP
                  </button>

                  <button
                    onClick={swapDirection}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    title="Invertir"
                  >
                    ⇄
                  </button>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold text-slate-600">
                    Tu dinero ({fromCurrency})
                  </label>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 
             outline-none transition
             placeholder:text-slate-400 placeholder:font-semibold placeholder:opacity-100
             focus:border-emerald-500 focus:text-slate-950"
  placeholder={fromCurrency === "CLP" ? "Ej: 150000" : "Ej: 500"}
                  />
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-600">Conversión</p>
                  <p className="mt-1 text-sm text-slate-700">{formattedFrom}</p>
                  <p className="text-2xl font-extrabold text-slate-900">{formattedTo}</p>
                  <p className="mt-2 text-[11px] text-slate-500">
                    * Estimación. El valor final puede variar según validación del ejecutivo.
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-bold text-slate-900">Contacta con un asesor</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Al seleccionar uno, confirmas el monto y quedará registrado.
                  </p>

                  {loading ? (
                    <p className="mt-4 text-sm text-slate-500">Cargando...</p>
                  ) : executives.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">No hay ejecutivos disponibles.</p>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {executives.slice(0, 6).map((ex) => (
                        <button
                          key={ex._id}
                          onClick={() => contact(ex)}
                          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition p-3 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                              {ex.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {ex.name}
                              </p>
                              <p className="text-xs text-emerald-700 font-semibold">WhatsApp</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                

                <div className="mt-3 text-center text-xs text-slate-500">
                  Consulta con nuestros asesores para conocer los requisitos.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      <ContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={(a, from) => confirmLead(a, from)}
        defaultAmount={Number(amount || 0)}
        defaultFromCurrency={fromCurrency}
      />
    </div>
  );
}