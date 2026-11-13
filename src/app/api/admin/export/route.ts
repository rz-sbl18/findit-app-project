import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { STATUS_LABEL, TYPE_LABEL } from "@/lib/constants";
import { audit, guard, jsonError } from "@/lib/security";

// Cegah CSV/formula injection di Excel: awali sel berbahaya dengan apostrof.
// Pemisah memakai titik koma dan baris "sep=;" agar Excel (locale Indonesia maupun Inggris) langsung membagi kolom dengan benar.
function cell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  s = s.replace(/[\r\n]+/g, " ");
  if (/^[=+\-@\t]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

const WIB = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
});
function wib(v: unknown): string {
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? "" : WIB.format(d).replace(",", "");
}
function tgl(v: unknown): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v ?? ""));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
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
  const head = ["No", "Nama Barang", "Kategori", "Jenis Laporan", "Status", "Lokasi", "Tanggal Kejadian", "Tampil di Galeri", "Dibuat (WIB)", "Pelapor", "Email Pelapor"];
  const lines = ["sep=;", head.map(cell).join(";")];
  let no = 0;
  for (const r of (data ?? []) as unknown as Array<Record<string, any>>) {
    lines.push(
      [++no, r.item_name, r.category, TYPE_LABEL[r.report_type] ?? r.report_type, STATUS_LABEL[r.status] ?? r.status, r.location, tgl(r.incident_date), r.is_active ? "Ya" : "Tidak", wib(r.created_at), r.profiles?.full_name, r.profiles?.email]
        .map(cell)
        .join(";"),
    );
  }
  await audit(g.user.id, "EXPORT_CSV", "reports");
  return new NextResponse("﻿" + lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="findit-laporan-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
