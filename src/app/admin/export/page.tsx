import { adminStats } from "@/lib/data";
import { StatsView } from "@/components/StatsView";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
  const s = await adminStats();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy-800">Laporan &amp; Export</h1>
        <a href="/api/admin/export" className="btn btn-primary">⬇ Unduh CSV (data aktual)</a>
      </div>
      <StatsView s={s} />
    </div>
  );
}
