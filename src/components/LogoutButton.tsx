"use client";
import { useState } from "react";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn btn-ghost"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      {busy ? "Keluar…" : "Keluar"}
    </button>
  );
}
