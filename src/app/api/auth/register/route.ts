import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/supabase";
import { registerSchema, firstError } from "@/lib/validation";
import { clientIp, jsonError, rateLimit, sameOrigin } from "@/lib/security";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError(403, "Permintaan lintas-origin ditolak");
  const rl = rateLimit(`register:${clientIp(req)}`, 5, 10 * 60 * 1000);
  if (!rl.ok) return jsonError(429, "Terlalu banyak percobaan. Coba lagi nanti.", { retryAfter: rl.retryAfter });

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, firstError(parsed.error));

  const { full_name, email, password } = parsed.data;
  const password_hash = await bcrypt.hash(password, 12);
  // Role tidak pernah berasal dari request: selalu default 'USER' dari database.
  const { error } = await db().from("profiles").insert({ full_name, email, password_hash });
  if (error) {
    if (error.code === "23505") return jsonError(409, "Email sudah terdaftar");
    return jsonError(500, "Registrasi gagal");
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
