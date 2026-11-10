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
  eventDate: 'À annoncer',
  registrationDeadline: 'À annoncer',
  venue: 'À annoncer',
  eligibility: 'À préciser dans le règlement',
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
      note: 'Ouverture : à annoncer',
    },
    {
      number: '2',
      title: 'Laisser place à l’examen',
      description: 'Les organisateurs examinent les dossiers et présélectionnent les équipes.',
      note: 'Modalités : à annoncer',
    },
    {
      number: '3',
      title: 'Monter sur scène',
      description: 'Les finalistes retenus présentent leur projet le jour du Pitch Battle.',
      note: 'Date et lieu : à annoncer',
    },
  ],
  faqs: [
    {
      question: 'Qui peut présenter un projet ?',
      answer:
        'Les conditions d’éligibilité seront précisées dans le règlement officiel avant l’ouverture des candidatures.',
    },
    {
      question: 'Combien de personnes peuvent former une équipe ?',
      answer:
        'La taille minimale et maximale sera annoncée par le comité. Le responsable de candidature sera identifié dans l’équipe.',
    },
    {
      question: 'Quand et où aura lieu le Pitch Battle ?',
      answer: 'La date et le lieu seront annoncés par les organisateurs.',
    },
    {
      question: 'Où consulter les équipes finalistes ?',
      answer:
        'Les finalistes apparaîtront sur cette plateforme après la sélection et la publication officielle par les organisateurs.',
    },
  ] satisfies readonly PublicFaqItem[],
} as const;
