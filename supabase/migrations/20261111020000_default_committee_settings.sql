-- Initial editable committee configuration. Registration remains closed until
-- the committee explicitly enables it from /admin.
insert into public.contests (slug) values ('ciugb-pitch-battle') on conflict (slug) do nothing;

insert into public.contest_settings (
  contest_id, registration_open, finalists_published, min_team_size, max_team_size,
  rules_text, rules_version, privacy_notice_text, privacy_notice_version
)
select id, false, false, 1, 5,
  'La candidature est portée par une équipe de 1 à 5 membres. Chaque équipe soumet un projet original, décrit de bonne foi et respecte les lois, les droits d’autrui et les règles de l’Université. Le comité peut demander des précisions, présélectionner les dossiers et modifier le calendrier en cas de nécessité. La décision finale du jury est communiquée par les canaux officiels du CIUGB. Toute information manifestement fausse, plagiée ou contraire au respect des personnes peut entraîner le retrait de la candidature.',
  'v1',
  'Le Club Informatique de l’Université Gaston Berger utilise les informations de candidature uniquement pour organiser le Pitch Battle : recevoir le dossier, contacter le responsable, évaluer les projets et communiquer les résultats. Les coordonnées des membres ne sont pas publiées. Elles sont accessibles seulement au comité habilité et ne sont pas cédées à des tiers. Vous pouvez demander une correction ou la suppression de vos données avant la clôture de l’édition en contactant le comité organisateur. La publication d’une équipe finaliste nécessite une case d’accord distincte dans le formulaire.',
  'v1'
from public.contests where slug = 'ciugb-pitch-battle'
on conflict (contest_id) do nothing;
