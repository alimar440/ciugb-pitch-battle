# CIUGB Pitch Battle

Plateforme du Pitch Battle des 72H du Club Informatique de l'Université Gaston Berger. Le périmètre produit, le modèle de données et les décisions de sécurité sont suivis dans [le cadrage du Sprint 0](docs/SPRINT-0.md) ; la présentation publique est décrite dans [le Sprint 1](docs/SPRINT-1.md).

## Prérequis

- Node.js `^22.22.3`, `^24.15.0` ou `>=26.0.0` pour Angular CLI 22.2
- npm 10.9 ou version compatible avec le lockfile

## Développement local

```bash
npm ci
npm start
```

L'application est servie par Angular CLI sur `http://localhost:4200/`.

## Vérifications

```bash
npm run build
npm test
```

## Architecture

Le code Angular est organisé par domaines : `core/` pour les services et gardes, `shared/` pour les éléments réutilisables et `features/` pour les fonctionnalités publiques, l'inscription et l'administration. Les décisions métier et Supabase restent documentées dans le cadrage jusqu'à confirmation des règles du concours.

## Sécurité

Ne jamais stocker de clés secrètes dans le code client ou dans le dépôt. Les fichiers `.env` locaux sont ignorés par Git ; toute donnée consommée par Angular est publique par nature. Les accès aux candidatures doivent être protégés par Supabase RLS et par des opérations serveur autorisées.
# CI/CD

Chaque push et pull request vers `main` lance les tests Angular et le build. Après un push réussi sur `main`, GitHub Actions déploie automatiquement `dist/ciugb-pitch-battle/browser` vers Cloudflare Pages.

Dans **GitHub → Settings → Secrets and variables → Actions**, ajoutez :

- `CLOUDFLARE_API_TOKEN` : token Cloudflare limité à Cloudflare Pages:Edit pour ce compte.
- `CLOUDFLARE_ACCOUNT_ID` : identifiant du compte Cloudflare qui héberge `ciugb-pitch-battle`.

