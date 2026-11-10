
# CIUGB Pitch Battle — Instructions Codex

## Projet
Plateforme du Pitch Battle des 72H du Club Informatique
de l'Université Gaston Berger.

## Stack
- Angular standalone + TypeScript strict
- Tailwind CSS
- Supabase : PostgreSQL, Auth, RLS
- Cloudflare Pages

## Architecture
- core/ : services, authentification, guards
- shared/ : composants réutilisables
- features/public/ : pages publiques
- features/registration/ : inscriptions
- features/admin/ : administration
- supabase/migrations/ : migrations SQL

## Fonctionnalités
- Présentation du Pitch Battle
- Inscription des équipes et de leurs membres
- Description des projets
- Tableau de bord administrateur
- Présélection des candidatures
- Publication des finalistes

## Règles Angular
- Respecter les conventions Angular du projet.
- Utiliser les composants standalone.
- Utiliser TypeScript strict.
- Privilégier les signals pour l'état local.
- Utiliser le lazy loading pour les pages.
- Créer des composants réutilisables.
- Prévoir une interface responsive.

## Sécurité Supabase
- Activer RLS sur les tables exposées.
- Ne jamais exposer les clés secrètes.
- Protéger les données des candidats.
- Réserver les décisions de sélection aux admins.
- Valider les données côté serveur.

## Collaboration
- Travailler sur des branches feature/*.
- Ne jamais pousser directement sur main.
- Ne jamais créer de commit sans autorisation.
- Ne jamais modifier les projets voisins.
- Respecter le travail de l'autre développeur.

## Qualité
- Tester les fonctionnalités développées.
- Vérifier npm run build.
- Éviter les dépendances inutiles.
- Documenter les changements importants.
- Ne pas remplacer une fonctionnalité réelle
  par des données fictives.
