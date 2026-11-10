import { NextRequest, NextResponse } from "next/server";
import { getSession, SessionUser } from "./auth";

export function jsonError(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}

export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Proteksi CSRF untuk request pengubah data: Origin wajib ada dan harus sama dengan host aplikasi. */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// Rate limit in-memory per instance serverless (best effort; lihat batasan di README).
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  b.count += 1;
  return { ok: b.count <= limit, retryAfter: Math.ceil((b.reset - now) / 1000) };
}

type Guard = { user: SessionUser; res?: undefined } | { user?: undefined; res: NextResponse };

/** Guard untuk API: CSRF (non-GET), autentikasi, lalu RBAC. Selalu dijalankan di server. */
export async function guard(req: NextRequest, opts: { admin?: boolean } = {}): Promise<Guard> {
  if (!["GET", "HEAD"].includes(req.method) && !sameOrigin(req)) {
    return { res: jsonError(403, "Permintaan lintas-origin ditolak") };
  }
  const user = await getSession();
  if (!user) return { res: jsonError(401, "Silakan login terlebih dahulu") };
  if (opts.admin && user.role !== "ADMIN") return { res: jsonError(403, "Akses ditolak") };
  return { user };
}

export async function audit(actorId: string, action: string, targetType: string, targetId?: string) {
  const { db } = await import("./supabase");
  await db().from("audit_logs").insert({ actor_id: actorId, action, target_type: targetType, target_id: targetId ?? null });
}
