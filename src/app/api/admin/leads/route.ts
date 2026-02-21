import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Lead from "@/models/Lead";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const executiveId = searchParams.get("executiveId");
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

  const filter: any = {};
  if (executiveId) filter.executiveId = executiveId;

  const leads = await Lead.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select({
      executiveId: 1,
      executiveNameSnapshot: 1,
      fromCurrency: 1,
      toCurrency: 1,
      amountFrom: 1,
      amountTo: 1,
      rateSnapshot: 1,
      createdAt: 1,

      // compat antiguos
      amount: 1,
      currency: 1,
      computedResult: 1,
      computedCurrency: 1,
    });

  return NextResponse.json({ ok: true, leads });
}