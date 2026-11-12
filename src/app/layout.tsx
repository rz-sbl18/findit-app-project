import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FindIt | Lost & Found Portal",
  description: "Laporkan, cari, dan kelola informasi barang hilang dan ditemukan di lingkungan kampus.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-10 pt-28 sm:pt-32">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-8 text-center">
          <p className="text-lg font-extrabold text-navy-800">Find<span className="text-accent-500">It</span></p>
          <p className="mt-1 text-xs text-slate-500">Secure Lost &amp; Found Portal. Laporkan, cari, dan kembalikan barang dengan aman.</p>
        </footer>
      </body>
    </html>
  );
}
