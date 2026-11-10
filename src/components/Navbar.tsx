import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export async function Navbar() {
  const user = await getSession();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-navy-800">
          Find<span className="text-accent-500">It</span>
        </Link>
        <Link href="/gallery" className="text-sm font-medium text-slate-600 hover:text-navy-700">Galeri</Link>
        {user && (
          <>
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-navy-700">Dashboard</Link>
            <Link href="/my-reports" className="text-sm font-medium text-slate-600 hover:text-navy-700">Laporan Saya</Link>
            {user.role === "ADMIN" && <Link href="/admin" className="text-sm font-medium text-accent-600 hover:text-accent-500">Admin</Link>}
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link href="/reports/new" className="btn btn-accent">+ Buat Laporan</Link>
              <span className="hidden text-sm text-slate-500 sm:inline">{user.full_name}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">Masuk</Link>
              <Link href="/register" className="btn btn-primary">Daftar</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
