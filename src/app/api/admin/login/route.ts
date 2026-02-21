// src/app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import { AdminCookie, createAdminSessionToken } from "@/lib/auth";

function clean(v: unknown) {
  return String(v ?? "")
    .replace(/\r/g, "")
    .trim();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const user = clean(body?.user);
  const password = clean(body?.password);

  const adminUser = clean(process.env.ADMIN_USER);
  const adminPassword = clean(process.env.ADMIN_PASSWORD);

  if (!adminUser || !adminPassword) {
    return NextResponse.json(
      { ok: false, message: "ADMIN_USER o ADMIN_PASSWORD no configurado" },
      { status: 500 }
    );
  }

  if (user !== adminUser || password !== adminPassword) {
    return NextResponse.json(
      { ok: false, message: "Credenciales incorrectas" },
      { status: 401 }
    );
  }

  const token = await createAdminSessionToken();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AdminCookie.name, token, {
    ...AdminCookie.options,
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}