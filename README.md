# FindIt: Secure Lost & Found Portal

Aplikasi web untuk melaporkan, mencari, dan mengelola informasi barang hilang dan barang temuan di lingkungan kampus. Dibuat untuk Tugas Project Mata Kuliah Cyber Security (Pengembangan & Pengamanan Aplikasi Web).

- **URL aplikasi:** https://findit-app-delta.vercel.app
- **Repository:** https://github.com/rz-sbl18/findit-app-project

## Tujuan

Informasi barang hilang sering tersebar di grup chat dan sulit dicari kembali. FindIt menyediakan satu tempat terpusat dengan kontrol akses, kontak yang hanya dibagikan atas izin pelapor, dan moderasi oleh admin.

## Fitur

| Area | Fitur |
|---|---|
| Autentikasi | Registrasi (langsung masuk), login, logout, validasi input, penanganan login gagal |
| Laporan | Dua alur terpisah: **Kehilangan** dan **Penemuan** (form, label, dan badge berbeda; barang temuan punya "disimpan di") |
| CRUD | Tambah, lihat, ubah (termasuk ganti foto dan status), hapus laporan milik sendiri |
| Galeri publik | Cari kata kunci, filter status, jenis, kategori, urutan, pagination. Satu laporan = satu kartu; mengubah status memindahkan kartu yang sama |
| Detail | Foto, info, kontak sesuai izin pelapor, bagikan tautan, barang serupa |
| Dashboard user | Ringkasan jumlah laporan dan aktivitas terbaru |
| Admin | Lihat semua laporan dan pengguna, nonaktifkan, aktifkan, hapus laporan, statistik, rekap per bulan dan kategori (grafik), export CSV, audit log |
| Antarmuka | Navbar floating pill yang mengecil saat scroll, tombol kembali, halaman 403 dan 404, empty state |

## Teknologi

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3, Supabase (PostgreSQL + Storage), `bcryptjs`, `jose` (JWT), `zod`. Hosting di Vercel, source code di GitHub.

```
Browser -> Vercel (Next.js: halaman + API route) -> Supabase (PostgreSQL + Storage)
```

Semua akses database dilakukan dari server Next.js memakai service role key setelah pemeriksaan autentikasi, peran, dan kepemilikan. Browser tidak pernah memegang key database.

## Struktur folder

```
src/app/            halaman dan API route (api/auth, api/reports, api/admin)
src/components/     komponen UI
src/lib/            auth, validasi, keamanan, upload, akses data
src/middleware.ts   pengalihan awal untuk halaman yang butuh login
supabase/           migration SQL dan contoh seed admin
scripts/            skrip self-testing keamanan
docs/               hasil pengujian dan template laporan
```

## Menjalankan secara lokal

Prasyarat: Node.js 20 atau lebih baru, akun Supabase.

```bash
git clone https://github.com/rz-sbl18/findit-app-project.git
cd findit-app-project
npm install
cp .env.example .env.local   # isi nilainya
npm run dev
```

### Environment variable (`.env.local`)

| Nama | Keterangan |
|---|---|
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (hanya server, jangan beri awalan `NEXT_PUBLIC_`) |
| `JWT_SECRET` | String acak minimal 32 karakter, contoh: `openssl rand -base64 48` |

### Database dan Supabase

1. Buat project Supabase.
2. Jalankan berurutan isi `supabase/migrations/001_init.sql`, `002_session_version.sql`, `003_held_location.sql` di SQL Editor. Ini membuat tabel, indeks, RLS, dan bucket `report-images`.
3. Buat admin pertama dengan `supabase/seed_admin.sql` (ganti email dan password). Role admin tidak bisa dibuat lewat registrasi atau API.

## Deployment

1. Push repo ke GitHub, impor di Vercel (framework Next.js terdeteksi otomatis).
2. Isi tiga environment variable di atas pada Settings > Environment Variables (tandai key sebagai Sensitive).
3. Deploy. HTTPS dan sertifikat TLS disediakan Vercel. Batas free tier (build, bandwidth, pause project Supabase yang tidak aktif) mengikuti kebijakan masing-masing layanan.

## Akun uji

Admin: `admin@example.com`. Password diberikan pada laporan PDF, tidak disimpan di repo. User biasa: daftar sendiri lewat `/register`.

## Penerapan keamanan

| Kontrol | Penerapan | Lokasi |
|---|---|---|
| Hash password | bcrypt cost 12, hash tidak pernah dikirim ke klien | `api/auth/register`, `api/auth/login` |
| Anti SQL Injection | Query berparameter lewat Supabase client, validasi zod ketat (`.strict()`), kata kunci pencarian disaring sebelum masuk filter | `lib/validation.ts`, `lib/data.ts` |
| Anti XSS | React meng-encode output, tidak ada `dangerouslySetInnerHTML`, karakter `<` dan `>` ditolak di server, CSP | `lib/validation.ts`, `next.config.mjs` |
| Sesi | JWT HS256 di cookie `HttpOnly`, `Secure`, `SameSite=Lax`, prefix `__Host-` di produksi, masa berlaku 8 jam, logout menaikkan `session_version` sehingga token lama tidak berlaku | `lib/auth.ts` |
| CSRF | Cookie SameSite=Lax dan pemeriksaan header `Origin` pada semua request pengubah data | `lib/security.ts` |
| RBAC | Pemeriksaan peran di server (`guard`) dan dari database; middleware hanya lapisan awal | `lib/security.ts`, `lib/guards.ts` |
| Anti IDOR | UPDATE dan DELETE selalu memakai `id` dan `user_id` sesi; bukan pemilik menerima 404 | `api/reports/[id]` |
| Mass assignment | Skema zod `.strict()`; role, user_id, is_active tidak bisa dikirim klien | `lib/validation.ts` |
| RLS | Aktif di semua tabel, `anon` dan `authenticated` tidak punya hak tulis dan tidak bisa membaca `profiles`, `audit_logs`, atau `contact_info` | `supabase/migrations` |
| Upload | Whitelist MIME dan ekstensi, batas 2 MB, cek magic bytes, nama file acak (UUID), bucket dibatasi tipe gambar | `lib/upload.ts` |
| Secret | Hanya di environment variable; `.env*` di `.gitignore`; ada `.env.example` | `.gitignore` |
| Tambahan | Rate limit login dan registrasi, security headers (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy), audit log tindakan admin, sanitasi CSV terhadap formula injection, blocklist password umum | `lib/security.ts`, `next.config.mjs` |

## Self-testing keamanan

Jalankan terhadap aplikasi sendiri (Node.js 20+):

```bash
BASE_URL=https://findit-app-delta.vercel.app npm run test:security
```

Skrip membuat akun uji sementara dan menyimpan tabel hasil ke `docs/security-test-results.md`. Cakupan: IDOR, RBAC, XSS, SQL Injection, secret exposure (sisi situs), sesi dan cookie, upload, password lemah, CSRF, security headers, rate limiting.

Status saat ini: **hasil pengujian nyata belum dimasukkan.** Tabel di bawah diisi dari output skrip, bukan dari asumsi.

| No | Skenario | Status |
|---|---|---|
| 1 | IDOR | Belum dijalankan |
| 2 | RBAC | Belum dijalankan |
| 3 | XSS | Belum dijalankan |
| 4 | SQL Injection | Belum dijalankan |
| 5 | Secret exposure | Belum dijalankan |
| 6 | Sesi dan cookie | Belum dijalankan |
| 7 | Upload | Belum dijalankan |
| 8 | Password lemah | Belum dijalankan |
| 9 | CSRF | Belum dijalankan |
| 10 | Security headers | Belum dijalankan |
| 11 | Rate limiting | Belum dijalankan |

Pemeriksaan tambahan yang dilakukan manual: `npm audit`, pemindaian riwayat git (`git log -p | grep`), dan pengecekan header di securityheaders.com.

Pengujian RLS langsung di database (role `anon`) sudah dilakukan: membaca `profiles`, membaca `contact_info`, dan meng-update `reports` semuanya ditolak dengan `permission denied`.

## Penggunaan AI agent

Alat: **Claude (Anthropic)**, dipakai lewat antarmuka Claude Code.

| Bagian | Peran AI |
|---|---|
| Perancangan | Usulan arsitektur, skema database, kebijakan RLS |
| Implementasi | Penulisan awal kode aplikasi, migration SQL, skrip pengujian |
| Debugging | Analisis masalah pendaftaran dan konfigurasi deployment |
| Dokumentasi | Draf README dan template laporan |

Contoh prompt utama: "Bertindak sebagai tim pengembang... bangun aplikasi FindIt (Lost & Found Portal) dengan Next.js dan Supabase, dengan bcrypt, RBAC, RLS, perlindungan IDOR, XSS, SQL Injection, dan self-testing keamanan." Prompt lanjutan berisi perbaikan UI, alur laporan kehilangan dan penemuan, dan perubahan navbar.

Catatan peninjauan: kode hasil AI ditinjau dan diuji pada bagian autentikasi, sesi, dan query database. Tidak ada secret atau data pribadi nyata yang dimasukkan ke prompt. Pengujian keamanan diverifikasi manual oleh pemilik proyek.

## Batasan

- Rate limit disimpan di memori per instance serverless, jadi tidak ketat jika trafik tersebar ke banyak instance. Produksi sebaiknya memakai penyimpanan terpusat.
- CSP masih memakai `'unsafe-inline'` untuk script agar hydration Next.js bekerja tanpa nonce.
- Logout membatalkan semua sesi akun tersebut di semua perangkat (akibat `session_version`).
- Belum ada verifikasi email, reset password, dan pelaporan konten tidak pantas oleh pengguna.
- Free tier Supabase menjeda project yang tidak aktif dalam jangka waktu tertentu.

## Referensi

- Next.js: https://nextjs.org/docs
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
