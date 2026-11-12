-- Administration, audit trail and the deliberately small public finalists projection.
-- Run after 20261110000000_registration.sql.

create type public.app_role as enum ('admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.contest_settings
  add column finalists_published boolean not null default false,
  add column event_date date,
  add column venue text,
  add column retention_days integer check (retention_days is null or retention_days > 0),
  add column updated_by uuid references public.profiles(id);

alter table public.applications
  add column finalist_publication_consent boolean not null default false;

create table public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  admin_id uuid not null references public.profiles(id),
  body text not null check (length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table public.status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  admin_id uuid references public.profiles(id),
  from_status public.application_status,
  to_status public.application_status not null,
  created_at timestamptz not null default now()
);

create or replace function public.record_initial_application_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.status_history(application_id, to_status) values (new.id, new.status);
  return new;
end;
$$;

create trigger applications_record_initial_status
  after insert on public.applications for each row execute function public.record_initial_application_status();

alter table public.profiles enable row level security;
alter table public.application_notes enable row level security;
alter table public.status_history enable row level security;
revoke all on public.profiles, public.application_notes, public.status_history from anon, authenticated;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Only the service role calls these functions. Browser clients never receive table access.
create or replace function public.set_application_status(p_application_id uuid, p_status public.application_status, p_admin_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_previous public.application_status;
begin
  select status into v_previous from public.applications where id = p_application_id for update;
  if v_previous is null then raise exception 'APPLICATION_NOT_FOUND'; end if;
  update public.applications set status = p_status, updated_at = now() where id = p_application_id;
  insert into public.status_history(application_id, admin_id, from_status, to_status)
  values (p_application_id, p_admin_id, v_previous, p_status);
end;
$$;

create or replace function public.list_published_finalists()
returns table(team_name text, project_title text, summary text, category text)
language sql stable security definer set search_path = '' as $$
  select a.team_name, a.project_title, a.summary, a.category
  from public.applications a
  join public.contest_settings s on s.contest_id = a.contest_id
  where a.status = 'selected'
    and a.finalist_publication_consent
    and s.finalists_published
  order by a.created_at asc;
$$;

revoke all on function public.is_admin(), public.set_application_status(uuid, public.application_status, uuid) from public, anon, authenticated;
revoke all on function public.list_published_finalists() from public;
grant execute on function public.list_published_finalists() to anon, authenticated;
grant execute on function public.set_application_status(uuid, public.application_status, uuid) to service_role;
