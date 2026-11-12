# Mise en production Supabase

Cette procédure ne demande jamais de clé `service_role` dans Angular. La clé anon/publishable peut figurer dans `public/runtime-config.js` : les tables restent protégées par RLS et les écritures passent par les Edge Functions.

## 1. Créer et migrer la base

Créez le projet Supabase, puis depuis ce dépôt :

```powershell
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Le CLI exécute dans l’ordre les deux fichiers de `supabase/migrations/`. Sans CLI, collez-les dans le SQL Editor, dans cet ordre. Exécutez ensuite `supabase/seed.example.sql` après avoir remplacé chaque marqueur : il est volontairement impossible à lancer tel quel et n’invente aucune donnée de concours.

## 2. Créer le premier administrateur

Dans **Authentication > Users**, créez l’utilisateur de l’équipe organisatrice. Récupérez son UUID puis exécutez dans le SQL Editor :

```sql
insert into public.profiles (id, role) values ('<uuid-auth-user>', 'admin');
```

Ne créez pas de politique client permettant d’écrire dans `profiles`. L’accès aux candidats, membres, notes et historique est refusé directement par RLS.

## 3. Configurer les secrets et fonctions

Créez une clé HMAC longue et aléatoire localement, puis définissez les secrets côté Supabase (jamais dans Git) :

```powershell
npx supabase secrets set RATE_LIMIT_HMAC_SECRET=<secret> TURNSTILE_SECRET_KEY=<turnstile-secret> TURNSTILE_ALLOWED_HOSTNAME=<domaine-public> ALLOWED_ORIGIN=https://<domaine-public>
npx supabase functions deploy submit-application --no-verify-jwt
npx supabase functions deploy admin
```

Créez le widget Cloudflare Turnstile pour ce même domaine, avec l’action `application`. En développement, utilisez un projet/widget de test et ses propres valeurs de domaine. Après déploiement, renseignez uniquement l’URL Supabase, la clé anon/publishable et la clé de site Turnstile dans `public/runtime-config.js`.

## 4. Vérifier avant ouverture

Dans l’interface admin (ou temporairement via SQL), complétez le règlement, la notice, leurs versions et les tailles d’équipe. Laissez `registration_open` à `false` jusqu’à validation. La publication des finalistes est aussi fermée par défaut et requiert le consentement explicite de l’équipe ; la RPC publique ne renvoie que nom d’équipe, titre, résumé et catégorie.

Testez : une soumission valide, un refus sans Turnstile, les limites d’équipe, le doublon de nom, une connexion admin, puis l’absence totale de lecture directe avec la clé anon. Configurez enfin **Authentication > URL Configuration** avec l’URL Cloudflare Pages.
