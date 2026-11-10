# Identité de la page d’accueil

## Direction

Le Pitch Battle reprend les codes d’une affiche d’événement : premier écran noir, titre Anton monumental, rouge CIUGB et photographie d’objet. Les sections suivantes alternent manifeste en grands caractères, lignes de candidature, parcours vertical sur fond noir et informations pratiques regroupées. Les pages Finalistes, Candidature et 404 reprennent cette identité.

Les polices Anton et DM Sans sont hébergées dans `public/fonts/`, avec leurs licences SIL OFL. Aucune bibliothèque ni requête vers un service de polices n’est ajoutée. Anton est préchargée ; les deux polices utilisent `font-display: swap`.

## Visuel

Le visuel final est `public/images/stage-microphone.webp` (1024 × 1536, environ 112 ko). Il est généré avec l’outil intégré `image_gen__imagegen`, puis converti en WebP pour la livraison. Il s’agit d’un visuel de campagne représentant un objet, pas d’une photographie du concours. Aucun participant ni événement fictif n’est présenté.

Prompt final utilisé :

> Use case: product-mockup. Asset type: photographic website hero. Primary request: dramatic closeup of an unbranded actual black handheld dynamic stage microphone with a silver woven steel mesh capsule, suspended diagonally with the capsule at upper right and handle lower left, with a black cable emerging and making one organic loose loop toward lower left. Scene/backdrop: rich almost-black seamless matte background #141414. Style/medium: museum-quality analog editorial still-life photography, sharp true metallic mesh, hard flash mixed with subtle deep red rim light, slight analog film grain, sculptural crop, muted silver highlights. Composition/framing: portrait 1024x1536; microphone occupies roughly 80% of the frame; include the entire microphone head. Constraints: object only, no people, no invented event scene, no logos, no text, no watermark, no extra objects. Avoid: cartoon, vector, illustration, 3D render, CGI, artificial gradients.

## Fonctionnement

Les dates, le lieu, les conditions et le contact restent alimentés par `public-content.ts`. Aucune information non confirmée n’est inventée. Les services, validations et protections d’inscription ne sont pas modifiés. Les pages restent chargées à la demande.

La navigation conserve le menu mobile, les liens d’ancrage, le lien d’évitement et un retour du focus au bouton du menu après Échap. Les anciens effets de révélation au défilement et leur observateur ont été retirés : le contenu est visible immédiatement. Les retours visuels sur les boutons sont courts, limités aux pointeurs adaptés pour le survol et désactivés avec `prefers-reduced-motion`.

## Vérification

- Build de production Angular et suite Angular/Vitest.
- Contrôle Chrome sans interface à 320, 390, 700, 768, 1024 et 1440 px : débordement horizontal, image, polices locales, menu, FAQ, navigation vers la candidature.
- Vérification mobile des pages Finalistes et 404 et de la préférence de réduction des animations.

Le contrôle mobile émule l’écran et ne remplace pas un essai sur téléphone physique. La soumission Supabase n’est pas exercée : la configuration d’inscription reste celle du projet.
