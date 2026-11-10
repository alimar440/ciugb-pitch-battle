# Sprint 1 — Présentation publique

## État

Fonctionnalités implémentées et build de production réussi. La vérification visuelle dans le navigateur n'a pas pu être faite dans cette session : le port 4200 était déjà utilisé et l'accès Computer Use a expiré. Les styles responsive et le menu mobile sont présents dans le code.

## Objectif et périmètre

Présenter clairement le Pitch Battle en français, exposer les étapes, les informations confirmées et les questions encore en attente, avec une navigation adaptée au mobile. Aucun formulaire de candidature, contenu officiel non fourni, page admin ou service Supabase n'entre dans le sprint.

## User stories

| ID | Priorité | Critère de sortie |
| --- | --- | --- |
| US-10 | P0 | Le visiteur comprend le concept, le type d'informations à fournir et les grandes étapes de sélection. |
| US-11 | P0 | Le visiteur peut naviguer vers les sections concept, parcours, informations, contact et finalistes. |
| US-12 | P0 | Les dates, le lieu, l'éligibilité et le contact inconnus sont signalés « À annoncer » ou « À préciser », sans invention. |
| US-13 | P1 | Une page dédiée peut accueillir les finalistes sans révéler de données tant que la publication n'est pas faite. |
| US-14 | P1 | Les pages publiques sont utilisables avec clavier, titres sémantiques, navigation mobile et préférence de réduction du mouvement. |

## Tâches réalisées

| Tâche | Responsable | Dépendances | Fichiers principaux |
| --- | --- | --- | --- |
| Remplacer le gabarit Angular et configurer le chargement lazy de l'accueil, des finalistes et de la 404 | Développeur unique | Fondations Sprint 0 | `src/app/app.*`, `src/app/app.routes.ts`, `src/app/features/public/` |
| Construire la landing page : concept, éléments du pitch, étapes, informations, FAQ, contact et liens fonctionnels | Développeur unique | Contenu du cahier des charges | `src/app/features/public/home-page/`, `public-content.ts` |
| Créer la page d'attente des finalistes et la 404 | Développeur unique | Aucune donnée publiée | `finalists-page.ts`, `not-found-page.ts` |
| Appliquer la palette fournie (`#101010`, `#A51018`, `#D21F2B`, `#FFFFFF`, `#F5F5F5`, `#A3A3A3`) et les variantes de logo fournies | Développeur unique | Ressources de marque transmises par l'utilisateur | `src/styles.css`, `public/ciugb-mark*.png` |
| Mettre à jour le titre, la langue, la description et le favicon remplaçable | Développeur unique | Nom du produit fourni | `src/index.html`, `public/favicon.svg` |

## Critères d'acceptation

- La page d'accueil présente le Pitch Battle et son parcours sans chiffres, partenaires, prix, règlement ou critères d'évaluation inventés.
- Les liens vers les sections et la page des finalistes sont opérationnels ; la route inconnue affiche une page 404.
- Les dates, lieu, ouverture/échéance d'inscription, éligibilité et contact restent éditables dans la configuration de contenu.
- Les données privées des équipes ne sont jamais montrées ; la page finalistes n'affiche aucune liste avant publication.
- La navigation mobile annonce son état et peut être ouverte/fermée au clavier.
- Le site utilise des landmarks, un lien d'évitement, un ordre de titres, des états focus visibles et respecte `prefers-reduced-motion`.
- `npm run build` réussit avec Node 24.22.1, compatible avec Angular 22.2.6.

## Branches et revue

Le travail est sur `feature/sprint-0-foundations`, créée avant les modifications. La branche contient aussi la clôture Sprint 0 et le Sprint 1 afin de conserver les changements non commités ensemble. Aucun commit ni push n'a été fait. Revue personnelle à effectuer avant partage ; PR possible lorsqu'un destinataire sera disponible.

## Vérification, risques et démonstration

- Build production : réussi ; les pages publiques apparaissent comme chunks lazy séparés.
- `git diff --check` : aucune erreur de diff.
- Tests automatisés : non exécutés dans cette session.
- Risque restant : confirmer le rendu réel sur mobile/desktop dans un navigateur. Un serveur occupait déjà le port 4200 ; ne pas l'arrêter sans savoir à quel processus il appartient.
- Démonstration : parcourir `/`, les ancres du menu, `/finalistes` et une URL inconnue ; réduire la largeur viewport pour vérifier le menu et les sections verticales.

## Hors périmètre

Formulaire réel, ouverture d'inscription, règlement et confidentialité juridiquement validés, calendrier officiel, données Supabase, statistiques réelles, présélection, login admin et publication des finalistes.
