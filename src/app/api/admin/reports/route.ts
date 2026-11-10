import { NextRequest, NextResponse } from "next/server";
import { listReports } from "@/lib/data";
import { guard, jsonError } from "@/lib/security";

export async function GET(req: NextRequest) {
  const g = await guard(req, { admin: true });
  if (g.res) return g.res;
  const sp = req.nextUrl.searchParams;
  try {
    const r = await listReports({
      includeInactive: true,
      type: sp.get("type") ?? undefined,
      q: sp.get("q") ?? undefined,
      status: sp.get("status") ?? undefined,
      page: Number(sp.get("page") ?? 1) || 1,
      pageSize: 20,
    });
    return NextResponse.json(r);
  } catch {
    return jsonError(500, "Terjadi kesalahan pada server");
  }
}
