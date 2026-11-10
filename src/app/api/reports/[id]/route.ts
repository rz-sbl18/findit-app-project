import { NextRequest, NextResponse } from "next/server";
import { getReport } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { updateReportSchema, firstError, uuidSchema } from "@/lib/validation";
import { guard, jsonError } from "@/lib/security";
import { readReportBody } from "@/lib/reportInput";
import { removeImage, saveImage, UploadError } from "@/lib/upload";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!uuidSchema.safeParse(id).success) return jsonError(404, "Laporan tidak ditemukan");
  const user = await getSession();
  const report = await getReport(id, { viewerId: user?.id, isAdmin: user?.role === "ADMIN" });
  if (!report) return jsonError(404, "Laporan tidak ditemukan");
  return NextResponse.json(report);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const g = await guard(req);
  if (g.res) return g.res;
  const { id } = await ctx.params;
  if (!uuidSchema.safeParse(id).success) return jsonError(404, "Laporan tidak ditemukan");

  const { data, file } = await readReportBody(req);
  const parsed = updateReportSchema.safeParse(data);
  if (!parsed.success) return jsonError(400, firstError(parsed.error));
  const v = parsed.data;

  // Pemeriksaan kepemilikan (anti-IDOR): laporan hanya ditemukan jika user_id = pengguna di sesi.
  // Bila bukan milik pemanggil, balas 404 agar keberadaan ID tidak bocor.
  const { data: existing } = await db()
    .from("reports")
    .select("id,report_type,image_url,is_active")
    .eq("id", id)
    .eq("user_id", g.user.id)
    .maybeSingle();
  if (!existing) return jsonError(404, "Laporan tidak ditemukan");
  if (!existing.is_active) return jsonError(403, "Laporan dinonaktifkan moderator dan tidak dapat diubah");
  if (v.status === "HILANG" && existing.report_type === "FOUND") return jsonError(400, "Status tidak valid untuk laporan barang ditemukan");

  const update: Record<string, unknown> = { ...v };
  if ("contact_info" in v) update.contact_info = v.contact_info || null;

  let newImage: string | null = null;
  try {
    if (file) {
      newImage = await saveImage(file);
      update.image_url = newImage;
    }
  } catch (e) {
    if (e instanceof UploadError) return jsonError(400, e.message);
    return jsonError(500, "Gagal mengunggah foto");
  }

  if (Object.keys(update).length === 0) return jsonError(400, "Tidak ada perubahan");

  // Kepemilikan diperiksa lagi pada UPDATE itu sendiri (tidak bergantung pada pemeriksaan sebelumnya).
  const { data: updated, error } = await db()
    .from("reports")
    .update(update)
    .eq("id", id)
    .eq("user_id", g.user.id)
    .select("id")
    .maybeSingle();
  if (error || !updated) {
    await removeImage(newImage);
    return jsonError(error ? 500 : 404, error ? "Gagal memperbarui laporan" : "Laporan tidak ditemukan");
  }
  if (newImage) await removeImage(existing.image_url);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const g = await guard(req);
  if (g.res) return g.res;
  const { id } = await ctx.params;
  if (!uuidSchema.safeParse(id).success) return jsonError(404, "Laporan tidak ditemukan");
  const { data: deleted } = await db()
    .from("reports")
    .delete()
    .eq("id", id)
    .eq("user_id", g.user.id)
    .select("id,image_url")
    .maybeSingle();
  if (!deleted) return jsonError(404, "Laporan tidak ditemukan");
  await removeImage(deleted.image_url);
  return NextResponse.json({ ok: true });
}
