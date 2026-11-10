import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { audit, guard, jsonError } from "@/lib/security";

// Cegah CSV/formula injection di Excel: awali sel berbahaya dengan apostrof.
function cell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const g = await guard(req, { admin: true });
  if (g.res) return g.res;
  const { data, error } = await db()
    .from("reports")
    .select("id,item_name,category,report_type,status,location,incident_date,is_active,created_at,profiles(full_name,email)")
    .order("created_at", { ascending: false })
    .limit(10000);
  if (error) return jsonError(500, "Terjadi kesalahan pada server");
  const head = ["id", "nama_barang", "kategori", "tipe", "status", "lokasi", "tanggal_kejadian", "aktif", "dibuat", "pelapor", "email_pelapor"];
  const lines = [head.map(cell).join(",")];
  for (const r of (data ?? []) as unknown as Array<Record<string, any>>) {
    lines.push(
      [r.id, r.item_name, r.category, r.report_type, r.status, r.location, r.incident_date, r.is_active, r.created_at, r.profiles?.full_name, r.profiles?.email]
        .map(cell)
        .join(","),
    );
  }
  await audit(g.user.id, "EXPORT_CSV", "reports");
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="findit-laporan-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
