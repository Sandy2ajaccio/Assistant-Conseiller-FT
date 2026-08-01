import {
  CATEGORIES_DEMANDEURS_EMPLOI,
  getCategorieDemandeurEmploi,
} from './categoriesDemandeursEmploi'

const unique = (items = []) =>
  [...new Set(items.filter(Boolean))]

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const isTruthyValue = (value) => {
  if (value === true) return true

  return [
    'oui',
    'o',
    'true',
    'vrai',
    '1',
    'x',
    'actif',
    'active',
    'signe',
    'signee',
    'beneficiaire',
  ].includes(normalizeText(value))
}

const containsText = (value, searchedValues = []) => {
  const normalizedValue = normalizeText(value)

  return searchedValues.some((searchedValue) =>
    normalizedValue.includes(normalizeText(searchedValue)),
  )
}

const getCategoryNumber = (situation = {}) => {
  const rawCategory =
    situation.categorie ??
    situation.categorieDemandeur ??
    situation.categorieFranceTravail ??
    situation.categorieInscription

  const number = Number(
    String(rawCategory ?? '').replace(/[^0-9]/g, ''),
  )

  return Number.isFinite(number) && number >= 1 && number <= 10
    ? number
    : null
}

const getProfiles = (situation = {}) => {
  const profiles = Array.isArray(situation.profils)
    ? situation.profils
    : []

  return new Set(
    profiles.map((profile) => normalizeText(profile)),
  )
}

const hasProfile = (situation, profileIds = []) => {
  const profiles = getProfiles(situation)

  return profileIds.some((profileId) =>
    profiles.has(normalizeText(profileId)),
  )
}

const CATEGORY_RULES = {
  1: {
    objectifPrincipal: 'Retour rapide à l’emploi en CDI à temps plein',

    prioriteConseiller: 'Placement et sécurisation du projet',

    actionsConseiller: [
      'Vérifier la disponibilité immédiate.',
      'Vérifier la cohérence entre le métier recherché, les compétences, la mobilité et le marché du travail.',
      'Contrôler les démarches déjà réalisées.',
      'Définir des actions datées dans le contrat d’engagement.',
      'Vérifier la visibilité du profil et du CV.',
    ],

    questionsPrioritaires: [
      'Quel CDI à temps plein recherchez-vous précisément ?',
      'Dans quel bassin d’emploi pouvez-vous travailler ?',
      'Quelles candidatures avez-vous réalisées récemment ?',
      'Quels employeurs avez-vous contactés ?',
      'Quels freins ralentissent votre retour à l’emploi ?',
      'Êtes-vous disponible immédiatement ?',
    ],

    solutionsPossibles: [
      'Mise en relation avec des offres',
      'Atelier CV et profil de compétences',
      'Préparation aux entretiens',
      'Immersion professionnelle',
      'POEI ou AFPR selon le besoin employeur',
      'Formation courte d’adaptation',
    ],

    vigilances: [
      'Ne pas conclure à un défaut de recherche sans examiner les démarches réellement réalisées.',
      'Vérifier si la recherche est trop restreinte.',
      'Vérifier la mobilité, les horaires et la rémunération attendue.',
    ],
  },

  2: {
    objectifPrincipal: 'Retour à l’emploi en CDI à temps partiel',

    prioriteConseiller: 'Identifier et sécuriser les contraintes de temps de travail',

    actionsConseiller: [
      'Identifier la raison du temps partiel.',
      'Vérifier le nombre d’heures recherchées.',
      'Vérifier les jours et horaires disponibles.',
      'Vérifier la compatibilité avec la garde d’enfants, la santé ou une autre activité.',
      'Rechercher les métiers proposant réellement du temps partiel.',
    ],

    questionsPrioritaires: [
      'Pourquoi recherchez-vous un temps partiel ?',
      'Combien d’heures pouvez-vous travailler chaque semaine ?',
      'Quels jours et horaires êtes-vous disponible ?',
      'Pouvez-vous travailler le soir ou le week-end ?',
      'Existe-t-il une restriction médicale ou familiale ?',
    ],

    solutionsPossibles: [
      'Offres à temps partiel',
      'Adaptation du projet professionnel',
      'Cap emploi si une restriction de santé est identifiée',
      'Solution de garde d’enfants',
      'Aide à la mobilité',
      'Formation compatible avec les disponibilités',
    ],

    vigilances: [
      'Ne pas confondre choix personnel et contrainte subie.',
      'Vérifier que le volume horaire recherché existe sur le marché local.',
      'Vérifier les conséquences sur l’indemnisation et les ressources.',
    ],
  },

  3: {
    objectifPrincipal: 'Accès à un CDD, une mission d’intérim ou un emploi saisonnier',

    prioriteConseiller: 'Mobilisation rapide et disponibilité opérationnelle',

    actionsConseiller: [
      'Identifier les secteurs acceptés.',
      'Vérifier la disponibilité immédiate.',
      'Vérifier les périodes saisonnières.',
      'Vérifier la mobilité et les horaires.',
      'Orienter vers les agences d’intérim et les événements de recrutement.',
    ],

    questionsPrioritaires: [
      'Quels types de contrats courts acceptez-vous ?',
      'Êtes-vous disponible immédiatement ?',
      'Acceptez-vous les missions de quelques jours ?',
      'Quels secteurs saisonniers vous intéressent ?',
      'Pouvez-vous vous déplacer hors de votre commune ?',
    ],

    solutionsPossibles: [
      'Intérim',
      'CDD',
      'Saisonnier',
      'Forum de recrutement',
      'Immersion professionnelle',
      'Préparation opérationnelle à l’emploi',
    ],

    vigilances: [
      'Vérifier la capacité à accepter des horaires variables.',
      'Vérifier la mobilité.',
      'Repérer un éventuel enchaînement durable de contrats courts sans évolution.',
    ],
  },

  4: {
    objectifPrincipal: 'Préparer le retour à la disponibilité',

    prioriteConseiller: 'Identifier la cause et la durée de l’indisponibilité',

    actionsConseiller: [
      'Identifier précisément la cause de l’indisponibilité.',
      'Déterminer une date prévisionnelle de retour à la disponibilité.',
      'Adapter les actions du contrat d’engagement.',
      'Mobiliser un partenaire social ou santé si nécessaire.',
      'Préparer progressivement la reprise du projet professionnel.',
    ],

    questionsPrioritaires: [
      'Pourquoi n’êtes-vous pas disponible immédiatement ?',
      'Cette indisponibilité est-elle temporaire ?',
      'À quelle date pensez-vous redevenir disponible ?',
      'Quelles actions restent possibles actuellement ?',
      'Un accompagnement social, santé ou familial est-il nécessaire ?',
    ],

    solutionsPossibles: [
      'Accompagnement social',
      'Accompagnement global',
      'Cap emploi',
      'Préparation progressive du projet',
      'Formation adaptée',
      'Réévaluation programmée de la situation',
    ],

    vigilances: [
      'Ne pas imposer une action incompatible avec l’indisponibilité constatée.',
      'Tracer la cause et la durée prévisionnelle.',
      'Prévoir une date de réévaluation.',
    ],
  },

  5: {
    objectifPrincipal: 'Évolution ou mobilité professionnelle',

    prioriteConseiller: 'Sécuriser le changement d’emploi',

    actionsConseiller: [
      'Identifier le contrat et le poste actuels.',
      'Identifier la raison du changement.',
      'Vérifier le délai de disponibilité.',
      'Évaluer les compétences transférables.',
      'Vérifier si une formation ou une reconversion est nécessaire.',
    ],

    questionsPrioritaires: [
      'Quel emploi occupez-vous actuellement ?',
      'Quel est votre contrat actuel ?',
      'Pourquoi souhaitez-vous changer ?',
      'Quel emploi recherchez-vous ?',
      'Quel est votre délai de disponibilité ?',
      'Souhaitez-vous une évolution, une reconversion ou de meilleures conditions ?',
    ],

    solutionsPossibles: [
      'Conseil en évolution professionnelle',
      'Bilan de compétences',
      'VAE',
      'Formation',
      'Immersion professionnelle',
      'Mobilité professionnelle',
    ],

    vigilances: [
      'Ne pas conseiller une rupture du contrat sans analyse des conséquences.',
      'Vérifier la disponibilité réelle pour les démarches.',
      'Vérifier la cohérence du projet de reconversion.',
    ],
  },

  6: {
    objectifPrincipal: 'Accès à un autre CDI à temps plein',

    prioriteConseiller: 'Mobilité professionnelle avec recherche active',

    actionsConseiller: [
      'Vérifier la situation actuelle.',
      'Vérifier le délai de disponibilité.',
      'Contrôler les démarches de recherche.',
      'Identifier les compétences transférables.',
      'Sécuriser la transition professionnelle.',
    ],

    questionsPrioritaires: [
      'Quelle est votre situation actuelle ?',
      'Quand pourriez-vous débuter un nouveau CDI ?',
      'Quelles démarches avez-vous déjà réalisées ?',
      'Quel CDI recherchez-vous ?',
      'Quelles sont vos contraintes de mobilité ?',
    ],

    solutionsPossibles: [
      'Mise en relation employeur',
      'VAE',
      'Formation courte',
      'Immersion professionnelle',
      'Conseil en évolution professionnelle',
    ],

    vigilances: [
      'Vérifier les actes positifs de recherche.',
      'Vérifier la date réelle de disponibilité.',
      'Ne pas fragiliser l’emploi actuel sans solution sécurisée.',
    ],
  },

  7: {
    objectifPrincipal: 'Accès à un autre CDI à temps partiel',

    prioriteConseiller: 'Mobilité professionnelle adaptée aux contraintes horaires',

    actionsConseiller: [
      'Identifier la situation actuelle.',
      'Préciser le temps partiel recherché.',
      'Vérifier les contraintes de santé, de garde ou d’organisation.',
      'Contrôler les démarches de recherche.',
      'Sécuriser la transition.',
    ],

    questionsPrioritaires: [
      'Quel emploi exercez-vous actuellement ?',
      'Pourquoi recherchez-vous un autre temps partiel ?',
      'Quel volume horaire recherchez-vous ?',
      'Quand êtes-vous disponible ?',
      'Quelles démarches avez-vous engagées ?',
    ],

    solutionsPossibles: [
      'Offres à temps partiel',
      'Cap emploi',
      'Adaptation du projet',
      'Formation compatible avec l’emploi actuel',
      'Conseil en évolution professionnelle',
    ],

    vigilances: [
      'Vérifier les obligations de recherche.',
      'Vérifier la réalité des disponibilités.',
      'Analyser les contraintes avant toute prescription.',
    ],
  },

  8: {
    objectifPrincipal: 'Accès à un autre contrat court ou saisonnier',

    prioriteConseiller: 'Mobilité vers un contrat temporaire compatible avec la situation actuelle',

    actionsConseiller: [
      'Identifier le contrat actuel.',
      'Déterminer la date de disponibilité.',
      'Vérifier les secteurs et périodes recherchés.',
      'Contrôler les démarches réalisées.',
      'Identifier les possibilités de cumul ou de transition.',
    ],

    questionsPrioritaires: [
      'Quel est votre contrat actuel ?',
      'Quel autre contrat recherchez-vous ?',
      'À partir de quelle date êtes-vous disponible ?',
      'Quels secteurs acceptez-vous ?',
      'Quelles démarches avez-vous réalisées ?',
    ],

    solutionsPossibles: [
      'Intérim',
      'CDD',
      'Saisonnier',
      'Événement de recrutement',
      'Formation courte',
      'Immersion professionnelle',
    ],

    vigilances: [
      'Vérifier les actes positifs de recherche.',
      'Vérifier la compatibilité avec l’activité actuelle.',
      'Vérifier la mobilité et les horaires.',
    ],
  },

  9: {
    objectifPrincipal: 'Levée des freins faisant obstacle à la recherche d’emploi',

    prioriteConseiller: 'Accompagnement social ou socioprofessionnel',

    actionsConseiller: [
      'Identifier les difficultés prioritaires.',
      'Distinguer les freins temporaires des freins durables.',
      'Identifier les partenaires déjà mobilisés.',
      'Définir une première action réaliste.',
      'Prévoir une date de réévaluation de la capacité à rechercher un emploi.',
      'Évaluer l’opportunité d’un accompagnement global.',
    ],

    questionsPrioritaires: [
      'Quelles difficultés empêchent actuellement votre recherche d’emploi ?',
      'Quel frein doit être traité en premier ?',
      'Êtes-vous accompagné par un travailleur social ?',
      'Quelles démarches pouvez-vous réaliser malgré les difficultés ?',
      'À quelle échéance la situation peut-elle être réévaluée ?',
    ],

    solutionsPossibles: [
      'Accompagnement global',
      'Travailleur social',
      'Cap emploi',
      'Aide à la mobilité',
      'Aide au logement',
      'Aide à la garde d’enfants',
      'Accompagnement numérique',
      'FLE ou remise à niveau',
      'Parcours santé',
    ],

    vigilances: [
      'Ne pas assimiler les difficultés sociales à un manque de volonté.',
      'Ne pas prescrire une action professionnelle incompatible avec les freins.',
      'Tracer le partenaire référent et les actions convenues.',
      'Prévoir une réévaluation régulière.',
    ],
  },

  10: {
    objectifPrincipal: 'Diagnostic global, orientation et contractualisation',

    prioriteConseiller: 'Sécuriser le parcours RSA et l’orientation vers le bon organisme référent',

    actionsConseiller: [
      'Vérifier la situation exacte au regard du RSA.',
      'Vérifier si la demande est en cours, acceptée, rejetée ou suspendue.',
      'Vérifier l’existence et la date du contrat d’engagement.',
      'Identifier l’organisme référent.',
      'Réaliser un diagnostic global social et professionnel.',
      'Déterminer la disponibilité réelle.',
      'Identifier les freins et les ressources.',
      'Définir les premières actions adaptées.',
    ],

    questionsPrioritaires: [
      'Quelle est votre situation actuelle au regard du RSA ?',
      'Le contrat d’engagement est-il signé ?',
      'Quel organisme assure votre accompagnement ?',
      'Êtes-vous disponible immédiatement pour travailler ?',
      'Quels freins sociaux ou professionnels rencontrez-vous ?',
      'Quelles actions pouvez-vous réaliser actuellement ?',
    ],

    solutionsPossibles: [
      'Orientation France Travail',
      'Orientation Collectivité ou Conseil départemental',
      'Accompagnement global',
      'Accompagnement social',
      'Cap emploi',
      'Mission locale selon l’âge',
      'Diagnostic professionnel',
      'Atelier numérique',
      'Formation ou remise à niveau',
    ],

    vigilances: [
      'La catégorie 10 ne signifie pas automatiquement que la personne est disponible immédiatement.',
      'La catégorie 10 ne suffit pas pour déterminer un portefeuille.',
      'Vérifier le statut RSA réel.',
      'Vérifier le contrat d’engagement.',
      'Vérifier l’organisme référent.',
      'Ne pas déduire automatiquement une sanction de la seule catégorie.',
    ],
  },
}

const COMMON_RULES = {
  obligationsGenerales: [
    'Actualiser la situation lorsque le renouvellement d’inscription est requis.',
    'Déclarer les changements de situation.',
    'Répondre aux convocations.',
    'Participer à l’élaboration et à l’actualisation du contrat d’engagement.',
    'Réaliser les actions prévues dans le contrat d’engagement.',
    'Justifier les démarches lorsque cela est demandé.',
  ],

  controlesIndispensables: [
    'Identité et coordonnées à jour',
    'Catégorie d’inscription',
    'Date d’inscription',
    'Organisme référent',
    'Contrat d’engagement',
    'Droits et indemnisation',
    'Disponibilité',
    'Situation professionnelle',
    'Projet professionnel',
    'Mobilité',
    'Santé',
    'Logement',
    'Garde d’enfants',
    'Autonomie numérique',
    'Maîtrise du français',
    'Démarches réalisées',
  ],

  principesDecision: [
    'La catégorie administrative ne suffit jamais, à elle seule, à déterminer une sanction, une orientation ou une prescription.',
    'Toute décision doit être fondée sur la situation réelle, les droits, le contrat d’engagement, les freins, les ressources et le projet.',
    'Les sanctions relèvent d’un cadre réglementaire spécifique et nécessitent l’analyse du manquement, de sa répétition, de sa gravité et de l’existence d’un motif légitime.',
    'La situation doit être actualisée avant toute décision importante.',
  ],
}

const buildCrossRules = (situation = {}) => {
  const alerts = []
  const questions = []
  const actions = []
  const recommendations = []
  const partners = []
  const flags = []

  const age = Number(situation.age)
  const categoryNumber = getCategoryNumber(situation)

  const rsa =
    isTruthyValue(situation.rsa) ||
    hasProfile(situation, ['rsa', 'beneficiaire_rsa'])

  const rqth =
    isTruthyValue(situation.rqth) ||
    hasProfile(situation, ['rqth', 'handicap'])

  const are =
    isTruthyValue(situation.are) ||
    hasProfile(situation, ['are'])

  const ass =
    isTruthyValue(situation.ass) ||
    hasProfile(situation, ['ass'])

  const nonIndemnise =
    isTruthyValue(situation.nonIndemnise) ||
    hasProfile(situation, ['non_indemnise'])

  const contratEngagementSigne =
    isTruthyValue(situation.contratEngagementSigne) ||
    containsText(situation.contratEngagement, [
      'signé',
      'signee',
      'validé',
      'valide',
    ])

  const contratEngagementASigner =
    containsText(situation.contratEngagement, [
      'à signer',
      'a signer',
      'non signé',
      'non signe',
    ])

  const formation =
    isTruthyValue(situation.enFormation) ||
    containsText(situation.situationProfessionnelle, [
      'formation',
    ])

  const emploi =
    isTruthyValue(situation.enEmploi) ||
    containsText(situation.situationProfessionnelle, [
      'emploi',
      'cdi',
      'cdd',
      'intérim',
      'interim',
      'activité',
      'activite',
      'auto-entrepreneur',
      'micro-entreprise',
    ])

  const creationEntreprise =
    isTruthyValue(situation.creationEntreprise) ||
    hasProfile(situation, ['creation_entreprise']) ||
    containsText(situation.projet, [
      'création',
      'creation',
      'entreprise',
      'micro-entreprise',
      'auto-entrepreneur',
    ])

  const sante =
    isTruthyValue(situation.sante) ||
    hasProfile(situation, ['sante'])

  const mobilite =
    isTruthyValue(situation.mobilite) ||
    hasProfile(situation, ['mobilite'])

  const logement =
    isTruthyValue(situation.logement) ||
    hasProfile(situation, ['logement'])

  const gardeEnfants =
    isTruthyValue(situation.gardeEnfants) ||
    hasProfile(situation, ['garde_enfants'])

  const numerique =
    isTruthyValue(situation.numerique) ||
    hasProfile(situation, ['numerique'])

  const francais =
    isTruthyValue(situation.francais) ||
    hasProfile(situation, ['francais'])

  if (!categoryNumber) {
    alerts.push(
      'La catégorie France Travail doit être renseignée avant de finaliser l’analyse.',
    )

    questions.push(
      'Quelle est la catégorie actuelle du demandeur d’emploi ?',
    )

    flags.push('categorie_manquante')
  }

  if (rsa) {
    actions.push(
      'Vérifier l’organisme référent et la situation du contrat d’engagement.',
    )

    questions.push(
      'Le droit RSA est-il ouvert, en cours d’instruction, suspendu ou rejeté ?',
      'Quel organisme est référent du parcours ?',
    )

    flags.push('rsa')
  }

  if (rsa && !contratEngagementSigne) {
    alerts.push(
      'Bénéficiaire ou demandeur du RSA : contrat d’engagement à vérifier.',
    )

    actions.push(
      'Programmer l’élaboration ou la signature du contrat d’engagement si elle relève de l’organisme référent.',
    )

    flags.push('contrat_engagement_a_verifier')
  }

  if (contratEngagementASigner) {
    alerts.push(
      'Le contrat d’engagement est indiqué comme restant à signer.',
    )

    actions.push(
      'Vérifier l’organisme compétent et programmer la contractualisation.',
    )
  }

  if (rqth) {
    recommendations.push(
      'Évaluer les besoins de compensation, les restrictions et les aménagements.',
      'Mobiliser la Team Handicap ou Cap emploi selon la situation.',
    )

    questions.push(
      'Quelles restrictions ou préconisations doivent être prises en compte ?',
      'Des aménagements de poste sont-ils nécessaires ?',
    )

    partners.push(
      'Team Handicap',
      'Cap emploi',
    )

    flags.push('rqth')
  }

  if (sante && !rqth) {
    alerts.push(
      'Une problématique de santé est signalée sans information suffisante sur ses conséquences professionnelles.',
    )

    questions.push(
      'La santé limite-t-elle les horaires, les déplacements ou certains gestes professionnels ?',
    )
  }

  if (mobilite) {
    recommendations.push(
      'Analyser les transports disponibles et les aides à la mobilité.',
    )

    questions.push(
      'Jusqu’où la personne peut-elle se déplacer et par quel moyen ?',
    )

    flags.push('frein_mobilite')
  }

  if (logement) {
    recommendations.push(
      'Prioriser la stabilisation du logement avant une action professionnelle incompatible.',
    )

    partners.push(
      'Service social',
    )

    flags.push('frein_logement')
  }

  if (gardeEnfants) {
    recommendations.push(
      'Vérifier les horaires de garde disponibles et les solutions mobilisables.',
    )

    questions.push(
      'Quels jours et horaires sont couverts par une solution de garde ?',
    )

    flags.push('frein_garde_enfants')
  }

  if (numerique) {
    recommendations.push(
      'Prescrire une évaluation de l’autonomie numérique ou un accompagnement aux démarches.',
    )

    questions.push(
      'La personne sait-elle utiliser son espace personnel, sa messagerie et transmettre des documents ?',
    )

    flags.push('frein_numerique')
  }

  if (francais) {
    recommendations.push(
      'Évaluer le niveau de français nécessaire au projet et envisager une action FLE.',
    )

    flags.push('frein_francais')
  }

  if (formation) {
    actions.push(
      'Vérifier l’enregistrement de l’entrée en formation et la cohérence avec le projet.',
    )

    questions.push(
      'Quelles sont les dates, le financement, les prérequis et les débouchés de la formation ?',
    )

    flags.push('formation')
  }

  if (emploi) {
    actions.push(
      'Vérifier le contrat, le volume horaire, la durée et la date de début.',
    )

    questions.push(
      'L’activité est-elle suffisante et durable ?',
      'La personne souhaite-t-elle rester inscrite ?',
    )

    flags.push('emploi')
  }

  if (creationEntreprise) {
    recommendations.push(
      'Analyser la viabilité du projet, l’activité réelle et les besoins d’accompagnement.',
      'Vérifier les droits et dispositifs mobilisables sans les déduire automatiquement.',
    )

    partners.push(
      'BGE',
      'ADIE',
      'CitéLab',
    )

    flags.push('creation_entreprise')
  }

  if (are) flags.push('are')
  if (ass) flags.push('ass')
  if (nonIndemnise) flags.push('non_indemnise')

  if (Number.isFinite(age) && age < 26) {
    recommendations.push(
      'Vérifier l’éligibilité à un accompagnement jeune adapté.',
    )

    partners.push(
      'Mission locale',
    )

    flags.push('jeune')
  }

  if (Number.isFinite(age) && age >= 50) {
    recommendations.push(
      'Intégrer l’expérience, la durée d’inscription, le projet de retraite et les besoins de remobilisation.',
    )

    flags.push('senior')
  }

  return {
    alerts: unique(alerts),
    questions: unique(questions),
    actions: unique(actions),
    recommendations: unique(recommendations),
    partners: unique(partners),
    flags: unique(flags),
  }
}

export const getCategorieRules = (categorie) => {
  const categoryReference =
    getCategorieDemandeurEmploi(categorie)

  if (!categoryReference) return null

  const specificRules =
    CATEGORY_RULES[categoryReference.numero] || {}

  return {
    ...categoryReference,
    ...specificRules,

    questionsPrioritaires: unique([
      ...(categoryReference.questionsEntretien || []),
      ...(specificRules.questionsPrioritaires || []),
    ]),

    vigilances: unique([
      ...(categoryReference.vigilance || []),
      ...(specificRules.vigilances || []),
    ]),
  }
}

export const analyserCategorieEtSituation = (situation = {}) => {
  const categoryNumber = getCategoryNumber(situation)

  const categoryRules = categoryNumber
    ? getCategorieRules(categoryNumber)
    : null

  const crossRules = buildCrossRules(situation)

  const alerts = unique([
    ...(categoryRules?.vigilances || []),
    ...crossRules.alerts,
  ])

  const questions = unique([
    ...(categoryRules?.questionsPrioritaires || []),
    ...crossRules.questions,
  ])

  const actions = unique([
    ...(categoryRules?.actionsConseiller || []),
    ...crossRules.actions,
  ])

  const recommendations = unique([
    ...(categoryRules?.solutionsPossibles || []),
    ...crossRules.recommendations,
  ])

  const partners = unique(crossRules.partners)

  let niveauVigilance = 'Standard'

  if (
    !categoryRules ||
    categoryNumber === 9 ||
    categoryNumber === 10 ||
    crossRules.flags.includes('frein_logement') ||
    crossRules.flags.includes('contrat_engagement_a_verifier')
  ) {
    niveauVigilance = 'Élevé'
  }

  if (
    alerts.length >= 6 ||
    crossRules.flags.filter((flag) =>
      flag.startsWith('frein_'),
    ).length >= 3
  ) {
    niveauVigilance = 'Très élevé'
  }

  return {
    analyseDisponible: Boolean(categoryRules),

    categorie: categoryNumber,

    libelleCategorie:
      categoryRules?.libelle ||
      'Catégorie non renseignée',

    descriptionCategorie:
      categoryRules?.description || '',

    objectifPrincipal:
      categoryRules?.objectifPrincipal ||
      'Compléter le diagnostic',

    prioriteConseiller:
      categoryRules?.prioriteConseiller ||
      'Vérifier la situation administrative',

    disponibiliteImmediate:
      categoryRules?.disponibiliteImmediate ?? null,

    actesRechercheObligatoires:
      categoryRules?.actesRechercheObligatoires ?? null,

    accompagnementPrincipal:
      categoryRules?.accompagnementPrincipal ||
      'À déterminer',

    niveauVigilance,

    alertes: alerts,

    questions,

    actionsConseiller: actions,

    recommandations: recommendations,

    partenaires: partners,

    indicateurs: crossRules.flags,

    principesDecision:
      COMMON_RULES.principesDecision,

    controlesIndispensables:
      COMMON_RULES.controlesIndispensables,

    obligationsGenerales:
      COMMON_RULES.obligationsGenerales,
  }
}

export const analyserTousLesProfils = (records = []) =>
  records.map((record) => ({
    identifiant: record.identifiant,
    nom: record.nom,
    prenom: record.prenom,
    analyse: analyserCategorieEtSituation(record),
  }))

export const getCategoriesOptions = () =>
  CATEGORIES_DEMANDEURS_EMPLOI.map((category) => ({
    value: category.numero,
    label: `Catégorie ${category.numero} — ${category.libelle}`,
  }))

export const getQuestionsEntretienParCategorie = (
  categorie,
) => {
  const rules = getCategorieRules(categorie)

  return rules?.questionsPrioritaires || []
}

export const getVigilancesParCategorie = (
  categorie,
) => {
  const rules = getCategorieRules(categorie)

  return rules?.vigilances || []
}

export const getActionsConseillerParCategorie = (
  categorie,
) => {
  const rules = getCategorieRules(categorie)

  return rules?.actionsConseiller || []
}

export default analyserCategorieEtSituation