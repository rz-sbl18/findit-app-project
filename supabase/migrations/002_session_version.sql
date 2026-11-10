alter table public.profiles add column session_version integer not null default 0;

create or replace function public.touch_updated_at() returns trigger language plpgsql
set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger reports_touch before update on public.reports for each row execute function public.touch_updated_at();
