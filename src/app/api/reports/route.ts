import { NextRequest, NextResponse } from "next/server";
import { listReports } from "@/lib/data";
import { db } from "@/lib/supabase";
import { createReportSchema, firstError } from "@/lib/validation";
import { guard, jsonError, rateLimit } from "@/lib/security";
import { readReportBody } from "@/lib/reportInput";
import { removeImage, saveImage, UploadError } from "@/lib/upload";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  try {
    const result = await listReports({
      type: sp.get("type") ?? undefined,
      q: sp.get("q") ?? undefined,
      category: sp.get("category") ?? undefined,
      status: sp.get("status") ?? undefined,
      sort: sp.get("sort") ?? undefined,
      page: Number(sp.get("page") ?? 1) || 1,
    });
    return NextResponse.json(result);
  } catch {
    return jsonError(500, "Terjadi kesalahan pada server");
  }
}

export async function POST(req: NextRequest) {
  const g = await guard(req);
  if (g.res) return g.res;
  const rl = rateLimit(`create:${g.user.id}`, 20, 60 * 60 * 1000);
  if (!rl.ok) return jsonError(429, "Batas pembuatan laporan tercapai. Coba lagi nanti.");

  const { data, file } = await readReportBody(req);
  const parsed = createReportSchema.safeParse(data);
  if (!parsed.success) return jsonError(400, firstError(parsed.error));
  const v = parsed.data;

  let image_url: string | null = null;
  try {
    if (file) image_url = await saveImage(file);
  } catch (e) {
    if (e instanceof UploadError) return jsonError(400, e.message);
    return jsonError(500, "Gagal mengunggah foto");
  }

  const { data: row, error } = await db()
    .from("reports")
    .insert({
      user_id: g.user.id, // selalu dari sesi, bukan dari body
      item_name: v.item_name,
      category: v.category,
      description: v.description,
      report_type: v.report_type,
      location: v.location,
      incident_date: v.incident_date,
      contact_info: v.contact_info || null,
      share_contact: v.share_contact,
      status: v.report_type === "LOST" ? "HILANG" : "DITEMUKAN",
      image_url,
    })
    .select("id")
    .single();
  if (error || !row) {
    await removeImage(image_url);
    return jsonError(500, "Gagal menyimpan laporan");
  }
  return NextResponse.json({ id: row.id }, { status: 201 });
}
