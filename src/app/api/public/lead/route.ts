import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import Executive from "@/models/Executive";
import Lead from "@/models/Lead";

const schema = z.object({
  executiveId: z.string().min(1),
  amount: z.number().positive(),
  fromCurrency: z.enum(["CLP", "BOB"]),
});

function cleanPhoneToWa(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2 }).format(n);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Datos inválidos" }, { status: 400 });
  }

  const { executiveId, amount, fromCurrency } = parsed.data;
  const toCurrency: "CLP" | "BOB" = fromCurrency === "CLP" ? "BOB" : "CLP";

  await connectDB();

  const settings = await Settings.findOneAndUpdate(
  { key: "global" },
  {
    $setOnInsert: {
      key: "global",
      clpToBobRate: 0,
      bobToClpRate: 0,
      fromCurrency: "CLP",
      toCurrency: "BOB",
    },
  },
  { upsert: true, returnDocument: "after" }
);

  const exec = await Executive.findById(executiveId);
  if (!exec || !exec.active || exec.deletedAt) {
    return NextResponse.json({ ok: false, message: "Ejecutivo no disponible" }, { status: 404 });
  }

  let rateSnapshot = 0;
  let rateLabel = "";
  let amountTo = 0;

  if (fromCurrency === "CLP") {
    // ✅ CLP -> BOB: (CLP/1000) * clpToBobRate
    rateSnapshot = Number(settings.clpToBobRate || 0);
    rateLabel = `1000 CLP = ${rateSnapshot} BOB`;
    amountTo = (amount / 1000) * rateSnapshot;
  } else {
    // ✅ BOB -> CLP: BOB * bobToClpRate
    rateSnapshot = Number(settings.bobToClpRate || 0);
    rateLabel = `1 BOB = ${rateSnapshot} CLP`;
    amountTo = amount * rateSnapshot;
  }

  await Lead.create({
    executiveId: exec._id,
    executiveNameSnapshot: exec.name,
    fromCurrency,
    toCurrency,
    amountFrom: amount,
    amountTo,
    rateSnapshot,

    // compat (si aún las usas en alguna vista)
    amount,
    currency: fromCurrency,
    computedResult: amountTo,
    computedCurrency: toCurrency,

    source: "whatsapp",
  });

  const waNumber = cleanPhoneToWa(exec.phone);

  const msg =
    `Hola ${exec.name}, quiero cambiar ${fmt(amount)} ${fromCurrency} a ${toCurrency}. ` +
    `Simulación: ${fmt(amountTo)} ${toCurrency}. ` +
    `Tasa: ${rateLabel}`;

  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  return NextResponse.json({ ok: true, whatsappUrl });
}