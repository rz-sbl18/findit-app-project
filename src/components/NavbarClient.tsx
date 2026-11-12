"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "./LogoutButton";

const link = "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-navy-50 hover:text-navy-700";

export function NavbarClient({ user }: { user: { name: string; role: string } | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hover, setHover] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 60) setCollapsed(false);
      else if (y > lastY.current + 4) setCollapsed(true); // scroll ke bawah: mengecil jadi logo
      else if (y < lastY.current - 4) setCollapsed(false); // scroll ke atas: melebar kembali
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const small = collapsed && !hover;
  const canGoBack = pathname !== "/";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 flex justify-center px-3 sm:top-4">
      <nav
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className={`pointer-events-auto flex items-center gap-x-1 gap-y-1 overflow-hidden border border-white/60 bg-white/80 px-3 py-2 shadow-lg shadow-navy-900/10 ring-1 ring-slate-200/70 backdrop-blur-md transition-all duration-300 ease-out ${
          small ? "min-h-[3.25rem] w-auto flex-nowrap justify-center rounded-full" : "min-h-[3.25rem] w-full max-w-4xl flex-wrap rounded-3xl md:rounded-full md:px-4"
        }`}
      >
        {canGoBack && (
          <button
            type="button"
            aria-label="Kembali"
            title="Kembali"
            onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-navy-50 hover:text-navy-700 ${small ? "hidden" : ""}`}
          >
            <span aria-hidden>←</span>
          </button>
        )}
        <Link href="/" className={`shrink-0 text-xl font-extrabold tracking-tight text-navy-800 ${small ? "px-1" : "mx-auto sm:mx-0 sm:mr-2"}`} onClick={() => setHover(false)}>
          Find<span className="text-accent-500">It</span>
        </Link>
        <div className={`flex flex-1 flex-wrap items-center gap-1 transition-opacity duration-200 ${small ? "hidden" : "opacity-100"}`}>
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
        </div>
      </nav>
    </header>
  );
}
