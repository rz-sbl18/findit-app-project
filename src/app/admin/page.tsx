import { adminStats } from "@/lib/data";
import { StatsView } from "@/components/StatsView";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const s = await adminStats();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy-800">Admin Dashboard</h1>
      <StatsView s={s} />
    </div>
  );
}
