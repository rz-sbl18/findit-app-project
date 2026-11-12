import Link from "next/link";
import { CATEGORY_ICON, Report, timeAgo } from "@/lib/constants";
import { StatusBadge } from "./Badge";
import { TypeBadge } from "./TypeBadge";

export function ReportCard({ r }: { r: Report }) {
  return (
    <Link href={`/reports/${r.id}`} className="card group overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-navy-50 to-sky-100 text-5xl">
        {r.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.image_url} alt={r.item_name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <span aria-hidden>{CATEGORY_ICON[r.category] ?? "📦"}</span>
        )}
        <div className="absolute left-3 top-3"><StatusBadge status={r.status} /></div>
      </div>
      <div className="space-y-1.5 p-4">
        <TypeBadge type={r.report_type} />
        <h3 className="line-clamp-1 font-semibold text-navy-900 group-hover:text-navy-600">{r.item_name}</h3>
        <p className="line-clamp-1 text-sm text-slate-500">📍 {r.location}</p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{CATEGORY_ICON[r.category]} {r.category}</span>
          <span>{timeAgo(r.incident_date)}</span>
        </div>
      </div>
    </Link>
  );
}
