import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, clearSessionCookie, verifyToken } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { jsonError, sameOrigin } from "@/lib/security";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError(403, "Permintaan lintas-origin ditolak");
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const claims = token ? await verifyToken(token) : null;
  if (claims) {
    // Naikkan session_version agar token yang sama tidak bisa dipakai ulang setelah logout.
    const { data } = await db().from("profiles").select("session_version").eq("id", claims.sub).maybeSingle();
    if (data && data.session_version === claims.sv) {
      await db().from("profiles").update({ session_version: data.session_version + 1 }).eq("id", claims.sub);
    }
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
