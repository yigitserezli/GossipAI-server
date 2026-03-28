import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Servis baglantisi hazir.",
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV ?? "development",
    },
  });
}
