"use client";
import { useState } from "react";
import Link from "next/link";
import { Report, TYPE_LABEL } from "@/lib/constants";
import { StatusBadge } from "./Badge";

export function MyReportRow({ r }: { r: Report }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function call(method: "PATCH" | "DELETE", body?: unknown) {
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/reports/${r.id}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMsg(data.error ?? "Gagal");
    window.location.reload();
  }

  return (
    <div className="card flex flex-wrap items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <Link href={`/reports/${r.id}`} className="font-semibold text-navy-800 hover:underline">{r.item_name}</Link>
        <p className="text-xs text-slate-500">{TYPE_LABEL[r.report_type]} · {r.category} · {new Date(r.created_at).toLocaleDateString("id-ID")}</p>
        {!r.is_active && <p className="text-xs font-medium text-amber-700">Dinonaktifkan moderator</p>}
        {msg && <p role="alert" className="text-xs text-red-600">{msg}</p>}
      </div>
      <StatusBadge status={r.status} />
      <select
        aria-label="Ubah status"
        className="input w-auto"
        value={r.status}
        disabled={busy || !r.is_active}
        onChange={(e) => call("PATCH", { status: e.target.value })}
      >
        {r.report_type === "LOST" && <option value="HILANG">Hilang</option>}
        <option value="DITEMUKAN">Ditemukan</option>
        <option value="SELESAI">Selesai</option>
      </select>
      <Link href={`/my-reports/${r.id}/edit`} className="btn btn-ghost">Ubah</Link>
      <button
        className="btn btn-danger"
        disabled={busy}
        onClick={() => {
          if (confirm(`Hapus laporan "${r.item_name}"? Tindakan ini tidak dapat dibatalkan.`)) call("DELETE");
        }}
      >
        Hapus
      </button>
    </div>
  );
}
