import Link from "next/link";
import { listReports } from "@/lib/data";
import { CATEGORIES, PAGE_SIZE } from "@/lib/constants";
import { ReportCard } from "@/components/ReportCard";

export const dynamic = "force-dynamic";
type SP = { type?: string; q?: string; category?: string; status?: string; sort?: string; page?: string };

export default async function Gallery({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  let result = { rows: [] as Awaited<ReturnType<typeof listReports>>["rows"], total: 0 };
  let failed = false;
  try {
    result = await listReports({ ...sp, page });
  } catch {
    failed = true;
  }
  const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...over })) if (v) p.set(k, String(v));
    return `/gallery?${p.toString()}`;
  };
  const tab = (label: string, type: string) => (
    <Link href={qs({ type, page: "1" })} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${(sp.type ?? "") === type ? "bg-navy-700 text-white" : "bg-white text-slate-600 border border-slate-300"}`}>
      {label}
    </Link>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-800">Galeri Barang</h1>
      <div className="flex flex-wrap gap-2">
        {tab("Semua", "")}
        {tab("Barang Hilang", "LOST")}
        {tab("Barang Ditemukan", "FOUND")}
      </div>

      <form method="get" className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        {sp.type && <input type="hidden" name="type" value={sp.type} />}
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Cari nama, deskripsi, lokasi…" maxLength={60} className="input lg:col-span-2" aria-label="Kata kunci" />
        <select name="category" defaultValue={sp.category ?? ""} className="input" aria-label="Kategori">
          <option value="">Semua kategori</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className="input" aria-label="Status">
          <option value="">Semua status</option>
          <option value="HILANG">Hilang</option>
          <option value="DITEMUKAN">Ditemukan</option>
          <option value="SELESAI">Selesai</option>
        </select>
        <select name="sort" defaultValue={sp.sort ?? "newest"} className="input" aria-label="Urutkan">
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
        </select>
        <button className="btn btn-primary sm:col-span-2 lg:col-span-5">Terapkan</button>
      </form>

      {failed ? (
        <p className="card p-8 text-center text-red-600">Gagal memuat data. Coba lagi nanti.</p>
      ) : result.rows.length === 0 ? (
        <p className="card p-8 text-center text-slate-500">Tidak ada laporan yang cocok dengan pencarian Anda.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{result.rows.map((r) => <ReportCard key={r.id} r={r} />)}</div>
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
