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
    rates: {
      clpToBob: { base: 1000, value: settings.clpToBobRate }, // 1000 CLP = X BOB
      bobToClp: { base: 1, value: settings.bobToClpRate },   // 1 BOB = Y CLP
    },
    updatedAt: settings.updatedAt,
  });
}