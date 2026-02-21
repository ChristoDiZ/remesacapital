// src/app/api/admin/logout/route.ts
import { NextResponse } from "next/server";
import { AdminCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AdminCookie.name, "", {
    ...AdminCookie.options,
    maxAge: 0,
  });
  return res;
}