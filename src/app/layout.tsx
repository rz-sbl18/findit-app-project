import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FindIt — Lost & Found Portal",
  description: "Laporkan, cari, dan kelola informasi barang hilang dan ditemukan di lingkungan kampus.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          FindIt — Secure Lost &amp; Found Portal
        </footer>
      </body>
    </html>
  );
}
