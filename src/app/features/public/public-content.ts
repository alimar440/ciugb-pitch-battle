export interface PublicNavigationItem {
  readonly label: string;
  readonly href: string;
}

export interface PublicFaqItem {
  readonly question: string;
  readonly answer: string;
}

/**
 * Public copy for the first release. Replace values marked "À annoncer"
 * only with information approved by the event committee.
 */
export const publicContent = {
  organizer: 'Club Informatique de l’Université Gaston Berger',
  eventContext: 'Les 72H du CIUGB · troisième jour',
  heroDescription:
    'Le Pitch Battle donne aux équipes l’occasion de présenter leur projet. Les organisateurs examineront les candidatures et retiendront les finalistes qui pitcheront le troisième jour des 72H du CIUGB.',
  eventDate: '29 novembre 2026',
  registrationDeadline: '25 novembre 2026',
  venue: 'Incubateur',
  eligibility: 'Équipe de 1 à 5 membres · projet original',
  committeeContact: 'À annoncer',
  navigation: [
    { label: 'Le concept', href: '#concept' },
    { label: 'Le parcours', href: '#parcours' },
    { label: 'Informations', href: '#informations' },
    { label: 'Contact', href: '#contact' },
  ] satisfies readonly PublicNavigationItem[],
  pitchElements: [
    {
      title: 'Le problème',
      description: 'Quel besoin ou quelle difficulté votre projet cherche-t-il à résoudre ?',
    },
    {
      title: 'La solution',
      description: 'Expliquez l’approche que vous proposez et ce qui la rend utile.',
    },
    {
      title: 'L’équipe',
      description: 'Présentez les personnes qui portent l’idée et leurs contributions.',
    },
  ],
  steps: [
    {
      number: '1',
      title: 'Déposer une candidature',
      description: 'Présentez votre équipe et votre projet à travers le formulaire officiel.',
      note: 'Dépôt jusqu’au 25 novembre 2026',
    },
    {
      number: '2',
      title: 'Laisser place à l’examen',
      description: 'Les organisateurs examinent les dossiers et sélectionnent les équipes.',
      note: 'Résultats communiqués par le CIUGB',
    },
    {
      number: '3',
      title: 'Monter sur scène',
      description: 'Les finalistes retenus présentent leur projet le jour du Pitch Battle.',
      note: '29 novembre 2026 · Incubateur',
    },
  ],
  faqs: [
    {
      question: 'Qui peut présenter un projet ?',
      answer:
        'Toute équipe de 1 à 5 membres peut déposer un projet original, présenté de bonne foi et respectueux des règles de l’Université.',
    },
    {
      question: 'Combien de personnes peuvent former une équipe ?',
      answer:
        'Une équipe compte de 1 à 5 membres. Un membre est désigné comme responsable de candidature et sert de contact pour le comité.',
    },
    {
      question: 'Quand et où aura lieu le Pitch Battle ?',
      answer: 'Le Pitch Battle aura lieu le 29 novembre 2026 à l’Incubateur. Les candidatures sont attendues au plus tard le 25 novembre 2026.',
    },
    {
      question: 'Où consulter les équipes finalistes ?',
      answer:
        'Les finalistes apparaîtront sur cette plateforme après la sélection et la publication officielle par les organisateurs.',
    },
  ] satisfies readonly PublicFaqItem[],
} as const;
