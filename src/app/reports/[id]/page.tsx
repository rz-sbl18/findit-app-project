import { notFound } from "next/navigation";
import Link from "next/link";
import { getReport } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { TYPE_LABEL } from "@/lib/constants";
import { uuidSchema } from "@/lib/validation";
import { StatusBadge } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const user = await getSession();
  const r = await getReport(id, { viewerId: user?.id, isAdmin: user?.role === "ADMIN" });
  if (!r) notFound();
  const isOwner = user?.id === r.user_id;

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/gallery" className="text-sm text-sky-600">← Kembali ke galeri</Link>
      <div className="card mt-3 overflow-hidden">
        {r.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.image_url} alt={r.item_name} referrerPolicy="no-referrer" className="max-h-96 w-full bg-navy-50 object-contain" />
        )}
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-sky-600">{TYPE_LABEL[r.report_type]}</span>
            <StatusBadge status={r.status} />
            {!r.is_active && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Dinonaktifkan moderator</span>}
          </div>
          {/* Semua teks pengguna dirender sebagai teks (React meng-encode otomatis); tanpa dangerouslySetInnerHTML. */}
          <h1 className="text-2xl font-bold text-navy-900">{r.item_name}</h1>
          <p className="whitespace-pre-wrap text-slate-700">{r.description}</p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-400">Kategori</dt><dd className="font-medium">{r.category}</dd></div>
            <div><dt className="text-slate-400">Lokasi</dt><dd className="font-medium">{r.location}</dd></div>
            <div><dt className="text-slate-400">Tanggal kejadian</dt><dd className="font-medium">{new Date(r.incident_date).toLocaleDateString("id-ID", { dateStyle: "long" })}</dd></div>
            <div><dt className="text-slate-400">Dilaporkan oleh</dt><dd className="font-medium">{r.profiles?.full_name ?? "Pengguna FindIt"}</dd></div>
          </dl>

          <div className="rounded-lg bg-navy-50 p-4 text-sm">
            <p className="font-semibold text-navy-800">Hubungi pelapor</p>
            {r.contact_info ? (
              <p className="mt-1 break-words">{r.contact_info}</p>
            ) : r.share_contact && !user ? (
              <p className="mt-1 text-slate-600">Kontak tersedia setelah Anda <Link href={`/login?next=/reports/${r.id}`} className="font-semibold text-navy-700 underline">masuk</Link>.</p>
            ) : (
              <p className="mt-1 text-slate-600">Pelapor tidak membagikan kontak langsung. Hubungi moderator kampus untuk proses pengembalian barang yang aman.</p>
            )}
            <p className="mt-2 text-xs text-slate-500">Demi keamanan, verifikasi kepemilikan secara langsung dan bertemu di area umum kampus.</p>
          </div>
          {isOwner && <Link className="btn btn-ghost" href={`/my-reports/${r.id}/edit`}>Ubah laporan</Link>}
        </div>
      </div>
    </article>
  );
}
