-- FindIt: skema awal. Jalankan di Supabase SQL Editor atau via `supabase db push`.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null unique check (email = lower(email)),
  password_hash text not null,
  role text not null default 'USER' check (role in ('USER','ADMIN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id serial primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_name text not null check (char_length(item_name) between 2 and 120),
  category text not null references public.categories(name),
  description text not null check (char_length(description) <= 2000),
  report_type text not null check (report_type in ('LOST','FOUND')),
  location text not null check (char_length(location) between 2 and 200),
  incident_date date not null,
  image_url text,
  contact_info text check (char_length(contact_info) <= 200),
  share_contact boolean not null default false,
  status text not null default 'HILANG' check (status in ('HILANG','DITEMUKAN','SELESAI')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  created_at timestamptz not null default now()
);

create index reports_user_idx on public.reports(user_id);
create index reports_type_status_idx on public.reports(report_type, status, is_active);
create index reports_category_idx on public.reports(category);
create index reports_created_idx on public.reports(created_at desc);
create index reports_search_idx on public.reports using gin (to_tsvector('simple', item_name || ' ' || description || ' ' || location));
create index audit_actor_idx on public.audit_logs(actor_id, created_at desc);

insert into public.categories(name) values
 ('Elektronik'),('Dokumen'),('Aksesori'),('Tas'),('Pakaian'),('Peralatan kuliah'),('Lainnya');

-- Row Level Security: deny by default.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.reports enable row level security;
alter table public.audit_logs enable row level security;

create policy categories_public_read on public.categories for select to anon, authenticated using (true);
create policy reports_public_read on public.reports for select to anon, authenticated using (is_active = true);
-- Tidak ada policy tulis untuk anon/authenticated; profiles dan audit_logs tertutup total.
-- Semua penulisan dilakukan server Next.js (service role) setelah pemeriksaan RBAC + kepemilikan.

revoke all on public.profiles from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;
revoke insert, update, delete on public.reports from anon, authenticated;
revoke insert, update, delete on public.categories from anon, authenticated;
revoke select on public.reports from anon, authenticated;
grant select (id,user_id,item_name,category,description,report_type,location,incident_date,image_url,status,is_active,created_at,updated_at,share_contact) on public.reports to anon, authenticated;

-- Storage: bucket publik hanya-baca untuk gambar; unggahan hanya lewat server.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-images','report-images', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=excluded.public, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
