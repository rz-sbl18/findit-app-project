import { db } from "./supabase";
import { CATEGORIES, PAGE_SIZE, PUBLIC_COLUMNS, Report } from "./constants";
import { sanitizeSearch } from "./validation";

export type ListParams = {
  type?: string;
  q?: string;
  category?: string;
  status?: string;
  sort?: string;
  page?: number;
  includeInactive?: boolean;
  userId?: string;
  pageSize?: number;
};

function firstName(r: Report): Report {
  const full = r.profiles?.full_name ?? "";
  return { ...r, profiles: full ? { full_name: full.split(" ")[0] } : null };
}

export async function listReports(p: ListParams): Promise<{ rows: Report[]; total: number }> {
  // Kategori divalidasi terhadap daftar tetap; nilai asing = tidak ada hasil (bukan error).
  if (p.category && !(CATEGORIES as readonly string[]).includes(p.category)) return { rows: [], total: 0 };
  const size = p.pageSize ?? PAGE_SIZE;
  const page = Math.max(1, p.page ?? 1);
  let query = db()
    .from("reports")
    .select(`${PUBLIC_COLUMNS},profiles(full_name)`, { count: "exact" });
  if (!p.includeInactive) query = query.eq("is_active", true);
  if (p.userId) query = query.eq("user_id", p.userId);
  if (p.type === "LOST" || p.type === "FOUND") query = query.eq("report_type", p.type);
  if (p.category) query = query.eq("category", p.category);
  if (p.status && ["HILANG", "DITEMUKAN", "SELESAI"].includes(p.status)) query = query.eq("status", p.status);
  const s = sanitizeSearch(p.q ?? "");
  if (s) query = query.or(`item_name.ilike."%${s}%",description.ilike."%${s}%",location.ilike."%${s}%"`);
  const { data, count, error } = await query
    .order("incident_date", { ascending: p.sort === "oldest" })
    .order("created_at", { ascending: p.sort === "oldest" })
    .range((page - 1) * size, page * size - 1);
  if (error) {
    console.error("listReports failed", error.code, error.message);
    throw new Error("Gagal membaca data laporan");
  }
  return { rows: ((data ?? []) as unknown as Report[]).map(firstName), total: count ?? 0 };
}

/** Detail laporan. contact_info hanya disertakan bila pelapor mengizinkan dan pemanggil sudah login. */
export async function getReport(id: string, opts: { viewerId?: string | null; isAdmin?: boolean } = {}): Promise<Report | null> {
  const { data } = await db()
    .from("reports")
    .select(`${PUBLIC_COLUMNS},contact_info,profiles(full_name)`)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const r = firstName(data as unknown as Report);
  const isOwner = opts.viewerId === r.user_id;
  if (!r.is_active && !isOwner && !opts.isAdmin) return null;
  const canSeeContact = isOwner || opts.isAdmin || (!!opts.viewerId && r.share_contact);
  if (!canSeeContact) r.contact_info = null;
  return r;
}

export async function userSummary(userId: string) {
  const { data } = await db().from("reports").select("id,item_name,report_type,status,is_active,created_at").eq("user_id", userId).order("created_at", { ascending: false });
  const rows = data ?? [];
  return {
    total: rows.length,
    lost: rows.filter((r) => r.report_type === "LOST").length,
    found: rows.filter((r) => r.report_type === "FOUND").length,
    active: rows.filter((r) => r.status !== "SELESAI" && r.is_active).length,
    done: rows.filter((r) => r.status === "SELESAI").length,
    recent: rows.slice(0, 5),
  };
}

export async function adminStats() {
  const { data } = await db().from("reports").select("report_type,status,category,created_at,is_active").limit(10000);
  const rows = data ?? [];
  const now = new Date();
  const ym = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  const thisMonth = ym(now);
  const byMonth: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  for (const r of rows) {
    const m = ym(new Date(r.created_at));
    byMonth[m] = (byMonth[m] ?? 0) + 1;
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
  }
  const { count: users } = await db().from("profiles").select("id", { count: "exact", head: true });
  return {
    total: rows.length,
    thisMonth: rows.filter((r) => ym(new Date(r.created_at)) === thisMonth).length,
    lost: rows.filter((r) => r.report_type === "LOST").length,
    found: rows.filter((r) => r.report_type === "FOUND").length,
    done: rows.filter((r) => r.status === "SELESAI").length,
    inactive: rows.filter((r) => !r.is_active).length,
    users: users ?? 0,
    byMonth: Object.entries(byMonth).sort(([a], [b]) => (a < b ? 1 : -1)),
    byCategory: Object.entries(byCategory).sort(([, a], [, b]) => b - a),
  };
}

/** Statistik publik untuk beranda (hanya jumlah, tanpa data pribadi). */
export async function publicStats() {
  const { data } = await db().from("reports").select("status").eq("is_active", true).limit(10000);
  const rows = (data ?? []) as Array<{ status: string }>;
  return {
    total: rows.length,
    lost: rows.filter((r) => r.status === "HILANG").length,
    found: rows.filter((r) => r.status === "DITEMUKAN").length,
    done: rows.filter((r) => r.status === "SELESAI").length,
  };
}
