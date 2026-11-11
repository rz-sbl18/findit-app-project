"use client";
import { usePathname, useRouter } from "next/navigation";

/** Tombol kembali global: kembali ke halaman sebelumnya, atau ke beranda bila tidak ada riwayat. */
export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
      className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
    >
      <span aria-hidden>←</span> Kembali
    </button>
  );
}
