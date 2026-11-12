export function TypeBadge({ type }: { type: string }) {
  const lost = type === "LOST";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${lost ? "border-rose-200 bg-rose-50 text-rose-700" : "border-teal-200 bg-teal-50 text-teal-700"}`}>
      {lost ? "🔎 Kehilangan" : "📦 Penemuan"}
    </span>
  );
}
