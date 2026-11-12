-- Official schedule confirmed by the organising committee.
update public.contest_settings
set registration_deadline = date '2026-11-25',
    event_date = date '2026-11-29',
    venue = 'Incubateur',
    updated_at = now()
where contest_id in (select id from public.contests where slug = 'ciugb-pitch-battle');
