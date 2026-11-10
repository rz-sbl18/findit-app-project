type Stats = Awaited<ReturnType<typeof import("@/lib/data").adminStats>>;

export function StatsView({ s }: { s: Stats }) {
  const cards = [
    ["Laporan bulan ini", s.thisMonth],
    ["Total laporan", s.total],
    ["Barang hilang", s.lost],
    ["Barang ditemukan", s.found],
    ["Selesai", s.done],
    ["Dinonaktifkan", s.inactive],
    ["Pengguna", s.users],
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map(([l, v]) => (
          <div key={l} className="card p-4">
            <p className="text-3xl font-extrabold text-navy-700">{v}</p>
            <p className="text-sm text-slate-500">{l}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-2 font-semibold text-navy-800">Rekap per bulan</h3>
          {s.byMonth.length === 0 ? <p className="text-sm text-slate-500">Belum ada data.</p> : (
            <table className="w-full text-sm"><tbody>{s.byMonth.map(([m, c]) => <tr key={m} className="border-t"><td className="py-1.5">{m}</td><td className="text-right font-semibold">{c}</td></tr>)}</tbody></table>
          )}
        </div>
        <div className="card p-4">
          <h3 className="mb-2 font-semibold text-navy-800">Rekap per kategori</h3>
          {s.byCategory.length === 0 ? <p className="text-sm text-slate-500">Belum ada data.</p> : (
            <table className="w-full text-sm"><tbody>{s.byCategory.map(([m, c]) => <tr key={m} className="border-t"><td className="py-1.5">{m}</td><td className="text-right font-semibold">{c}</td></tr>)}</tbody></table>
          )}
        </div>
      </div>
    </div>
  );
}
