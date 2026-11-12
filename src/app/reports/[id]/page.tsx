import { notFound } from "next/navigation";
import Link from "next/link";
import { getReport, listReports } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { CATEGORY_ICON, timeAgo } from "@/lib/constants";
import { uuidSchema } from "@/lib/validation";
import { StatusBadge } from "@/components/Badge";
import { TypeBadge } from "@/components/TypeBadge";
import { ShareButtons } from "@/components/ShareButtons";
import { ReportCard } from "@/components/ReportCard";

export const dynamic = "force-dynamic";

export default async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const user = await getSession();
  const r = await getReport(id, { viewerId: user?.id, isAdmin: user?.role === "ADMIN" });
  if (!r) notFound();
  const isOwner = user?.id === r.user_id;
  const related = (await listReports({ category: r.category, pageSize: 5 }).catch(() => ({ rows: [], total: 0 }))).rows.filter((x) => x.id !== r.id).slice(0, 4);

  return (
    <article className="mx-auto max-w-4xl">
      <Link href="/gallery" className="text-sm text-sky-600">← Kembali ke galeri</Link>
      <div className="card mt-3 overflow-hidden">
        {r.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.image_url} alt={r.item_name} referrerPolicy="no-referrer" className="max-h-96 w-full bg-navy-50 object-contain" />
        )}
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={r.report_type} />
            <StatusBadge status={r.status} />
            {!r.is_active && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Dinonaktifkan moderator</span>}
          </div>
          {/* Semua teks pengguna dirender sebagai teks (React meng-encode otomatis); tanpa dangerouslySetInnerHTML. */}
          <h1 className="text-2xl font-bold text-navy-900">{r.item_name}</h1>
          <p className="whitespace-pre-wrap text-slate-700">{r.description}</p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-400">Kategori</dt><dd className="font-medium">{CATEGORY_ICON[r.category]} {r.category}</dd></div>
            <div><dt className="text-slate-400">{r.report_type === "LOST" ? "Lokasi terakhir terlihat" : "Lokasi ditemukan"}</dt><dd className="font-medium">{r.location}</dd></div>
            <div><dt className="text-slate-400">{r.report_type === "LOST" ? "Tanggal kehilangan" : "Tanggal ditemukan"}</dt><dd className="font-medium">{new Date(r.incident_date).toLocaleDateString("id-ID", { dateStyle: "long" })} <span className="text-slate-400">({timeAgo(r.incident_date)})</span></dd></div>
            {r.report_type === "FOUND" && r.held_location && <div><dt className="text-slate-400">Barang disimpan di</dt><dd className="font-medium">{r.held_location}</dd></div>}
            <div><dt className="text-slate-400">Dilaporkan oleh</dt><dd className="font-medium">{r.profiles?.full_name ?? "Pengguna FindIt"}</dd></div>
          </dl>

          <div className="rounded-lg bg-navy-50 p-4 text-sm">
            <p className="font-semibold text-navy-800">{r.report_type === "LOST" ? "Hubungi pemilik barang" : "Hubungi penemu"}</p>
            {r.contact_info ? (
              <p className="mt-1 break-words">{r.contact_info}</p>
            ) : r.share_contact && !user ? (
              <p className="mt-1 text-slate-600">Kontak tersedia setelah Anda <Link href={`/login?next=/reports/${r.id}`} className="font-semibold text-navy-700 underline">masuk</Link>.</p>
            ) : (
              <p className="mt-1 text-slate-600">Pelapor tidak membagikan kontak langsung. Hubungi moderator kampus untuk proses pengembalian barang yang aman.</p>
            )}
            <p className="mt-2 text-xs text-slate-500">{r.report_type === "FOUND" ? "Penemu akan meminta Anda menyebutkan ciri barang yang tidak terlihat di foto sebelum menyerahkannya. " : ""}Demi keamanan, bertemu di area umum kampus.</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ShareButtons title={r.item_name} />
            {isOwner && <Link className="btn btn-primary" href={`/my-reports/${r.id}/edit`}>Ubah laporan</Link>}
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold text-navy-800">Barang serupa ({r.category})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((x) => <ReportCard key={x.id} r={x} />)}</div>
        </section>
      )}
    </article>
  );
}
