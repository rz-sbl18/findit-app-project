import Link from "next/link";
import { requireUserPage } from "@/lib/guards";
import { listReports } from "@/lib/data";
import { MyReportRow } from "@/components/MyReportRow";

export const dynamic = "force-dynamic";

export default async function MyReports() {
  const user = await requireUserPage();
  const { rows } = await listReports({ userId: user.id, includeInactive: true, pageSize: 100 });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-800">Laporan Saya</h1>
        <Link href="/reports/new" className="btn btn-accent">+ Buat Laporan</Link>
      </div>
      {rows.length === 0 ? (
        <p className="card p-8 text-center text-slate-500">Anda belum membuat laporan.</p>
      ) : (
        <div className="space-y-3">{rows.map((r) => <MyReportRow key={r.id} r={r} />)}</div>
      )}
    </div>
  );
}
