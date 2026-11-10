"use client";
import { useState } from "react";
import Link from "next/link";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const body = Object.fromEntries(f.entries());
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Terjadi kesalahan");
    if (isLogin) {
      const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      window.location.href = safe;
    } else {
      setOk("Registrasi berhasil. Silakan masuk.");
      setTimeout(() => (window.location.href = "/login"), 800);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-navy-800">{isLogin ? "Masuk ke FindIt" : "Buat akun FindIt"}</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="label" htmlFor="full_name">Nama lengkap</label>
              <input id="full_name" name="full_name" className="input" required minLength={2} maxLength={100} autoComplete="name" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="input" required maxLength={254} autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="input" required maxLength={72} autoComplete={isLogin ? "current-password" : "new-password"} />
            {!isLogin && <p className="mt-1 text-xs text-slate-500">Minimal 10 karakter, memuat huruf besar, huruf kecil, dan angka.</p>}
          </div>
          {!isLogin && (
            <div>
              <label className="label" htmlFor="confirm_password">Konfirmasi password</label>
              <input id="confirm_password" name="confirm_password" type="password" className="input" required maxLength={72} autoComplete="new-password" />
            </div>
          )}
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {ok && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{ok}</p>}
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Memproses…" : isLogin ? "Masuk" : "Daftar"}</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          {isLogin ? (
            <>Belum punya akun? <Link className="font-semibold text-navy-700" href="/register">Daftar</Link></>
          ) : (
            <>Sudah punya akun? <Link className="font-semibold text-navy-700" href="/login">Masuk</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
