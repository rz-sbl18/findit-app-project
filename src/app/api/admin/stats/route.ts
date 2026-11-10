import { NextRequest, NextResponse } from "next/server";
import { adminStats } from "@/lib/data";
import { guard, jsonError } from "@/lib/security";

export async function GET(req: NextRequest) {
  const g = await guard(req, { admin: true });
  if (g.res) return g.res;
  try {
    return NextResponse.json(await adminStats());
  } catch {
    return jsonError(500, "Terjadi kesalahan pada server");
  }
}
