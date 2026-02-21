import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";

export async function GET() {
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

  return NextResponse.json({
    ok: true,
    settings: {
      id: settings._id,
      key: settings.key,
      clpToBobRate: settings.clpToBobRate,
      bobToClpRate: settings.bobToClpRate,
      updatedAt: settings.updatedAt,
    },
  });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));

  const clpToBobRate = Number(body?.clpToBobRate);
  const bobToClpRate = Number(body?.bobToClpRate);

  if (!Number.isFinite(clpToBobRate) || clpToBobRate < 0) {
    return NextResponse.json({ ok: false, message: "Tasa CLP→BOB inválida" }, { status: 400 });
  }
  if (!Number.isFinite(bobToClpRate) || bobToClpRate < 0) {
    return NextResponse.json({ ok: false, message: "Tasa BOB→CLP inválida" }, { status: 400 });
  }

  await connectDB();

  const settings = await Settings.findOneAndUpdate(
  { key: "global" },
  {
    $set: { clpToBobRate, bobToClpRate },
    $setOnInsert: { fromCurrency: "CLP", toCurrency: "BOB", key: "global" },
  },
  { upsert: true, returnDocument: "after" }
);

  return NextResponse.json({
    ok: true,
    settings: {
      id: settings._id,
      key: settings.key,
      clpToBobRate: settings.clpToBobRate,
      bobToClpRate: settings.bobToClpRate,
      updatedAt: settings.updatedAt,
    },
  });
}