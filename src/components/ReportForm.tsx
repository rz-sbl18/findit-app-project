"use client";
import { useState } from "react";
import { CATEGORIES, MAX_IMAGE_BYTES, Report } from "@/lib/constants";

export function ReportForm({ report }: { report?: Report }) {
  const editing = !!report;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const img = fd.get("image");
    if (img instanceof File && img.size > MAX_IMAGE_BYTES) return setError("Ukuran foto maksimal 2 MB");
    if (img instanceof File && img.size === 0) fd.delete("image");
    fd.set("share_contact", fd.get("share_contact") ? "true" : "false");
    if (editing) fd.delete("report_type");
    setBusy(true);
    const res = await fetch(editing ? `/api/reports/${report!.id}` : "/api/reports", { method: editing ? "PATCH" : "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Terjadi kesalahan");
    window.location.href = editing ? "/my-reports" : `/reports/${data.id}`;
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-bold text-navy-800">{editing ? "Ubah Laporan" : "Buat Laporan"}</h1>
      {!editing && (
        <fieldset className="flex gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="report_type" value="LOST" defaultChecked /> Saya kehilangan barang</label>
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="report_type" value="FOUND" /> Saya menemukan barang</label>
        </fieldset>
      )}
      <div>
        <label className="label" htmlFor="item_name">Nama barang</label>
        <input id="item_name" name="item_name" className="input" required minLength={2} maxLength={120} defaultValue={report?.item_name} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="category">Kategori</label>
          <select id="category" name="category" className="input" defaultValue={report?.category ?? CATEGORIES[0]}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="incident_date">Tanggal kejadian</label>
          <input id="incident_date" name="incident_date" type="date" max={today} className="input" required defaultValue={report?.incident_date} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="location">Lokasi (terakhir terlihat / ditemukan)</label>
        <input id="location" name="location" className="input" required minLength={2} maxLength={200} defaultValue={report?.location} />
      </div>
      <div>
        <label className="label" htmlFor="description">Deskripsi</label>
        <textarea id="description" name="description" rows={4} className="input" required minLength={5} maxLength={2000} defaultValue={report?.description} />
        <p className="mt-1 text-xs text-slate-500">Jangan tulis detail yang menjadi bukti kepemilikan (mis. nomor seri); simpan untuk verifikasi.</p>
      </div>
      <div>
        <label className="label" htmlFor="image">Foto {editing ? "(kosongkan jika tidak diganti)" : "(opsional)"}</label>
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" className="input" />
        <p className="mt-1 text-xs text-slate-500">JPG, PNG, atau WebP. Maksimal 2 MB.</p>
      </div>
      <div>
        <label className="label" htmlFor="contact_info">Info kontak (opsional)</label>
        <input id="contact_info" name="contact_info" className="input" maxLength={200} defaultValue={report?.contact_info ?? ""} placeholder="mis. username Instagram / WhatsApp" />
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" name="share_contact" defaultChecked={report?.share_contact} /> Izinkan pengguna yang login melihat kontak ini
        </label>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? "Menyimpan…" : "Simpan laporan"}</button>
    </form>
  );
}
