"use client";
import { useState } from "react";
import { CATEGORIES, MAX_IMAGE_BYTES, Report } from "@/lib/constants";

type Kind = "LOST" | "FOUND";

const COPY: Record<Kind, { title: string; intro: string; date: string; place: string; descHint: string; contact: string }> = {
  LOST: {
    title: "Lapor Kehilangan Barang",
    intro: "Ceritakan barang yang hilang agar orang lain bisa membantu mencari.",
    date: "Tanggal kehilangan",
    place: "Lokasi terakhir terlihat",
    descHint: "Tulis ciri umum (warna, merek, stiker). Simpan detail rahasia untuk proses verifikasi.",
    contact: "Kontak jika barang ditemukan",
  },
  FOUND: {
    title: "Lapor Penemuan Barang",
    intro: "Terima kasih sudah peduli. Bantu pemilik menemukan kembali barangnya.",
    date: "Tanggal ditemukan",
    place: "Lokasi ditemukan",
    descHint: "Jangan tulis ciri yang hanya diketahui pemilik. Pemilik perlu menyebutkannya sendiri saat verifikasi.",
    contact: "Kontak penemu",
  },
};

export function ReportForm({ report, type }: { report?: Report; type?: Kind }) {
  const editing = !!report;
  const kind: Kind = report?.report_type ?? type ?? "LOST";
  const c = COPY[kind];
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const img = fd.get("image");
    if (img instanceof File && img.size > MAX_IMAGE_BYTES) return setError("Ukuran foto maksimal 2 MB");
    if (img instanceof File && img.size === 0) fd.delete("image");
    fd.set("share_contact", fd.get("share_contact") ? "true" : "false");
    if (editing) fd.delete("report_type");
    else fd.set("report_type", kind);
    setBusy(true);
    let res: Response;
    try {
      res = await fetch(editing ? `/api/reports/${report!.id}` : "/api/reports", { method: editing ? "PATCH" : "POST", body: fd });
    } catch {
      setBusy(false);
      return setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
    }
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Terjadi kesalahan");
    window.location.href = editing ? "/my-reports" : `/reports/${data.id}`;
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto max-w-2xl space-y-4 p-6">
      <div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${kind === "LOST" ? "bg-rose-50 text-rose-700" : "bg-teal-50 text-teal-700"}`}>
          {kind === "LOST" ? "🔎 Kehilangan" : "📦 Penemuan"}
        </span>
        <h1 className="mt-2 text-2xl font-bold text-navy-800">{editing ? `Ubah: ${report!.item_name}` : c.title}</h1>
        <p className="text-sm text-slate-500">{c.intro}</p>
      </div>
      <div>
        <label className="label" htmlFor="item_name">Nama barang</label>
        <input id="item_name" name="item_name" className="input" required minLength={2} maxLength={120} defaultValue={report?.item_name} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="category">Kategori</label>
          <select id="category" name="category" className="input" defaultValue={report?.category ?? CATEGORIES[0]}>
            {CATEGORIES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="incident_date">{c.date}</label>
          <input id="incident_date" name="incident_date" type="date" max={today} className="input" required defaultValue={report?.incident_date} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="location">{c.place}</label>
        <input id="location" name="location" className="input" required minLength={2} maxLength={200} defaultValue={report?.location} />
      </div>
      {kind === "FOUND" && (
        <div>
          <label className="label" htmlFor="held_location">Barang saat ini disimpan di</label>
          <input id="held_location" name="held_location" className="input" maxLength={200} defaultValue={report?.held_location ?? ""} placeholder="mis. Pos satpam Gedung A" />
          <p className="mt-1 text-xs text-slate-500">Disarankan menitipkan barang di tempat umum yang aman agar pemilik mudah mengambil.</p>
        </div>
      )}
      <div>
        <label className="label" htmlFor="description">Deskripsi</label>
        <textarea id="description" name="description" rows={4} className="input" required minLength={5} maxLength={2000} defaultValue={report?.description} />
        <p className="mt-1 text-xs text-slate-500">{c.descHint}</p>
      </div>
      <div>
        <label className="label" htmlFor="image">Foto {editing ? "(kosongkan jika tidak diganti)" : "(opsional)"}</label>
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" className="input" />
        <p className="mt-1 text-xs text-slate-500">JPG, PNG, atau WebP. Maksimal 2 MB. Hindari foto dokumen pribadi yang terbaca jelas.</p>
      </div>
      <div>
        <label className="label" htmlFor="contact_info">{c.contact} (opsional)</label>
        <input id="contact_info" name="contact_info" className="input" maxLength={200} defaultValue={report?.contact_info ?? ""} placeholder="mis. username Instagram atau WhatsApp" />
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" name="share_contact" defaultChecked={report?.share_contact} /> Izinkan pengguna yang login melihat kontak ini
        </label>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? "Menyimpan…" : "Simpan laporan"}</button>
    </form>
  );
}
