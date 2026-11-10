import { STATUS_LABEL } from "@/lib/constants";

const COLORS: Record<string, string> = {
  HILANG: "bg-red-100 text-red-700",
  DITEMUKAN: "bg-emerald-100 text-emerald-700",
  SELESAI: "bg-slate-200 text-slate-700",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLORS[status] ?? "bg-slate-100"}`}>{STATUS_LABEL[status] ?? status}</span>;
}
