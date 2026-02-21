import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Executive from "@/models/Executive";

function clean(v: unknown) {
  return String(v ?? "").trim();
}

// ⚠️ Next puede entregar params como Promise
type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({}));

  const name = body?.name !== undefined ? clean(body.name) : undefined;
  const phone = body?.phone !== undefined ? clean(body.phone) : undefined;
  const order = body?.order !== undefined ? Number(body.order) : undefined;
  const active = body?.active !== undefined ? Boolean(body.active) : undefined;

  if (order !== undefined && !Number.isFinite(order)) {
    return NextResponse.json({ ok: false, message: "Orden inválido" }, { status: 400 });
  }

  await connectDB();

  const exec = await Executive.findOne({ _id: id, deletedAt: null });
  if (!exec) {
    return NextResponse.json({ ok: false, message: "Ejecutivo no encontrado" }, { status: 404 });
  }

  if (name !== undefined) exec.name = name;
  if (phone !== undefined) exec.phone = phone;
  if (order !== undefined) exec.order = order;
  if (active !== undefined) exec.active = active;

  await exec.save();

  return NextResponse.json({ ok: true, executive: exec });
}

// ✅ Soft delete: no borra, solo marca deletedAt y desactiva
export async function DELETE(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  await connectDB();

  const exec = await Executive.findOne({ _id: id, deletedAt: null });
  if (!exec) {
    return NextResponse.json({ ok: false, message: "Ejecutivo no encontrado" }, { status: 404 });
  }

  exec.active = false;
  exec.deletedAt = new Date();
  await exec.save();

  return NextResponse.json({ ok: true });
}