import Link from "next/link";
import { requireUserPage } from "@/lib/guards";
import { ReportForm } from "@/components/ReportForm";

export default async function NewReport({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requireUserPage();
  const { type } = await searchParams;
  if (type === "LOST" || type === "FOUND") return <ReportForm type={type} />;
  return (
    <div className="mx-auto max-w-3xl space-y-6 text-center">
      <div>
        <h1 className="text-3xl font-extrabold text-navy-800">Buat Laporan</h1>
        <p className="text-slate-500">Pilih jenis laporan yang ingin Anda buat.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/reports/new?type=LOST" className="card group p-8 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="text-5xl">🔎</div>
          <h2 className="mt-3 text-xl font-bold text-rose-700">Saya kehilangan barang</h2>
          <p className="mt-1 text-sm text-slate-500">Laporkan barang yang hilang agar orang lain bisa membantu menemukannya.</p>
        </Link>
        <Link href="/reports/new?type=FOUND" className="card group p-8 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="text-5xl">📦</div>
          <h2 className="mt-3 text-xl font-bold text-teal-700">Saya menemukan barang</h2>
          <p className="mt-1 text-sm text-slate-500">Laporkan barang temuan agar pemiliknya bisa segera mengambilnya.</p>
        </Link>
      </div>
    </div>
  );
}
