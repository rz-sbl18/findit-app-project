import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/supabase";
import { createSessionToken, setSessionCookie, Role } from "@/lib/auth";
import { registerSchema, firstError } from "@/lib/validation";
import { clientIp, jsonError, rateLimit, sameOrigin } from "@/lib/security";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError(403, "Permintaan lintas-origin ditolak");
  const rl = rateLimit(`register:${clientIp(req)}`, 10, 10 * 60 * 1000);
  if (!rl.ok) return jsonError(429, "Terlalu banyak percobaan. Coba lagi nanti.", { retryAfter: rl.retryAfter });

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, firstError(parsed.error));

  try {
    const { full_name, email, password } = parsed.data;
    const password_hash = await bcrypt.hash(password, 12);
    // Role tidak pernah berasal dari request: selalu default 'USER' dari database.
    const { data, error } = await db()
      .from("profiles")
      .insert({ full_name, email, password_hash })
      .select("id,role,session_version")
      .single();
    if (error || !data) {
      if (error?.code === "23505") return jsonError(409, "Email sudah terdaftar. Silakan masuk.");
      console.error("register insert failed", error?.code, error?.message);
      return jsonError(500, "Pendaftaran belum bisa diproses karena masalah database. Hubungi admin.");
    }
    await setSessionCookie(await createSessionToken(data.id, data.role as Role, data.session_version));
    return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("register error", e instanceof Error ? e.message : e);
    return jsonError(503, "Server belum dikonfigurasi dengan benar. Hubungi admin.");
  }
}
