import Link from "next/link";
import { Report, TYPE_LABEL } from "@/lib/constants";
import { StatusBadge } from "./Badge";

export function ReportCard({ r }: { r: Report }) {
  return (
    <Link href={`/reports/${r.id}`} className="card group overflow-hidden transition hover:shadow-md">
      <div className="flex aspect-[4/3] items-center justify-center bg-navy-50 text-4xl">
        {r.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.image_url} alt={r.item_name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden>{r.report_type === "LOST" ? "🔎" : "📦"}</span>
        )}
      </div>
      <div className="space-y-1.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-sky-600">{TYPE_LABEL[r.report_type]}</span>
          <StatusBadge status={r.status} />
        </div>
        <h3 className="line-clamp-1 font-semibold text-navy-900 group-hover:text-navy-600">{r.item_name}</h3>
        <p className="line-clamp-1 text-sm text-slate-500">📍 {r.location}</p>
        <p className="text-xs text-slate-400">
          {r.category} · {new Date(r.incident_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
    </Link>
  );
}
