-- Template only: replace every <...> value in the SQL editor. It intentionally
-- creates no event dates, venue, rules or candidate data.
insert into public.contests (slug) values ('<technical-slug>') returning id;
-- Use the returned UUID below. Keep registration_open false until the text,
-- versions and team limits have been reviewed by the organising committee.
insert into public.contest_settings (
  contest_id, registration_open, min_team_size, max_team_size,
  rules_text, rules_version, privacy_notice_text, privacy_notice_version
) values (
  '<contest-uuid>', false, <minimum-team-size>, <maximum-team-size>,
  '<approved-rules-text>', '<rules-version>',
  '<approved-privacy-notice>', '<privacy-version>'
);
