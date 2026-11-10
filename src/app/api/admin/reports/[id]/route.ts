import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { adminModerateSchema, firstError, uuidSchema } from "@/lib/validation";
import { audit, guard, jsonError } from "@/lib/security";
import { removeImage } from "@/lib/upload";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const g = await guard(req, { admin: true });
  if (g.res) return g.res;
  const { id } = await ctx.params;
  if (!uuidSchema.safeParse(id).success) return jsonError(404, "Laporan tidak ditemukan");
  const parsed = adminModerateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(400, firstError(parsed.error));
  const { data } = await db().from("reports").update({ is_active: parsed.data.is_active }).eq("id", id).select("id").maybeSingle();
  if (!data) return jsonError(404, "Laporan tidak ditemukan");
  await audit(g.user.id, parsed.data.is_active ? "REPORT_ACTIVATE" : "REPORT_DEACTIVATE", "report", id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const g = await guard(req, { admin: true });
  if (g.res) return g.res;
  const { id } = await ctx.params;
  if (!uuidSchema.safeParse(id).success) return jsonError(404, "Laporan tidak ditemukan");
  const { data } = await db().from("reports").delete().eq("id", id).select("id,image_url").maybeSingle();
  if (!data) return jsonError(404, "Laporan tidak ditemukan");
  await removeImage(data.image_url);
  await audit(g.user.id, "REPORT_DELETE", "report", id);
  return NextResponse.json({ ok: true });
}
