import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

const link = "rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-navy-50 hover:text-navy-700";

export async function Navbar() {
  const user = await getSession();
  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 flex justify-center px-3 sm:top-4">
      <nav className="pointer-events-auto flex w-full max-w-4xl flex-wrap items-center gap-x-1 gap-y-1 rounded-3xl border border-white/60 bg-white/80 px-3 py-2 shadow-lg shadow-navy-900/10 ring-1 ring-slate-200/70 backdrop-blur-md md:rounded-full md:px-4">
        <Link href="/" className="mr-2 text-xl font-extrabold tracking-tight text-navy-800">
          Find<span className="text-accent-500">It</span>
        </Link>
        <Link href="/gallery" className={link}>Galeri</Link>
        {user && (
          <>
            <Link href="/dashboard" className={link}>Dashboard</Link>
            <Link href="/my-reports" className={link}>Laporan Saya</Link>
            {user.role === "ADMIN" && <Link href="/admin" className={`${link} text-accent-600`}>Admin</Link>}
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link href="/reports/new" className="btn btn-accent !rounded-full !px-4">+ Laporan</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost !rounded-full">Masuk</Link>
              <Link href="/register" className="btn btn-primary !rounded-full">Daftar</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
