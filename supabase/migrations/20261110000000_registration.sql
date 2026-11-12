create extension if not exists pgcrypto with schema extensions;

create type public.application_status as enum ('submitted', 'under_review', 'shortlisted', 'selected', 'rejected');

create table public.contests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (length(btrim(slug)) between 2 and 80),
  created_at timestamptz not null default now()
);

create table public.contest_settings (
  contest_id uuid primary key references public.contests(id) on delete cascade,
  registration_open boolean not null default false,
  registration_deadline date,
  min_team_size integer,
  max_team_size integer,
  rules_text text,
  rules_version text,
  privacy_notice_text text,
  privacy_notice_version text,
  updated_at timestamptz not null default now(),
  check (min_team_size is null or min_team_size > 0),
  check (max_team_size is null or max_team_size > 0),
  check (min_team_size is null or max_team_size is null or min_team_size <= max_team_size)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id),
  reference text not null unique,
  team_name text not null check (length(btrim(team_name)) between 1 and 120),
  project_title text not null check (length(btrim(project_title)) between 1 and 160),
  summary text not null check (length(btrim(summary)) between 1 and 1000),
  problem text not null check (length(btrim(problem)) between 1 and 2000),
  solution text not null check (length(btrim(solution)) between 1 and 2000),
  category text check (category is null or length(category) <= 100),
  status public.application_status not null default 'submitted',
  rules_accepted_at timestamptz not null,
  privacy_notice_accepted_at timestamptz not null,
  rules_version text not null,
  privacy_notice_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index applications_team_name_per_contest on public.applications (contest_id, lower(btrim(team_name)));
create index applications_contest_status_created on public.applications (contest_id, status, created_at desc);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  full_name text not null check (length(btrim(full_name)) between 1 and 160),
  is_leader boolean not null default false,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  check (email is null or length(email) <= 254),
  check (phone is null or length(phone) <= 40)
);
create unique index team_members_one_leader on public.team_members(application_id) where is_leader;

create table public.submission_attempts (
  fingerprint text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0)
);

alter table public.contests enable row level security;
alter table public.contest_settings enable row level security;
alter table public.applications enable row level security;
alter table public.team_members enable row level security;
alter table public.submission_attempts enable row level security;
revoke all on public.contests, public.contest_settings, public.applications, public.team_members, public.submission_attempts from anon, authenticated;

create or replace function public.consume_submission_attempt(p_fingerprint text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  delete from public.submission_attempts where window_started_at < now() - interval '1 day';
  insert into public.submission_attempts as attempts (fingerprint, window_started_at, request_count)
  values (p_fingerprint, now(), 1)
  on conflict (fingerprint) do update
    set window_started_at = case when attempts.window_started_at < now() - interval '1 hour' then now() else attempts.window_started_at end,
        request_count = case when attempts.window_started_at < now() - interval '1 hour' then 1 else attempts.request_count + 1 end
  returning request_count into v_count;
  return v_count <= 50;
end;
$$;

create or replace function public.submit_application(p_payload jsonb, p_rules_version text, p_privacy_version text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contest public.contests%rowtype;
  v_settings public.contest_settings%rowtype;
  v_application_id uuid;
  v_reference text := 'CIUGB-' || upper(encode(extensions.gen_random_bytes(5), 'hex'));
  v_members jsonb := p_payload -> 'members';
  v_leader_count integer;
  v_size integer;
begin
  select c.* into v_contest
  from public.contests c join public.contest_settings s on s.contest_id = c.id
  where s.registration_open
    and (s.registration_deadline is null or s.registration_deadline >= current_date)
    and s.min_team_size is not null and s.max_team_size is not null
    and s.rules_text is not null and s.rules_version is not null
    and s.privacy_notice_text is not null and s.privacy_notice_version is not null
  order by c.created_at desc limit 1;
  select s.* into v_settings from public.contest_settings s where s.contest_id = v_contest.id;
  if v_contest.id is null then raise exception 'REGISTRATION_CLOSED'; end if;
  if p_rules_version <> v_settings.rules_version or p_privacy_version <> v_settings.privacy_notice_version then raise exception 'TERMS_UPDATED'; end if;
  if jsonb_typeof(v_members) <> 'array' then raise exception 'INVALID_MEMBERS'; end if;
  v_size := jsonb_array_length(v_members);
  if v_size < v_settings.min_team_size or v_size > v_settings.max_team_size then raise exception 'INVALID_TEAM_SIZE'; end if;
  select count(*) into v_leader_count from jsonb_array_elements(v_members) m where coalesce((m ->> 'isLeader')::boolean, false);
  if v_leader_count <> 1 then raise exception 'INVALID_LEADER'; end if;

  insert into public.applications (contest_id, reference, team_name, project_title, summary, problem, solution, category, rules_accepted_at, privacy_notice_accepted_at, rules_version, privacy_notice_version)
  values (v_contest.id, v_reference, btrim(p_payload ->> 'teamName'), btrim(p_payload ->> 'projectTitle'), btrim(p_payload ->> 'summary'), btrim(p_payload ->> 'problem'), btrim(p_payload ->> 'solution'), nullif(btrim(p_payload ->> 'category'), ''), now(), now(), p_rules_version, p_privacy_version)
  returning id into v_application_id;

  insert into public.team_members(application_id, full_name, is_leader, email, phone)
  select v_application_id, btrim(member ->> 'fullName'), coalesce((member ->> 'isLeader')::boolean, false), nullif(lower(btrim(member ->> 'email')), ''), nullif(btrim(member ->> 'phone'), '')
  from jsonb_array_elements(v_members) member;
  return v_reference;
end;
$$;

revoke all on function public.consume_submission_attempt(text) from public, anon, authenticated;
grant execute on function public.consume_submission_attempt(text) to service_role;
revoke all on function public.submit_application(jsonb, text, text) from public, anon, authenticated;
grant execute on function public.submit_application(jsonb, text, text) to service_role;
