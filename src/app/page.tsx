import Link from "next/link";
import { listReports } from "@/lib/data";
import { ReportCard } from "@/components/ReportCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  let rows: Awaited<ReturnType<typeof listReports>>["rows"] = [];
  let failed = false;
  try {
    rows = (await listReports({ pageSize: 6 })).rows;
  } catch {
    failed = true;
  }
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-600 px-6 py-14 text-center text-white sm:px-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Barangmu hilang? <span className="text-accent-400">Temukan di FindIt.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sky-100">
          Satu tempat untuk melaporkan dan mencari barang hilang atau ditemukan di lingkungan kampus — tanpa harus menyebar info lewat grup chat.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/gallery" className="btn btn-accent">Cari barang</Link>
          <Link href="/reports/new" className="btn bg-white/10 text-white hover:bg-white/20">Buat laporan</Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["📝", "Laporkan", "Buat laporan barang hilang atau ditemukan lengkap dengan foto."],
          ["🔍", "Cari & saring", "Cari berdasarkan kata kunci, kategori, dan status."],
          ["🤝", "Kembalikan dengan aman", "Kontak hanya dibagikan atas izin pelapor."],
        ].map(([i, t, d]) => (
          <div key={t} className="card p-5">
            <div className="text-2xl">{i}</div>
            <h3 className="mt-2 font-semibold text-navy-800">{t}</h3>
            <p className="text-sm text-slate-500">{d}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-bold text-navy-800">Laporan terbaru</h2>
          <Link href="/gallery" className="text-sm font-semibold text-sky-600">Lihat semua →</Link>
        </div>
        {failed ? (
          <p className="card p-8 text-center text-red-600">Data belum dapat dimuat. Coba lagi beberapa saat.</p>
        ) : rows.length === 0 ? (
          <p className="card p-8 text-center text-slate-500">Belum ada laporan. Jadilah yang pertama membuat laporan.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.map((r) => <ReportCard key={r.id} r={r} />)}</div>
        )}
      </section>
    </div>
  );
}
