import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Executive from "@/models/Executive";

export async function GET() {
  await connectDB();

  const executives = await Executive.find({ active: true, deletedAt: null })
    .sort({ order: 1, createdAt: 1 })
    .select({ name: 1, phone: 1 });

  return NextResponse.json({ executives });
}