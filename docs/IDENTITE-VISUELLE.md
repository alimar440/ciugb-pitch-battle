# Identité de la page d’accueil

## Direction

Le Pitch Battle s’ancre dans le campus de l’Université Gaston Berger de Saint-Louis. La page cite Sanar, nom employé par les étudiants pour désigner l’université, et intègre deux vues d’archives du campus : la tour de la Bibliothèque centrale et un bâtiment du campus. Le premier écran associe la tour à l’affiche du concours ; la seconde vue accompagne la publication des finalistes. Les pages Finalistes, Candidature et 404 reprennent cette identité.

Les polices Anton et DM Sans sont hébergées dans `public/fonts/`, avec leurs licences SIL OFL. Aucune bibliothèque ni requête vers un service de polices n’est ajoutée. Anton est préchargée ; les deux polices utilisent `font-display: swap`.

## Images et attribution

Les images livrées sont `public/images/ugb-bibliotheque.webp` et `public/images/ugb-campus.webp`. Elles proviennent de photographies de Maissambaye, publiées dans le domaine public sur Wikimedia Commons :

- [Tour de l’UGB](https://commons.wikimedia.org/wiki/File:LaTourUGBVueSudOuest.jpg)
- [Campus de l’UGB](https://commons.wikimedia.org/wiki/File:Campus2.JPG)

Les images sont présentées explicitement comme des vues d’archives ; elles ne représentent pas une édition du Pitch Battle.

## Fonctionnement

Les dates, le lieu, les conditions et le contact restent alimentés par `public-content.ts`. Aucune information non confirmée n’est inventée. Les services, validations et protections d’inscription ne sont pas modifiés. Les pages restent chargées à la demande.

La navigation conserve le menu mobile, les liens d’ancrage, le lien d’évitement et un retour du focus au bouton du menu après Échap. Les anciens effets de révélation au défilement et leur observateur ont été retirés : le contenu est visible immédiatement. Les retours visuels sur les boutons sont courts, limités aux pointeurs adaptés pour le survol et désactivés avec `prefers-reduced-motion`.

## Vérification

- Build de production Angular et suite Angular/Vitest.
- Contrôle Chrome sans interface à 320, 390, 700, 768, 1024 et 1440 px : débordement horizontal, images, polices locales, menu, FAQ, navigation vers la candidature.
- Vérification mobile des pages Finalistes et 404 et de la préférence de réduction des animations.

Le contrôle mobile émule l’écran et ne remplace pas un essai sur téléphone physique. La soumission Supabase n’est pas exercée : la configuration d’inscription reste celle du projet.
