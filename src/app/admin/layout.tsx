import Link from "next/link";
import { requireAdminPage } from "@/lib/guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-sm font-semibold">
        <Link href="/admin" className="rounded-lg px-3 py-1.5 hover:bg-navy-50">Ringkasan</Link>
        <Link href="/admin/reports" className="rounded-lg px-3 py-1.5 hover:bg-navy-50">Postingan</Link>
        <Link href="/admin/users" className="rounded-lg px-3 py-1.5 hover:bg-navy-50">Pengguna</Link>
        <Link href="/admin/export" className="rounded-lg px-3 py-1.5 hover:bg-navy-50">Laporan &amp; Export</Link>
      </div>
      {children}
    </div>
  );
}
