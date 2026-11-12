# Template Laporan: TugasProject_CyberSec_NamaLengkap_NIM.pdf

Salin isi ini ke dokumen Word atau Docs, isi bagian bertanda `[ISI]`, lalu ekspor ke PDF.

## 1. Identitas
Nama: [ISI]  |  NIM: [ISI]  |  Kelas: [ISI]

## 2. URL Aplikasi Aktif
https://findit-app-delta.vercel.app

## 3. URL Repository
https://github.com/rz-sbl18/findit-app-project

## 4. Akun uji
| Peran | Email | Password |
|---|---|---|
| Admin | admin@example.com | [ISI, password yang sudah diganti] |
| User | [ISI] | [ISI] |

## 5. Penjelasan aplikasi
- **Latar belakang dan tujuan:** informasi barang hilang tersebar di grup chat dan sulit dicari. FindIt memusatkannya dengan kontrol akses dan moderasi.
- **Fitur utama:** registrasi dan login; CRUD laporan kehilangan dan penemuan; galeri dengan pencarian dan filter; dashboard user; dashboard admin; rekap dan export CSV.
- **Arsitektur dan teknologi:** Next.js + Supabase (PostgreSQL, Storage) di Vercel. Tempelkan diagram dari README.
- **Penerapan keamanan:** salin tabel "Penerapan keamanan" dari README.

## 6. Potensi pengembangan ke skripsi
Rumusan masalah yang mungkin: [ISI, contoh: efektivitas pencocokan otomatis laporan kehilangan dan penemuan]. Fitur lanjutan: pencocokan otomatis berbasis kemiripan teks dan gambar, notifikasi, verifikasi email, reset password, pelaporan konten, penyimpanan rate limit terpusat.

## 7. Penggunaan AI agent
Salin bagian "Penggunaan AI agent" dari README. Tambahkan: [ISI, cara Anda meninjau dan memverifikasi hasilnya].

## 8. Hasil self-testing keamanan
Tempel isi `docs/security-test-results.md` hasil menjalankan `npm run test:security`. Untuk setiap temuan yang diperbaiki, tambahkan kolom "Sebelum" dan "Sesudah".
Tambahan: hasil `npm audit`, hasil securityheaders.com, hasil pemindaian riwayat git.

## 9. Tangkapan layar (wajib)
- [ ] Halaman registrasi dan login
- [ ] Halaman pengelolaan data (Laporan Saya)
- [ ] Halaman laporan (dashboard admin dan export)
- [ ] Ikon gembok dan detail sertifikat HTTPS di browser
- [ ] Konfigurasi hosting (Vercel: domain dan environment variable dengan nilai disembunyikan)
- [ ] Bukti self-testing (output skrip, securityheaders.com, npm audit)

## 10. Kendala dan rencana perbaikan (opsional)
[ISI]
