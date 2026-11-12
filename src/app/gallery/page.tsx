import Link from "next/link";
import { listReports } from "@/lib/data";
import { CATEGORIES, CATEGORY_ICON, PAGE_SIZE } from "@/lib/constants";
import { ReportCard } from "@/components/ReportCard";

export const dynamic = "force-dynamic";
type SP = { type?: string; q?: string; category?: string; status?: string; sort?: string; page?: string };

export default async function Gallery({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  let result = { rows: [] as Awaited<ReturnType<typeof listReports>>["rows"], total: 0 };
  let failed = false;
  try {
    result = await listReports({ type: sp.type, q: sp.q, category: sp.category, status: sp.status, sort: sp.sort, page });
  } catch {
    failed = true;
  }
  const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...over })) if (v) p.set(k, String(v));
    return `/gallery?${p.toString()}`;
  };
  // Satu laporan = satu kartu. Tab memfilter berdasarkan STATUS, sehingga mengubah status
  // memindahkan kartu yang sama ke tab lain (tidak membuat kartu ganda).
  const tab = (label: string, status: string) => (
    <Link
      href={qs({ status, page: "1" })}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${(sp.status ?? "") === status ? "bg-navy-700 text-white shadow" : "border border-slate-300 bg-white text-slate-600 hover:bg-navy-50"}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-navy-800">Galeri Barang</h1>
        <p className="text-sm text-slate-500">Setiap barang hanya tampil satu kali. Statusnya berubah saat barang ditemukan atau sudah dikembalikan.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tab("Semua", "")}
        {tab("🔎 Hilang", "HILANG")}
        {tab("📦 Ditemukan", "DITEMUKAN")}
        {tab("✅ Selesai", "SELESAI")}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500">Jenis laporan:</span>
        {[["", "Semua"], ["LOST", "🔎 Kehilangan"], ["FOUND", "📦 Penemuan"]].map(([v, l]) => (
          <Link key={v} href={qs({ type: v, page: "1" })} className={`rounded-full border px-3 py-1 font-medium ${(sp.type ?? "") === v ? "border-navy-700 bg-navy-50 text-navy-700" : "border-slate-300 bg-white text-slate-600"}`}>{l}</Link>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link href={qs({ category: "", page: "1" })} className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${!sp.category ? "border-navy-700 bg-navy-50 text-navy-700" : "border-slate-300 bg-white text-slate-600"}`}>Semua kategori</Link>
        {CATEGORIES.map((c) => (
          <Link key={c} href={qs({ category: c, page: "1" })} className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${sp.category === c ? "border-navy-700 bg-navy-50 text-navy-700" : "border-slate-300 bg-white text-slate-600"}`}>
            {CATEGORY_ICON[c]} {c}
          </Link>
        ))}
      </div>

      <form method="get" className="card grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        {sp.type && <input type="hidden" name="type" value={sp.type} />}
        {sp.category && <input type="hidden" name="category" value={sp.category} />}
        <input name="q" defaultValue={sp.q ?? ""} placeholder="🔍 Cari nama, deskripsi, lokasi…" maxLength={60} className="input" aria-label="Kata kunci" />
        <select name="sort" defaultValue={sp.sort ?? "newest"} className="input" aria-label="Urutkan">
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
        </select>
        <button className="btn btn-primary">Cari</button>
      </form>

      {failed ? (
        <p className="card p-8 text-center text-red-600">Gagal memuat data. Coba lagi nanti.</p>
      ) : result.rows.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-4xl">🕵️</p>
          <p className="mt-2 text-slate-500">Tidak ada laporan yang cocok. Coba ubah kata kunci atau filter.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{result.rows.map((r) => <ReportCard key={r.id} r={r} />)}</div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link className="btn btn-ghost" href={qs({ page: String(page - 1) })}>← Sebelumnya</Link>}
          <span className="text-slate-500">Halaman {page} dari {pages}</span>
          {page < pages && <Link className="btn btn-ghost" href={qs({ page: String(page + 1) })}>Berikutnya →</Link>}
        </div>
      )}
    </div>
  );
}
