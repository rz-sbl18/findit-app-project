"use client";
import { useState } from "react";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => window.location.href;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="btn btn-ghost"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            window.prompt("Salin tautan ini:", url());
          }
        }}
      >
        {copied ? "✓ Tautan disalin" : "🔗 Salin tautan"}
      </button>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${title} — ${url()}`)}`, "_blank", "noopener,noreferrer")}
      >
        💬 Bagikan ke WhatsApp
      </button>
    </div>
  );
}
