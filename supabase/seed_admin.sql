-- Membuat akun ADMIN pertama (jalankan manual di SQL Editor; ganti email & password).
-- Role admin TIDAK bisa dibuat lewat registrasi atau API.
insert into public.profiles(full_name, email, password_hash, role)
values ('Administrator FindIt', 'admin@example.com',
        extensions.crypt('GANTI_PASSWORD_KUAT', extensions.gen_salt('bf', 12)), 'ADMIN');
