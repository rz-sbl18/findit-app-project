// Self-testing keamanan FindIt. Jalankan: BASE_URL=https://findit-app-delta.vercel.app node scripts/security-tests.mjs
// Memakai akun uji sementara (sectest-*@example.test). Hanya jalankan terhadap aplikasi milik sendiri.
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = (process.env.BASE_URL || "").replace(/\/$/, "");
if (!BASE) { console.error("Set BASE_URL, contoh: BASE_URL=https://findit-app-delta.vercel.app"); process.exit(2); }
const ORIGIN = new URL(BASE).origin;
const rnd = Math.random().toString(36).slice(2, 8);
const PASS = "Uji" + rnd + "Kuat9";
const results = [];
const record = (no, name, steps, expected, actual, ok) => {
  results.push({ no, name, steps, expected, actual, status: ok ? "Pass" : "Fail" });
  console.log(`${ok ? "PASS" : "FAIL"}  [${no}] ${name}: ${actual}`);
};

const cookieOf = (res) => (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
const rawCookie = (res) => res.headers.getSetCookie?.() ?? [];
async function call(path, { method = "GET", cookie, json, form, origin = ORIGIN, redirect = "manual" } = {}) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (method !== "GET") headers.origin = origin;
  let body;
  if (json !== undefined) { headers["content-type"] = "application/json"; body = JSON.stringify(json); }
  if (form) body = form;
  const res = await fetch(BASE + path, { method, headers, body, redirect });
  const text = await res.text();
  let data = null; try { data = JSON.parse(text); } catch {}
  return { res, text, data, status: res.status };
}
const register = (email, password = PASS, name = "Penguji Uji") =>
  call("/api/auth/register", { method: "POST", json: { full_name: name, email, password, confirm_password: password } });
const reportBody = (over = {}) => ({
  report_type: "LOST", item_name: "Dompet uji " + rnd, category: "Lainnya", description: "Dompet hitam untuk pengujian keamanan",
  location: "Perpustakaan", incident_date: new Date().toISOString().slice(0, 10), share_contact: false, ...over,
});
const tinyPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

try {
  // Persiapan: dua user biasa
  const emailA = `sectest-a-${rnd}@example.test`, emailB = `sectest-b-${rnd}@example.test`;
  const regA = await register(emailA), regB = await register(emailB);
  if (regA.status !== 201 || regB.status !== 201) throw new Error(`Registrasi akun uji gagal (${regA.status}/${regB.status}): ${regA.text.slice(0, 120)}`);
  const A = cookieOf(regA.res), B = cookieOf(regB.res);

  // 1. IDOR
  const created = await call("/api/reports", { method: "POST", cookie: A, json: reportBody() });
  const id = created.data?.id;
  const patchB = await call(`/api/reports/${id}`, { method: "PATCH", cookie: B, json: { status: "SELESAI" } });
  const delB = await call(`/api/reports/${id}`, { method: "DELETE", cookie: B });
  const after = await call(`/api/reports/${id}`, { cookie: A });
  record(1, "IDOR", "User B PATCH dan DELETE laporan milik User A lewat API", "Ditolak (403/404), status tidak berubah",
    `PATCH=${patchB.status}, DELETE=${delB.status}, status laporan sekarang=${after.data?.status}`,
    [403, 404].includes(patchB.status) && [403, 404].includes(delB.status) && after.data?.status === "HILANG");
  const patchA = await call(`/api/reports/${id}`, { method: "PATCH", cookie: A, json: { status: "SELESAI" } });
  const ownerRole = await call(`/api/reports/${id}`, { method: "PATCH", cookie: A, json: { role: "ADMIN", user_id: "x" } });
  record(1.1, "IDOR / mass assignment", "Pemilik mengubah status sendiri; mencoba menyisipkan field role dan user_id", "Pemilik berhasil; field terlarang ditolak (400)",
    `pemilik PATCH=${patchA.status}, field terlarang=${ownerRole.status}`, patchA.status === 200 && ownerRole.status === 400);

  // 2. RBAC
  const rb = [];
  for (const path of ["/api/admin/stats", "/api/admin/users", "/api/admin/export", "/api/admin/reports"]) rb.push((await call(path, { cookie: A })).status);
  const anon = (await call("/api/admin/stats")).status;
  const page = await call("/admin", { cookie: A });
  const pageAnon = await call("/admin");
  record(2, "RBAC", "User biasa dan anonim mengakses API admin, export, dan halaman /admin",
    "User biasa 403, anonim 401, tidak ada data terkirim",
    `user: ${rb.join("/")}, anonim API=${anon}, halaman /admin user=${page.status}, anonim=${pageAnon.status}`,
    rb.every((s) => s === 403) && anon === 401 && page.status === 403 && [302, 303, 307, 308].includes(pageAnon.status));

  // 3. XSS
  const xss = "<script>alert(1)</script>";
  const xssCreate = await call("/api/reports", { method: "POST", cookie: A, json: reportBody({ item_name: xss }) });
  const xssDesc = await call("/api/reports", { method: "POST", cookie: A, json: reportBody({ description: "halo " + xss }) });
  const q = await call(`/gallery?q=${encodeURIComponent(xss)}`);
  const reflected = q.text.includes("<script>alert(1)</script>");
  record(3, "XSS", "Payload <script> pada nama, deskripsi, dan parameter URL ?q=",
    "Ditolak atau tampil sebagai teks, tidak dieksekusi",
    `nama=${xssCreate.status}, deskripsi=${xssDesc.status}, parameter q: status ${q.status}, payload mentah di HTML=${reflected}`,
    xssCreate.status === 400 && xssDesc.status === 400 && q.status === 200 && !reflected);

  // 4. SQL injection
  const sqli1 = await call("/api/auth/login", { method: "POST", json: { email: "' OR 1=1 --", password: "x" } });
  const sqli2 = await call("/api/auth/login", { method: "POST", json: { email: emailA, password: "' OR '1'='1" } });
  const sqli3 = await call(`/gallery?q=${encodeURIComponent("' OR 1=1 --")}`);
  const sqli4 = await call(`/api/reports?q=${encodeURIComponent("x%' OR 1=1 --")}&category=${encodeURIComponent("' OR 1=1 --")}`);
  record(4, "SQL Injection", "Payload ' OR 1=1 -- di email, password, parameter q dan category",
    "Login gagal, tidak ada cookie sesi, tidak ada kebocoran data",
    `login email=${sqli1.status}, login password=${sqli2.status}, cookie=${cookieOf(sqli1.res) || cookieOf(sqli2.res) ? "ADA" : "tidak ada"}, q=${sqli3.status}, API q+category=${sqli4.status} (total=${sqli4.data?.total})`,
    sqli1.status === 401 && sqli2.status === 401 && !cookieOf(sqli1.res) && !cookieOf(sqli2.res) && sqli3.status === 200 && sqli4.status === 200 && sqli4.data?.total === 0);

  // 5. Secret exposure (pemeriksaan sisi situs; periksa repo secara manual dengan git log -p | grep)
  const probes = await Promise.all([".env", ".env.local", ".git/config", "_next/static/../.env"].map((p) => call("/" + p)));
  const leak = (await call("/")).text;
  const leaked = /service_role|SUPABASE_SERVICE_ROLE_KEY|JWT_SECRET|eyJhbGciOi/.test(leak);
  record(5, "Secret exposure (situs)", "Akses /.env, /.git/config dan cari nama/nilai secret di HTML beranda", "404 dan tidak ada secret di HTML",
    `status=${probes.map((p) => p.status).join("/")}, secret di HTML=${leaked}`, probes.every((p) => p.status === 404) && !leaked);

  // 6. Sesi
  const login = await call("/api/auth/login", { method: "POST", json: { email: emailA, password: PASS } });
  const sc = rawCookie(login.res).join(" | ");
  const flags = { HttpOnly: /httponly/i.test(sc), Secure: /;\s*secure/i.test(sc), SameSite: /samesite=lax/i.test(sc), Path: /path=\//i.test(sc), HostPrefix: /^__Host-/.test(sc), MaxAge: /max-age=\d+/i.test(sc) };
  const oldCookie = cookieOf(login.res);
  const before = await call("/api/reports", { method: "POST", cookie: oldCookie, json: reportBody({ item_name: "Cek sesi " + rnd }) });
  const out = await call("/api/auth/logout", { method: "POST", cookie: oldCookie });
  const replay = await call("/api/reports", { method: "POST", cookie: oldCookie, json: reportBody() });
  const tampered = await call("/api/reports", { method: "POST", cookie: oldCookie.slice(0, -3) + "abc", json: reportBody() });
  const dash = await call("/dashboard", { cookie: oldCookie });
  record(6, "Session", "Periksa atribut cookie; logout lalu pakai ulang token lama; token dimanipulasi",
    "HttpOnly, Secure, SameSite, __Host-; token lama dan token palsu ditolak (401)",
    `flags=${JSON.stringify(flags)}, login=${login.status}, sebelum logout=${before.status}, logout=${out.status}, token lama=${replay.status}, token palsu=${tampered.status}, /dashboard token lama=${dash.status}`,
    Object.values(flags).every(Boolean) && before.status === 201 && out.status === 200 && replay.status === 401 && tampered.status === 401 && [302, 303, 307, 308].includes(dash.status));

  // 7. Upload
  const post = (file, name, type) => { const f = new FormData(); for (const [k, v] of Object.entries(reportBody({ item_name: "Upload " + rnd }))) f.set(k, String(v)); f.set("image", new Blob([file], { type }), name); return call("/api/reports", { method: "POST", cookie: B, form: f }); };
  const okUp = await post(tinyPng, "foto.png", "image/png");
  const phpUp = await post(Buffer.from("<?php echo 1; ?>"), "shell.php", "image/png");
  const fakeUp = await post(Buffer.from("ini bukan gambar"), "palsu.png", "image/png");
  const typeUp = await post(tinyPng, "foto.png", "text/html");
  const bigUp = await post(Buffer.concat([tinyPng, Buffer.alloc(2.5 * 1024 * 1024)]), "besar.png", "image/png");
  record(7, "Upload", "Unggah PNG valid, .php bertipe image/png, teks berekstensi .png, MIME text/html, file 2,5 MB",
    "Valid diterima (201); lainnya ditolak (400)",
    `valid=${okUp.status}, php=${phpUp.status}, isi palsu=${fakeUp.status}, MIME salah=${typeUp.status}, terlalu besar=${bigUp.status}`,
    okUp.status === 201 && [phpUp, fakeUp, typeUp, bigUp].every((r) => r.status === 400));
  if (okUp.data?.id) await call(`/api/reports/${okUp.data.id}`, { method: "DELETE", cookie: B });

  // 8. Password lemah
  const weak = [];
  for (const [i, pw] of ["pendek1", "passwordsaja", "12345678", "password1"].entries()) weak.push((await register(`sectest-w${i}-${rnd}@example.test`, pw)).status);
  record(8, "Password lemah", "Daftar dengan password pendek, tanpa angka, hanya angka, dan umum (password1)", "Semua ditolak (400)", `status=${weak.join("/")}`, weak.every((s) => s === 400));

  // 9. CSRF
  const csrf = await call("/api/reports", { method: "POST", cookie: A, origin: "https://evil.example", json: reportBody() });
  const noOrigin = await fetch(BASE + "/api/reports", { method: "POST", headers: { cookie: A, "content-type": "application/json" }, body: JSON.stringify(reportBody()) });
  record(9, "CSRF", "POST dengan cookie valid tetapi Origin asing atau tanpa Origin", "Ditolak (403)", `origin asing=${csrf.status}, tanpa origin=${noOrigin.status}`, csrf.status === 403 && noOrigin.status === 403);

  // 10. Header keamanan
  const h = (await call("/")).res.headers;
  const need = ["content-security-policy", "strict-transport-security", "x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy"];
  const missing = need.filter((n) => !h.get(n));
  record(10, "Security headers", "Periksa header respons beranda", "Semua header wajib ada", missing.length ? `hilang: ${missing.join(", ")}` : "semua ada", missing.length === 0);

  // 11. Rate limiting login (best effort: instance serverless memiliki memori sendiri)
  const codes = [];
  for (let i = 0; i < 8; i++) codes.push((await call("/api/auth/login", { method: "POST", json: { email: `sectest-rl-${rnd}@example.test`, password: "SalahTerus" + i } })).status);
  record(11, "Rate limiting login", "8 login gagal beruntun untuk email yang sama", "Muncul 429 setelah batas (5 percobaan)", `status=${codes.join(",")}`, codes.includes(429));

  // pembersihan: sesi A sudah dibatalkan oleh logout, jadi login ulang lalu hapus laporan uji
  const again = await call("/api/auth/login", { method: "POST", json: { email: emailA, password: PASS } });
  const cA = cookieOf(again.res);
  for (const rid of [id, before.data?.id]) if (rid) await call(`/api/reports/${rid}`, { method: "DELETE", cookie: cA });
} catch (e) {
  console.error("Pengujian berhenti:", e.message);
  results.push({ no: 0, name: "Persiapan", steps: "-", expected: "-", actual: e.message, status: "Fail" });
}

const md = ["| No | Skenario | Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |", "|---|---|---|---|---|---|",
  ...results.map((r) => `| ${r.no} | ${r.name} | ${r.steps} | ${r.expected} | ${r.actual.replace(/\|/g, "/")} | ${r.status} |`)].join("\n");
mkdirSync("docs", { recursive: true });
writeFileSync("docs/security-test-results.md", `# Hasil self-testing\n\nTarget: ${BASE}\nWaktu: ${new Date().toISOString()}\n\n${md}\n`);
console.log("\nTabel hasil disimpan di docs/security-test-results.md");
process.exit(results.some((r) => r.status === "Fail") ? 1 : 0);
