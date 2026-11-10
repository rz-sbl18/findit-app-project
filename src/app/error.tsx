"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-20 text-center">
      <p className="text-4xl font-extrabold text-navy-700">Terjadi kesalahan</p>
      <p className="mt-2 text-slate-500">Silakan coba lagi beberapa saat.</p>
      <button onClick={reset} className="btn btn-primary mt-6">Coba lagi</button>
    </div>
  );
}
