import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/supabase";
import { createSessionToken, setSessionCookie, Role } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { clientIp, jsonError, rateLimit, sameOrigin } from "@/lib/security";

// Hash tiruan agar waktu respons sama baik email ada maupun tidak.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 12);

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError(403, "Permintaan lintas-origin ditolak");
  const ip = clientIp(req);
  if (!rateLimit(`login-ip:${ip}`, 20, 5 * 60 * 1000).ok) return jsonError(429, "Terlalu banyak percobaan login. Coba lagi nanti.");

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonError(401, "Email atau password salah");
  const { email, password } = parsed.data;

  const rl = rateLimit(`login:${ip}:${email}`, 5, 5 * 60 * 1000);
  if (!rl.ok) return jsonError(429, "Terlalu banyak percobaan login. Coba lagi nanti.", { retryAfter: rl.retryAfter });

  // Query berparameter melalui PostgREST; input tidak pernah disambung ke SQL.
  const { data: user } = await db()
    .from("profiles")
    .select("id,password_hash,role,session_version")
    .eq("email", email)
    .maybeSingle();

  const valid = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !valid) return jsonError(401, "Email atau password salah");

  const token = await createSessionToken(user.id, user.role as Role, user.session_version);
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, role: user.role }, { headers: { "Cache-Control": "no-store" } });
}
