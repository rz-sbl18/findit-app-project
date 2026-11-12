-- Lokasi penyimpanan barang yang ditemukan (hanya relevan untuk laporan FOUND).
alter table public.reports add column held_location text check (char_length(held_location) <= 200);
grant select (held_location) on public.reports to anon, authenticated;
