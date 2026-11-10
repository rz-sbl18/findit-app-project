import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-6xl font-extrabold text-navy-700">404</p>
      <p className="mt-2 text-slate-500">Halaman tidak ditemukan.</p>
      <Link href="/" className="btn btn-primary mt-6">Kembali ke beranda</Link>
    </div>
  );
}
