# Draf isi laporan (lengkapi bagian [ISI], lalu ekspor ke PDF)

Nama file akhir: TugasProject_CyberSec_NamaLengkap_NIM.pdf

## 1. Identitas
Nama: [ISI] | NIM: [ISI] | Kelas: [ISI]

## 2. URL aplikasi aktif
https://findit-app-delta.vercel.app

## 3. URL repository
https://github.com/rz-sbl18/findit-app-project

## 4. Akun uji
| Peran | Email | Password |
|---|---|---|
| Admin | admin@example.com | [ISI, password setelah diganti] |
| User | [ISI] | [ISI] |

## 5. Penjelasan aplikasi
**Latar belakang dan tujuan.** Informasi barang hilang di kampus biasanya tersebar di grup chat dan papan pengumuman sehingga sulit dicari kembali. FindIt menyatukannya di satu portal dengan autentikasi, kontrol akses, dan moderasi.

**Fitur utama.**
- Registrasi dan login (bcrypt, JWT cookie HttpOnly).
- Pengelolaan data (CRUD): laporan Kehilangan dan Penemuan dengan foto, ubah status, hapus.
- Laporan: rekap bulanan dan per kategori (grafik), export CSV khusus admin.
- Lainnya: galeri publik dengan pencarian dan filter, kontak hanya dibagikan atas izin pelapor, moderasi admin, audit log.

**Arsitektur dan teknologi.** Next.js 15 dan TypeScript di Vercel, Supabase PostgreSQL dan Storage. Browser berhubungan dengan Next.js, dan hanya server yang mengakses database dengan service role key.
`Browser -> Vercel (Next.js) -> Supabase (PostgreSQL + Storage)`

**Penerapan keamanan.** Salin tabel "Penerapan keamanan" dari README.

## 6. Potensi pengembangan ke skripsi
**Rumusan masalah yang mungkin:**
1. Bagaimana merancang pencocokan otomatis antara laporan kehilangan dan penemuan berdasarkan kemiripan teks dan gambar?
2. Seberapa efektif pencocokan otomatis mempercepat pengembalian barang dibandingkan pencarian manual?
3. Bagaimana menjaga privasi pelapor dan mencegah klaim palsu pada sistem lost and found?

**Fitur lanjutan:** pencocokan otomatis dan notifikasi, alur verifikasi klaim kepemilikan lewat moderator, verifikasi email dan reset password, pelaporan konten tidak pantas, penyimpanan rate limit terpusat, peta lokasi kampus, dan statistik waktu pengembalian barang.

## 7. Penggunaan AI agent
Salin bagian "Penggunaan AI agent" dari README. Tambahkan dengan kata Anda sendiri bagaimana Anda meninjau dan memverifikasi hasilnya (contoh: menjalankan skrip pengujian sendiri, menjalankan `npm audit`, membaca kode autentikasi dan akses data, mencoba aplikasi di browser).

## 8. Hasil self-testing keamanan
Tempel tabel dari README (11 skenario, semuanya Pass pada 13 November 2026) dan tangkapan layar output `npm run test:security`.

**Temuan dan perbaikan:**
| Temuan | Sebelum | Perbaikan | Sesudah |
|---|---|---|---|
| Payload SQLi di parameter `category` membuat API menjawab 500 | `API q+category=500` | Kategori divalidasi terhadap daftar tetap (commit `39592dc`) | `API q+category=200, total=0` |

**Pemindaian eksternal:** securityheaders.com A, SSL Labs A+ dan A (tangkapan layar terlampir).

**Audit dependency:** 3 temuan (zod, postcss, next). Dinilai tidak dapat dieksploitasi di FindIt dan diterima sementara. Alasan lengkap dan rencana perbaikan ada di README bagian "Temuan dependency dan pemindaian eksternal".

## 9. Tangkapan layar
- [ ] Registrasi dan login
- [ ] Laporan Saya (pengelolaan data)
- [ ] Dashboard admin dan export
- [ ] Gembok HTTPS dan detail sertifikat (klik ikon di kiri address bar, lalu "Connection is secure", lalu "Certificate")
- [ ] Vercel: domain dan environment variable (nilai disembunyikan)
- [x] securityheaders.com (A), SSL Labs (A+ dan A)
- [ ] Output `npm run test:security`
- [ ] Output `npm audit`

## 10. Kendala dan rencana perbaikan
Contoh: pendaftaran awal gagal karena `SUPABASE_SERVICE_ROLE_KEY` belum diatur di Vercel (diperbaiki dengan menambah variabel); rate limit memori per instance (rencana: Redis atau Upstash); 3 temuan `npm audit` (rencana: upgrade `zod` 4 dan `next` setelah uji kompatibilitas).
