import Link from "next/link";
import { listReports, publicStats } from "@/lib/data";
import { CATEGORIES, CATEGORY_ICON } from "@/lib/constants";
import { ReportCard } from "@/components/ReportCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  let rows: Awaited<ReturnType<typeof listReports>>["rows"] = [];
  let stats = { total: 0, lost: 0, found: 0, done: 0 };
  let failed = false;
  try {
    [rows, stats] = await Promise.all([listReports({ pageSize: 8 }).then((r) => r.rows), publicStats()]);
  } catch {
    failed = true;
  }

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-700 to-sky-600 px-6 py-16 text-center text-white sm:px-12 sm:py-20">
        <div aria-hidden className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-accent-400/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative">
          <span className="rounded-full bg-white/10 px-4 py-1 text-xs font-semibold tracking-wide text-sky-100">Lost &amp; Found Kampus</span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Barangmu hilang? <span className="text-accent-400">Temukan di FindIt.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sky-100">
            Satu tempat untuk melaporkan dan mencari barang hilang atau ditemukan — tanpa harus menyebar info lewat grup chat.
          </p>
          <form action="/gallery" method="get" className="mx-auto mt-8 flex max-w-xl gap-2 rounded-full bg-white p-1.5 shadow-xl">
            <input name="q" maxLength={60} placeholder="Cari dompet, KTM, kunci, tumbler…" aria-label="Cari barang" className="min-w-0 flex-1 rounded-full bg-transparent px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none" />
            <button className="btn btn-accent !rounded-full">Cari</button>
          </form>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/reports/new" className="btn bg-white/10 text-white hover:bg-white/20 !rounded-full">+ Buat laporan</Link>
            <Link href="/gallery" className="btn bg-white/10 text-white hover:bg-white/20 !rounded-full">Lihat galeri</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["📋", "Total laporan", stats.total],
          ["🔎", "Sedang dicari", stats.lost],
          ["📦", "Telah ditemukan", stats.found],
          ["✅", "Selesai / kembali", stats.done],
        ].map(([i, l, v]) => (
          <div key={String(l)} className="card p-5 text-center">
            <div className="text-2xl">{i}</div>
            <p className="mt-1 text-3xl font-extrabold text-navy-700">{v}</p>
            <p className="text-xs text-slate-500">{l}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-navy-800">Jelajahi per kategori</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/gallery?category=${encodeURIComponent(c)}`} className="card flex flex-col items-center gap-1 p-4 text-center transition hover:-translate-y-1 hover:shadow-md">
              <span className="text-3xl">{CATEGORY_ICON[c]}</span>
              <span className="text-xs font-semibold text-slate-700">{c}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-navy-800">Laporan terbaru</h2>
          <Link href="/gallery" className="text-sm font-semibold text-sky-600">Lihat semua →</Link>
        </div>
        {failed ? (
          <p className="card p-8 text-center text-red-600">Data belum dapat dimuat. Coba lagi beberapa saat.</p>
        ) : rows.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-4xl">📭</p>
            <p className="mt-2 text-slate-500">Belum ada laporan. Jadilah yang pertama membuat laporan.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{rows.map((r) => <ReportCard key={r.id} r={r} />)}</div>
        )}
      </section>

      <section>
        <h2 className="text-center text-2xl font-bold text-navy-800">Cara kerja FindIt</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["1", "📝", "Buat laporan", "Isi data barang, lokasi, tanggal, dan foto. Kontak hanya dibagikan jika Anda mengizinkan."],
            ["2", "🔍", "Cari & saring", "Telusuri galeri berdasarkan kata kunci, kategori, dan status barang."],
            ["3", "🤝", "Kembalikan dengan aman", "Perbarui status laporan menjadi Ditemukan atau Selesai. Bertemu di area umum kampus."],
          ].map(([n, i, t, d]) => (
            <div key={n} className="card relative p-6">
              <span className="absolute right-4 top-3 text-5xl font-extrabold text-navy-50">{n}</span>
              <div className="text-3xl">{i}</div>
              <h3 className="mt-2 font-semibold text-navy-800">{t}</h3>
              <p className="mt-1 text-sm text-slate-500">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-navy-50 px-6 py-10 text-center">
        <h2 className="text-2xl font-bold text-navy-800">Kehilangan atau menemukan sesuatu?</h2>
        <p className="mt-1 text-slate-600">Buat laporan dalam kurang dari satu menit.</p>
        <Link href="/reports/new" className="btn btn-primary mt-5 !rounded-full">Buat laporan sekarang</Link>
      </section>
    </div>
  );
}
