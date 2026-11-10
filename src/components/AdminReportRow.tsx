"use client";
import { useState } from "react";
import Link from "next/link";
import { Report, TYPE_LABEL } from "@/lib/constants";
import { StatusBadge } from "./Badge";

export function AdminReportRow({ r }: { r: Report }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function call(method: "PATCH" | "DELETE", body?: unknown) {
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/reports/${r.id}`, {
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
    <tr className="border-t align-top">
      <td className="p-3">
        <Link href={`/reports/${r.id}`} className="font-semibold text-navy-800 hover:underline">{r.item_name}</Link>
        <div className="text-xs text-slate-500">{TYPE_LABEL[r.report_type]} · {r.category}</div>
        {msg && <div role="alert" className="text-xs text-red-600">{msg}</div>}
      </td>
      <td className="p-3">{r.profiles?.full_name ?? "-"}</td>
      <td className="p-3"><StatusBadge status={r.status} /></td>
      <td className="p-3">{r.is_active ? "Aktif" : <span className="font-semibold text-amber-700">Nonaktif</span>}</td>
      <td className="space-x-2 p-3 whitespace-nowrap">
        <button className="btn btn-ghost" disabled={busy} onClick={() => call("PATCH", { is_active: !r.is_active })}>
          {r.is_active ? "Nonaktifkan" : "Aktifkan"}
        </button>
        <button
          className="btn btn-danger"
          disabled={busy}
          onClick={() => confirm(`Hapus permanen "${r.item_name}"?`) && call("DELETE")}
        >
          Hapus
        </button>
      </td>
    </tr>
  );
}
