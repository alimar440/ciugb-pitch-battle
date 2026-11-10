# Sprint 0 — Cadrage et fondations

## État

Terminé. Le dépôt a été inventorié ; TypeScript et les templates Angular sont stricts ; Tailwind est intégré ; l'architecture cible, le backlog et le modèle de données sont documentés et alignés sur le cahier des charges. Les dépendances ont été installées depuis le lockfile et le build de production a réussi avec Node 24.22.1. Le Node système 24.13.1 reste trop ancien pour Angular 22.2.6. Les champs officiels encore inconnus sont configurables et ne bloquent pas le schéma conceptuel ; ils devront être renseignés avant l'ouverture réelle des inscriptions.

## Objectif

Préparer une base Angular stricte et documenter le MVP, le modèle de données, la sécurité et le travail du développeur unique avant les fonctionnalités métier.

## Inventaire technique

- Angular standalone 22.2.x, TypeScript 6 et RxJS 7.8.
- Tailwind CSS 4.3 et son intégration PostCSS sont dans les dépendances ; l'import global Tailwind a été activé dans `src/styles.css`.
- Supabase JS 2.119 est dans les dépendances, sans configuration de projet ni migration repérée.
- Le routing est fourni par Angular, mais aucune route métier n'est encore déclarée.
- L'application contient encore le gabarit de bienvenue Angular.
- Cloudflare Pages n'a pas encore de configuration de déploiement dans le dépôt.
- `tsconfig.json` active maintenant le mode TypeScript strict et la vérification stricte des templates Angular.

## Backlog produit global

| Sprint | Objectif | Résultat attendu |
| --- | --- | --- |
| 0 — Cadrage et fondations | Définir le MVP et préparer le socle | Décisions, architecture, modèle conceptuel, sécurité et parcours initiaux documentés |
| 1 — Présentation publique | Expliquer le concours | Landing page, informations configurables, FAQ, contact et CTA responsive |
| 2 — Inscriptions | Recevoir les candidatures | Formulaire, validations, enregistrement serveur atomique, confirmation et anti-spam |
| 3 — Administration | Examiner et présélectionner | Auth admin, liste de dossiers, statuts, commentaires internes et historique |
| 4 — Finalistes et mise en ligne | Publier et exploiter le service | Publication explicite, recette, build de production et déploiement Pages |

Chaque sprint suivant requiert une validation explicite de l'utilisateur avant de commencer.

## User stories Sprint 0

| ID | Priorité | Estimation indicative | Critère de sortie |
| --- | --- | --- | --- |
| US-00 | P0 | 1–2 j | MVP, parcours et critères d'acceptation documentés ; inconnues métier visibles. |
| US-01 | P0 | 0,5 j | Conventions de travail solo, branches, revues personnelles et absence de commit sans accord précisées. |
| US-02 | P0 | 1–2 j | Schéma conceptuel et règles d'intégrité décrits, sans migration prématurée. |
| US-03 | P0 | 1–2 j | Menaces principales, frontières de confiance et politiques d'accès définies. |
| US-04 | P1 | 1–2 j | Architecture cible, parcours UX et wireframes à produire sont cadrés. |

Les estimations sont des jours de travail effectif ; la durée calendaire dépend de la disponibilité du développeur et des réponses aux questions métier.

## Répartition individuelle

Le développeur unique porte toutes les tâches :

1. Confirmer les règles produit et consigner les réponses/hypothèses.
2. Concevoir les données et les contrôles de sécurité.
3. Préparer l'architecture Angular, les routes lazy et les composants partagés.
4. Définir wireframes, responsive, accessibilité et tokens visuels après confirmation des références de marque.
5. Relire le diff, suivre les critères d'acceptation et demander une revue externe si une autre personne devient disponible.

Branche souhaitée : `feature/sprint-0-foundations`. L'environnement actuel interdit l'écriture dans les métadonnées Git ; la création de cette branche a échoué. Aucun commit ni push n'a été effectué. Les changements de travail restent à intégrer dans une branche dès que le dépôt autorisera cette opération.

## Architecture cible

```text
src/app/
  core/                 services singleton, configuration, guards
  shared/               composants, directives et pipes réutilisables
  features/
    public/             accueil, contenu du concours, finalistes publiés
    registration/       parcours de candidature
    admin/              authentification et gestion des candidatures
```

Les pages sont chargées en lazy loading. L'état local de composants utilise les signals quand ils simplifient le flux. Les contrats de données partagés seront typés. Les routes admin doivent être gardées côté client pour l'UX, mais l'autorisation réelle reste appliquée par Supabase/RLS et les fonctions côté serveur.

## Modèle de données

Le modèle détaillé s'appuie maintenant sur le cahier des charges fourni : `contests`, `contest_settings`, `applications`, `team_members`, `profiles`, `application_notes` et `status_history`. Une candidature représente l'équipe et son projet ; les membres sont liés à celle-ci, et le responsable est un membre désigné pour éviter les coordonnées en double. Le schéma relationnel, les contraintes, les projections publiques et les politiques d'accès proposées sont décrits dans [MODELE_DONNEES.md](MODELE_DONNEES.md). Il s'agit d'une conception à valider avant d'écrire les migrations.

## Sécurité et exploitation proposées

- Activer RLS pour chaque table exposée par l'API Supabase et écrire des politiques de refus par défaut.
- Ne jamais embarquer `service_role` ou autre secret dans Angular ; la clé anon/publishable n'est pas un secret mais doit rester soumise aux politiques RLS.
- Ne pas donner au navigateur un accès général en insertion/lecture aux tables contenant les dossiers. Préférer une opération serveur atomique (Edge Function ou RPC à privilèges minimaux), avec validation des champs, limites de taille et anti-spam.
- Vérifier les rôles admin côté base/serveur pour toute lecture ou décision ; un guard Angular seul ne protège aucune donnée.
- Ne publier les finalistes qu'après action explicite d'un admin, via une vue ou des champs publics minimaux séparés des données personnelles.
- Prévoir environnements local, préproduction et production avec secrets gérés hors du dépôt ; décrire les migrations et sauvegardes avant mise en production.
- Vérifier le plan Supabase choisi, ses limites, la rétention et la procédure de restauration avant le concours.

## Critères d'acceptation du Sprint 0

- Mode strict TypeScript et templates stricts configurés.
- Tailwind intégré au CSS global sans dépendance ajoutée.
- Architecture, backlog, schéma conceptuel et approche sécurité consignés.
- Questions métier non résolues distinguées des décisions techniques.
- Aucun secret, donnée de candidat fictive ou information officielle inventée ajoutée.
- Build de production réussi après les changements de fondation.
- Aucun commit ou push sans autorisation.

## Vérification et démonstration

Vérification prévue : `npm run build`. La démonstration consiste à parcourir ce document, l'architecture mise en place, l'activation du mode strict et l'intégration Tailwind. Aucun test automatisé spécifique n'est introduit dans ce sprint.

## Risques et décisions en attente

1. Taille autorisée des équipes et champs de candidature obligatoires.
2. Modification d'une candidature après soumission, fermeture/réouverture des inscriptions et gestion des doublons.
3. Critères de présélection, statuts exacts et personnes habilitées à décider.
4. Champs autorisés sur la page des finalistes et processus de publication.
5. Échéance réelle, règlement, lieu, prix et identité visuelle officielle.
6. Projet Supabase, comptes d'accès, régions, plan, sauvegardes et projet Cloudflare existants.
7. Règles de conservation/suppression des données personnelles à valider par l'organisateur.

Ces questions doivent être résolues avant les migrations et la collecte de données réelles. Aucune date, aucun lieu, prix ou règlement n'est inventé dans cette préparation.

## Hors périmètre Sprint 0

Landing page fonctionnelle, formulaire, migrations déployées, authentification admin en production, tableau de bord, présélection, publication et mise en ligne.
