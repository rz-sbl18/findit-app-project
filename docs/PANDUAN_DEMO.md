# Panduan menjelaskan kode (persiapan demo)

PDF tugas mensyaratkan Anda mampu menjelaskan seluruh kode. Berikut alur utama dan pertanyaan yang mungkin diajukan.

## 1. Registrasi (`src/app/api/auth/register/route.ts`)
1. Cek `Origin` (anti CSRF) dan rate limit per IP.
2. Validasi dengan skema zod (`lib/validation.ts`): nama, email, password (min 8, huruf dan angka, bukan password umum). Skema `.strict()` menolak field tak dikenal, jadi `role` tidak bisa dikirim.
3. Password di-hash `bcrypt.hash(password, 12)`.
4. Insert ke `profiles`. Kolom `role` tidak diisi, jadi default `USER` dari database.
5. Token JWT dibuat dan disimpan di cookie HttpOnly, pengguna langsung login.

**Tanya jawab:** Mengapa bcrypt? Hash lambat dan bersalt, tahan brute force. Mengapa role tidak dari request? Agar tidak ada privilege escalation.

## 2. Login dan sesi (`api/auth/login`, `lib/auth.ts`)
1. Email dan password divalidasi. Query ke `profiles` memakai Supabase client (berparameter), bukan string SQL.
2. `bcrypt.compare` dengan hash tiruan jika email tidak ada, agar waktu respons sama.
3. Pesan gagal selalu "Email atau password salah" (tidak membocorkan email terdaftar).
4. JWT HS256, `exp` 8 jam, berisi `sub`, `role`, `sv` (session_version). Cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, prefix `__Host-`.
5. `getSession()` memverifikasi token lalu membaca ulang profil dari database dan membandingkan `sv`. Jadi akun yang dihapus, perubahan role, dan logout langsung berlaku.
6. Logout menaikkan `session_version`, sehingga token lama ditolak walau belum kedaluwarsa.

**Tanya jawab:** Mengapa tidak localStorage? Bisa dicuri lewat XSS. HttpOnly tidak bisa dibaca JavaScript.

## 3. Kontrol akses
- **RBAC:** `guard(req, { admin: true })` di `lib/security.ts` dipanggil di awal setiap API admin. Role dibaca dari database, bukan dari token. Halaman admin dicek di `lib/guards.ts`, dan `middleware.ts` hanya lapisan awal.
- **IDOR:** di `api/reports/[id]/route.ts`, laporan dicari dengan `.eq("id", id).eq("user_id", sesi.id)`. Jika bukan pemilik, hasilnya kosong dan server menjawab 404. UPDATE dan DELETE juga memakai dua filter yang sama, jadi tidak ada celah waktu antara cek dan tulis.
- **Mass assignment:** `updateReportSchema` hanya mengizinkan field tertentu.

## 4. Anti SQLi dan XSS
- **SQLi:** tidak ada SQL mentah. Pencarian disaring (`sanitizeSearch`) hanya huruf, angka, spasi, strip sebelum masuk filter. Kategori divalidasi terhadap daftar tetap (ini perbaikan temuan skenario 4).
- **XSS:** React meng-encode semua teks. Karakter `<` dan `>` ditolak di server. CSP membatasi sumber script dan melarang frame.

## 5. Upload (`lib/upload.ts`)
Ukuran maksimal 2 MB, ekstensi dan MIME harus jpg, png, atau webp, lalu isi file dicek lewat magic bytes. Nama file diganti UUID. Bucket Supabase juga membatasi tipe gambar.

## 6. RLS (`supabase/migrations/001_init.sql`)
RLS aktif di semua tabel. Peran `anon` dan `authenticated` hanya bisa membaca laporan aktif dan kategori, tanpa kolom `contact_info`. Tidak ada hak tulis. Penulisan hanya lewat server dengan service role setelah semua pemeriksaan.

**Tanya jawab:** Mengapa tetap perlu cek di server kalau ada RLS? Karena service role melewati RLS. Cek server adalah lapisan utama, RLS lapisan cadangan jika key anon bocor.

## 7. Batasan yang jujur untuk disebutkan
Rate limit di memori per instance, CSP masih `unsafe-inline`, logout membatalkan semua sesi akun, 3 temuan `npm audit` diterima dengan alasan.
