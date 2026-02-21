"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number, fromCurrency: "CLP" | "BOB") => void;
  defaultAmount?: number;
  defaultFromCurrency?: "CLP" | "BOB";
};

export default function ContactModal({
  open,
  onClose,
  onConfirm,
  defaultAmount,
  defaultFromCurrency,
}: Props) {
  const [amount, setAmount] = useState<string>("");
  const [fromCurrency, setFromCurrency] = useState<"CLP" | "BOB">("CLP");

  const toCurrency = useMemo(
    () => (fromCurrency === "CLP" ? "BOB" : "CLP"),
    [fromCurrency]
  );

  useEffect(() => {
    if (open) {
      setFromCurrency(defaultFromCurrency ?? "CLP");
      setAmount(defaultAmount && defaultAmount > 0 ? String(defaultAmount) : "");
    }
  }, [open, defaultAmount, defaultFromCurrency]);

  if (!open) return null;

  const amountNum = Number(amount);

  function swap() {
    setFromCurrency((p) => (p === "CLP" ? "BOB" : "CLP"));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-[fadeIn_.2s_ease-out]">
        
        {/* header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Confirmar operación
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Revisa los datos antes de continuar a WhatsApp.
              </p>
            </div>

            <div className="rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1">
              Operación segura
            </div>
          </div>
        </div>

        {/* body */}
        <div className="px-6 py-6 space-y-6">

          {/* direction */}
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Dirección del cambio
            </label>

            <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[11px] text-slate-500">De</div>
                <div className="text-sm font-extrabold text-slate-900">
                  {fromCurrency}
                </div>
              </div>

              <button
                type="button"
                onClick={swap}
                className="h-11 w-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition"
                title="Invertir"
              >
                ⇄
              </button>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[11px] text-slate-500">A</div>
                <div className="text-sm font-extrabold text-slate-900">
                  {toCurrency}
                </div>
              </div>
            </div>
          </div>

          {/* amount */}
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Monto a cambiar ({fromCurrency})
            </label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 transition focus:text-slate-950 focus:text-slate-950"
              placeholder={fromCurrency === "CLP" ? "Ej: 150000" : "Ej: 500"}
            />
            <p className="mt-2 text-[11px] text-slate-500">
              Esta información quedará registrada para el ejecutivo.
            </p>
          </div>
        </div>

        {/* footer */}
        <div className="px-6 py-5 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancelar
          </button>

          <button
            disabled={!Number.isFinite(amountNum) || amountNum <= 0}
            onClick={() => onConfirm(amountNum, fromCurrency)}
            className="flex-1 rounded-xl bg-emerald-700 py-3 text-sm font-extrabold text-white hover:bg-emerald-800 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <span>Continuar</span>
            
          </button>
        </div>
      </div>
    </div>
  );
}