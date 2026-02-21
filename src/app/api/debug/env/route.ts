import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasMongo: Boolean(process.env.MONGODB_URI),
    hasSecret: Boolean(process.env.SESSION_SECRET),
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}