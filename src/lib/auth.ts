import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./supabase";

const isProd = process.env.NODE_ENV === "production";
// Prefix __Host- memaksa Secure + Path=/ + tanpa Domain (hanya di production/HTTPS).
export const COOKIE_NAME = isProd ? "__Host-findit_session" : "findit_session";
export const SESSION_SECONDS = 60 * 60 * 8; // 8 jam

export type Role = "USER" | "ADMIN";
export type SessionUser = { id: string; email: string; full_name: string; role: Role };

function secretKey(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET belum diatur atau kurang dari 32 karakter");
  return new TextEncoder().encode(s);
}

export async function createSessionToken(userId: string, role: Role, sessionVersion: number): Promise<string> {
  return new SignJWT({ role, sv: sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secretKey());
}

export async function verifyToken(token: string): Promise<{ sub: string; role: Role; sv: number } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.sv !== "number") return null;
    return { sub: payload.sub, role: payload.role as Role, sv: payload.sv };
  } catch {
    return null; // kedaluwarsa / tanda tangan salah / format salah
  }
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function clearSessionCookie() {
  (await cookies()).set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Sumber kebenaran sesi: token diverifikasi, lalu profil dibaca ulang dari database
 * sehingga role terbaru, akun yang sudah dihapus, dan logout (session_version) dihormati.
 */
export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const claims = await verifyToken(token);
  if (!claims) return null;
  const { data, error } = await db()
    .from("profiles")
    .select("id,email,full_name,role,session_version")
    .eq("id", claims.sub)
    .maybeSingle();
  if (error || !data) return null;
  if (data.session_version !== claims.sv) return null;
  return { id: data.id, email: data.email, full_name: data.full_name, role: data.role as Role };
}
