import Link from "next/link";
import { listReports } from "@/lib/data";
import { AdminReportRow } from "@/components/AdminReportRow";

export const dynamic = "force-dynamic";

export default async function AdminReports({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total } = await listReports({ includeInactive: true, q: sp.q, page, pageSize: 20 });
  const pages = Math.max(1, Math.ceil(total / 20));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy-800">Manajemen Postingan ({total})</h1>
      <form className="flex gap-2">
        <input name="q" defaultValue={sp.q ?? ""} maxLength={60} placeholder="Cari postingan…" className="input max-w-sm" />
        <button className="btn btn-primary">Cari</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Barang</th><th className="p-3">Pelapor</th><th className="p-3">Status</th><th className="p-3">Tampil</th><th className="p-3">Aksi</th></tr></thead>
          <tbody>{rows.map((r) => <AdminReportRow key={r.id} r={r} />)}</tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center text-slate-500">Tidak ada postingan.</p>}
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link className="btn btn-ghost" href={`/admin/reports?page=${page - 1}&q=${encodeURIComponent(sp.q ?? "")}`}>←</Link>}
          <span>Halaman {page} / {pages}</span>
          {page < pages && <Link className="btn btn-ghost" href={`/admin/reports?page=${page + 1}&q=${encodeURIComponent(sp.q ?? "")}`}>→</Link>}
        </div>
      )}
    </div>
  );
}
