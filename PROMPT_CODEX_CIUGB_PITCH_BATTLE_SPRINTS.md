# Prompt Codex — CIUGB Pitch Battle, développement par sprints

Tu es un ingénieur logiciel senior et facilitateur Scrum, spécialisé en Angular, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, RLS, Edge Functions) et Cloudflare Pages.

## Contexte
Plateforme du Pitch Battle organisé au troisième jour des 72H du Club Informatique de l'Université Gaston Berger (CIUGB). Environ 20 à 50 équipes attendues. Les équipes inscrivent leurs membres, présentent leur projet, puis les organisateurs présélectionnent des finalistes qui pitcheront le jour J.

Dépôt partagé par deux développeurs : https://github.com/alimar440/ciugb-pitch-battle

## Règles impératives
1. Lis `AGENTS.md`, le cahier des charges et le code existant avant toute proposition.
2. Vérifie `git rev-parse --show-toplevel` : la racine doit être exactement le dossier `ciugb-pitch-battle`. Si ce n'est pas le cas, arrête-toi et signale le problème. Ne touche jamais aux dossiers voisins.
3. Utilise Angular standalone, TypeScript strict, Tailwind CSS, Supabase et Cloudflare Pages. Pas de serveur applicatif permanent.
4. Travaillez à deux avec des branches `feature/*`, Pull Requests et revue mutuelle. Ne pousse pas sur `main`, ne fais pas de commit sans autorisation.
5. **Ne code que le sprint explicitement validé par l'utilisateur.** N'anticipe pas les autres sprints.
6. N'invente ni date, ni lieu, ni prix, ni règlement officiel : rends-les configurables.
7. Ne place aucune clé `service_role` ou autre secret dans Angular. Applique RLS, autorisations serveur, validation serveur et protection anti-spam.
8. Pas de données fictives présentées comme réelles. Documente les étapes qui exigent une action humaine sur Supabase ou Cloudflare.
9. Pour chaque sprint : backlog détaillé, tâches attribuées, dépendances, critères d'acceptation, tests, démonstration et état final.
10. Ne modifie pas de fichiers avant validation du plan initial.

## Backlog produit — sprints proposés
Durée indicative : une semaine par sprint, à adapter à l'échéance des 72H et à la disponibilité des deux développeurs.

### Sprint 0 — Cadrage et fondations
**Objectif :** mettre en place un socle collaboratif et sécurisé.
- Examiner le dépôt, `AGENTS.md`, les versions et les contraintes.
- Définir les user stories et critères d'acceptation du MVP.
- Définir les responsabilités des deux développeurs et les conventions Git.
- Configurer Angular, Tailwind, routing et structure `core/shared/features`.
- Concevoir le schéma PostgreSQL (équipes, membres, projets/candidatures, admins, paramètres, historique) sans doublons inutiles.
- Définir les stratégies RLS, l'inscription publique sécurisée, les environnements et les sauvegardes.
- Préparer les maquettes ou wireframes et le design system.
**Terminé quand :** projet compilable, architecture documentée, schéma validé et tâches distribuées.

### Sprint 1 — Présentation publique
**Objectif :** rendre le concours compréhensible et attractif.
- Landing page : hero, concept, objectifs, déroulement, conditions, calendrier, FAQ, contact et CTA.
- Navigation responsive, composants réutilisables, accessibilité de base.
- Paramètres éditoriaux sans fausses informations officielles.
- Préparer l'emplacement de la future page des finalistes sans publier de données privées.
**Terminé quand :** pages testables sur mobile et desktop, CTA opérationnels et build réussi.

### Sprint 2 — Inscriptions des équipes
**Objectif :** permettre le dépôt fiable d'une candidature.
- Formulaire multi-étapes sans compte étudiant obligatoire.
- Groupe, projet, résumé, problématique, solution, catégorie, responsable, membres.
- Taille d'équipe configurable, validations UX et serveur.
- Enregistrement atomique via opération sécurisée, référence unique et confirmation.
- Protection anti-spam, prévention des doublons, gestion des erreurs et tests RLS.
**Terminé quand :** une candidature réelle est enregistrée intégralement, confirmée et inaccessible aux autres candidats.

### Sprint 3 — Back-office et présélection
**Objectif :** donner aux organisateurs un processus de sélection maîtrisé.
- Connexion Supabase Auth et vérification du rôle admin côté base.
- Tableau de bord, liste, recherche, filtres et fiche candidature.
- Statuts : soumise, en examen, présélectionnée, finaliste, non retenue.
- Commentaires internes, historique des décisions et export CSV sécurisé.
- Paramètres : période d'inscription, nombre de membres et finalistes.
**Terminé quand :** seul un admin peut consulter et modifier les dossiers ; les changements sont traçables.

### Sprint 4 — Finalistes, recette et mise en ligne
**Objectif :** publier une version stable pour le concours.
- Publication explicite des finalistes, avec uniquement les champs publics autorisés.
- Tests de bout en bout : inscription, permissions, sélection, publication.
- Contrôles de sécurité, ergonomie, accessibilité et responsive.
- Build de production, configuration Cloudflare Pages, routes SPA et variables publiques.
- Procédure de sauvegarde/restauration et vérification du comportement du plan Supabase gratuit.
- README d'exploitation et checklist du jour J.
**Terminé quand :** site déployé, parcours critiques testés, sauvegardes disponibles et organisateurs formés.

## Répartition suggérée
- **Développeur A :** architecture, Supabase, migrations, RLS, authentification, opérations sécurisées et back-office.
- **Développeur B :** design system, pages publiques, formulaire Angular, responsive, accessibilité et intégration UX.
- **Travail partagé :** modèles TypeScript, contrats de données, tests end-to-end, revues de PR, documentation et recette.
La répartition exacte doit être confirmée par les deux développeurs avant implémentation.

## Format obligatoire pour chaque sprint
Présente :
1. Objectif du sprint et périmètre.
2. User stories numérotées (US-xx) avec priorité et estimation indicative.
3. Tâches techniques concrètes, responsable A/B, dépendances et fichiers prévus.
4. Critères d'acceptation vérifiables.
5. Branches Git et Pull Requests proposées.
6. Tests à réaliser et risques.
7. Démonstration de fin de sprint et définition de terminé.
8. Ce qui est explicitement exclu de ce sprint.

## Première réponse attendue
**Ne modifie aucun fichier.** Analyse le dépôt et présente le backlog global, le Sprint 0 détaillé, la répartition à deux, les questions bloquantes et le calendrier indicatif. Attends mon accord avant de démarrer Sprint 0. À la fin de chaque sprint, attends une nouvelle validation avant de passer au suivant.
