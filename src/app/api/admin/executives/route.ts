import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Executive from "@/models/Executive";

function clean(v: unknown) {
  return String(v ?? "").trim();
}

export async function GET() {
  await connectDB();

  // ✅ Admin ve activos/inactivos, pero NO los eliminados
  const executives = await Executive.find({ deletedAt: null })
    .sort({ order: 1, createdAt: 1 })
    .select({ name: 1, phone: 1, active: 1, order: 1, createdAt: 1 });

  return NextResponse.json({ ok: true, executives });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = clean(body?.name);
  const phone = clean(body?.phone);
  const order = Number(body?.order ?? 0);
  const active = body?.active === undefined ? true : Boolean(body?.active);

  if (!name || !phone) {
    return NextResponse.json(
      { ok: false, message: "Nombre y teléfono son obligatorios" },
      { status: 400 }
    );
  }

  if (!Number.isFinite(order)) {
    return NextResponse.json({ ok: false, message: "Orden inválido" }, { status: 400 });
  }

  await connectDB();

  const exec = await Executive.create({
    name,
    phone,
    order,
    active,
    deletedAt: null,
  });

  return NextResponse.json({ ok: true, executive: exec });
}