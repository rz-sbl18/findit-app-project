import Link from "next/link";
import { requireUserPage } from "@/lib/guards";
import { userSummary } from "@/lib/data";
import { StatusBadge } from "@/components/Badge";
import { TYPE_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requireUserPage();
  const s = await userSummary(user.id);
  const stats = [
    ["Total laporan", s.total],
    ["Barang hilang", s.lost],
    ["Barang ditemukan", s.found],
    ["Masih aktif", s.active],
    ["Selesai", s.done],
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Halo, {user.full_name}</h1>
        <p className="text-sm text-slate-500">Ringkasan laporan Anda.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(([l, v]) => (
          <div key={l} className="card p-4">
            <p className="text-3xl font-extrabold text-navy-700">{v}</p>
            <p className="text-sm text-slate-500">{l}</p>
          </div>
        ))}
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-800">Aktivitas terbaru</h2>
          <Link href="/my-reports" className="text-sm font-semibold text-sky-600">Kelola semua →</Link>
        </div>
        {s.recent.length === 0 ? (
          <p className="card p-8 text-center text-slate-500">Belum ada aktivitas. <Link href="/reports/new" className="font-semibold text-navy-700 underline">Buat laporan pertama</Link>.</p>
        ) : (
          <ul className="space-y-2">
            {s.recent.map((r) => (
              <li key={r.id} className="card flex items-center justify-between gap-3 p-3">
                <Link href={`/reports/${r.id}`} className="font-medium text-navy-800 hover:underline">{r.item_name}</Link>
                <span className="text-xs text-slate-500">{TYPE_LABEL[r.report_type]}</span>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
