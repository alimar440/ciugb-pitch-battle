-- Completes the public finalist consent captured by the application form.
create or replace function public.submit_application(p_payload jsonb, p_rules_version text, p_privacy_version text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_contest public.contests%rowtype;
  v_settings public.contest_settings%rowtype;
  v_application_id uuid;
  v_reference text := 'CIUGB-' || upper(encode(extensions.gen_random_bytes(5), 'hex'));
  v_members jsonb := p_payload -> 'members';
  v_leader_count integer;
  v_size integer;
begin
  select c.* into v_contest from public.contests c join public.contest_settings s on s.contest_id = c.id
  where s.registration_open and (s.registration_deadline is null or s.registration_deadline >= current_date)
    and s.min_team_size is not null and s.max_team_size is not null
    and s.rules_text is not null and s.rules_version is not null
    and s.privacy_notice_text is not null and s.privacy_notice_version is not null
  order by c.created_at desc limit 1;
  if v_contest.id is null then raise exception 'REGISTRATION_CLOSED'; end if;
  select s.* into v_settings from public.contest_settings s where s.contest_id = v_contest.id;
  if p_rules_version <> v_settings.rules_version or p_privacy_version <> v_settings.privacy_notice_version then raise exception 'TERMS_UPDATED'; end if;
  if jsonb_typeof(v_members) <> 'array' then raise exception 'INVALID_MEMBERS'; end if;
  v_size := jsonb_array_length(v_members);
  if v_size < v_settings.min_team_size or v_size > v_settings.max_team_size then raise exception 'INVALID_TEAM_SIZE'; end if;
  select count(*) into v_leader_count from jsonb_array_elements(v_members) m where coalesce((m ->> 'isLeader')::boolean, false);
  if v_leader_count <> 1 then raise exception 'INVALID_LEADER'; end if;
  insert into public.applications (contest_id, reference, team_name, project_title, summary, problem, solution, category, finalist_publication_consent, rules_accepted_at, privacy_notice_accepted_at, rules_version, privacy_notice_version)
  values (v_contest.id, v_reference, btrim(p_payload ->> 'teamName'), btrim(p_payload ->> 'projectTitle'), btrim(p_payload ->> 'summary'), btrim(p_payload ->> 'problem'), btrim(p_payload ->> 'solution'), nullif(btrim(p_payload ->> 'category'), ''), coalesce((p_payload ->> 'finalistPublicationConsent')::boolean, false), now(), now(), p_rules_version, p_privacy_version)
  returning id into v_application_id;
  insert into public.team_members(application_id, full_name, is_leader, email, phone)
  select v_application_id, btrim(member ->> 'fullName'), coalesce((member ->> 'isLeader')::boolean, false), nullif(lower(btrim(member ->> 'email')), ''), nullif(btrim(member ->> 'phone'), '') from jsonb_array_elements(v_members) member;
  return v_reference;
end;
$$;
