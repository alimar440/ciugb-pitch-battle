# Sprint 2 — Inscriptions des équipes

## Objectif et état

Le parcours de candidature est implémenté côté application : formulaire en trois étapes, validations client et serveur, responsable inclus parmi les membres, acceptations datées/versionnées, vérification Turnstile, limite de tentatives, enregistrement SQL atomique et référence aléatoire. Le bouton « Postuler » est visible dans le hero de l’accueil et ouvre `/postuler`.

**État de livraison : code prêt, activation Supabase en attente.** Aucun projet Supabase n’était configuré dans le dépôt. Il faut appliquer la migration, renseigner une édition et ses modalités réelles, déployer l’Edge Function, et configurer Turnstile avant qu’une vraie candidature puisse être enregistrée. Le formulaire annonce explicitement cet état et ne prétend pas enregistrer un dossier sans backend.

## User stories

| ID | Priorité | Estimation indicative | État |
| --- | --- | --- | --- |
| US-20 — Une équipe peut présenter son équipe et son projet sans compte étudiant | P0 · 2 j | Formulaire Angular en trois étapes ; dépôt anonyme via Edge Function | Implémentée, intégration à activer |
| US-21 — Le responsable est identifiable et contactable | P0 · 0,5 j | Responsable inclus, coordonnées obligatoires, autres membres extensibles | Implémentée |
| US-22 — Une équipe ne dépasse pas les limites définies par le comité | P0 · 0,5 j | Tailles min/max lues depuis la configuration serveur et revérifiées dans la transaction | Implémentée, nécessite configuration |
| US-23 — L’équipe reçoit une preuve de dépôt sans accéder à son dossier | P0 · 0,5 j | Référence aléatoire retournée ; pas d’API publique de lecture | Implémentée |
| US-24 — Les dossiers sont protégés contre les accès directs et les soumissions automatisées | P0 · 1,5 j | RLS sans politique candidate, Turnstile, honeypot, rate limit HMAC, validation serveur | Implémentée, déploiement à faire |

## Tâches réalisées

| Tâche | Responsable | Dépendances | Fichiers principaux |
| --- | --- | --- | --- |
| Ajouter une route d’inscription lazy-loadée et lier le CTA d’accueil | Développeur unique | Sprint 1 | `src/app/app.routes.ts`, `src/app/features/public/home-page/` |
| Créer les étapes équipe, projet et vérification avec validations accessibles | Développeur unique | Modalités à configurer | `src/app/features/registration/application-page/` |
| Ajouter schéma, contraintes, RLS et transaction atomique service-role-only | Développeur unique | Migration à appliquer | `supabase/migrations/20261110000000_registration.sql` |
| Valider côté serveur, limiter les tentatives et vérifier Turnstile | Développeur unique | Secrets Edge Function et clé Turnstile | `supabase/functions/submit-application/index.ts` |
| Ajouter la configuration publique séparée du code Angular | Développeur unique | URL/anon key et clé site publique | `public/runtime-config.js`, `src/app/core/runtime-config.ts` |
| Ajouter tests du CTA et de l’état non configuré | Développeur unique | Runner Angular/Vitest | `home-page.spec.ts`, `application-page.spec.ts` |

## Critères d’acceptation

- Le bouton « Postuler » apparaît sur l’accueil et ouvre `/postuler`.
- Les champs texte et les coordonnées du responsable sont validés côté navigateur et côté Edge Function.
- Les limites d’équipe et les versions de règlement/confidentialité sont revérifiées côté serveur/transaction.
- Le dépôt crée la candidature et tous les membres dans une transaction ; une erreur ne laisse pas de dossier incomplet.
- Le candidat reçoit seulement une référence et n’a pas de droit `SELECT` sur les candidatures ou membres.
- L’envoi exige un jeton Turnstile lié au domaine et à l’action `application`, un accord aux textes/version affichés et respecte une limite de 50 tentatives par empreinte IP HMAC sur une heure (empreintes expirées purgées après un jour).
- Tant que la configuration réelle manque, l’interface informe le visiteur et bloque l’envoi.

## Configuration à effectuer avant les candidatures réelles

1. Créer le projet Supabase, appliquer la migration avec `supabase db push` et vérifier les droits avec un compte anonyme.
2. Insérer l’édition et ses paramètres réels via l’éditeur SQL Supabase : `registration_open` reste `false` jusqu’à validation des textes et des règles. Renseigner taille min/max, date limite si confirmée, règlement + version et notice de confidentialité + version. Aucun texte ou date n’est fourni par ce sprint.
3. Créer un widget Cloudflare Turnstile et renseigner sa clé publique dans `public/runtime-config.js`.
4. Déployer `submit-application` et configurer `TURNSTILE_SECRET_KEY`, `TURNSTILE_ALLOWED_HOSTNAME`, `RATE_LIMIT_HMAC_SECRET` (valeur aléatoire longue) et `ALLOWED_ORIGIN` comme secrets de fonction. `SUPABASE_SERVICE_ROLE_KEY` est utilisé uniquement dans l’Edge Function, jamais dans le bundle Angular.
5. Renseigner l’URL Supabase et la clé `anon` publique dans `public/runtime-config.js`, publier le site, puis exécuter un dépôt de recette et contrôler l’absence de lecture anonyme directe.
6. Ouvrir les inscriptions seulement après validation par le comité des critères, des textes et des durées de conservation. Ajouter ensuite les contrôles de sécurité complets aux tests d’intégration.

## Branches, tests, démonstration et risques

- Branche de travail conservée : `feature/sprint-0-foundations` (elle contient déjà les sprints précédents et des modifications non commitées). Aucun commit ni push n’est fait.
- Tests Angular : le résultat de l’exécution sera noté après implémentation.
- Migration/Edge Function et RLS : à valider sur le projet Supabase réel ; cette session ne dispose pas de ses identifiants.
- Démonstration : ouvrir `/`, utiliser « Postuler », parcourir les trois étapes, constater l’état non configuré ; après configuration, effectuer un dépôt de recette et vérifier la référence ainsi que le refus des lectures anonymes.
- Risque principal : les candidatures réelles ne peuvent pas être acceptées avant création/configuration du projet Supabase et confirmation des informations métier et légales.

## Hors périmètre

Connexion admin, consultation/modification des candidatures, présélection, export, emails de confirmation, annulation par candidat, publication des finalistes et politique de conservation définitive.
