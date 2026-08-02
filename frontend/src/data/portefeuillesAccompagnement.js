const unique = (items = []) =>
  [...new Set(items.filter(Boolean))]

export const PORTEFEUILLES_ACCOMPAGNEMENT = [
  {
    id: 'em',
    code: 'EM',
    libelle: 'Emploi — immédiatement mobilisable',
    finalite:
      'Accompagner les demandeurs dont le retour à l’emploi peut être engagé rapidement.',
    niveauAccompagnement: 'Professionnel',
    intensiteIndicative: 'Standard à soutenue',
    criteresOrientation: [
      'Projet professionnel défini ou rapidement clarifiable',
      'Disponibilité immédiate ou proche',
      'Autonomie suffisante dans les démarches',
      'Freins périphériques absents ou limités',
      'Compétences directement mobilisables',
    ],
    signesIncompatibilite: [
      'Freins sociaux multiples non stabilisés',
      'Indisponibilité durable',
      'Problématique de santé ayant un impact majeur non évalué',
      'Absence totale de projet nécessitant un travail approfondi',
    ],
    objectifsConseiller: [
      'Accélérer le retour à l’emploi',
      'Cibler les offres compatibles',
      'Renforcer les candidatures',
      'Sécuriser la mobilité et la disponibilité',
      'Mobiliser les actions courtes utiles au placement',
    ],
    questionsEntretien: [
      'Quel métier recherchez-vous précisément ?',
      'Sur quel territoire pouvez-vous travailler ?',
      'À partir de quelle date êtes-vous disponible ?',
      'Quelles candidatures avez-vous réalisées récemment ?',
      'Quels employeurs avez-vous contactés ?',
      'Quel frein concret ralentit encore votre retour à l’emploi ?',
    ],
    actionsPrioritaires: [
      'Vérifier le CV et le profil de compétences',
      'Vérifier la visibilité du profil',
      'Étudier les offres disponibles',
      'Préparer la mise en relation employeur',
      'Définir des démarches datées dans le contrat d’engagement',
    ],
    prestationsPossibles: [
      'Atelier CV',
      'Préparation entretien',
      'Immersion professionnelle',
      'POEI',
      'AFPR',
      'Formation courte d’adaptation',
    ],
    vigilances: [
      'Ne pas maintenir en EM une personne dont les freins empêchent réellement la recherche active.',
      'Ne pas confondre autonomie déclarée et autonomie réelle.',
      'Vérifier régulièrement que le projet reste cohérent avec le marché local.',
    ],
  },

  {
    id: 'sp',
    code: 'SP',
    libelle: 'Socioprofessionnel',
    finalite:
      'Accompagner les demandeurs ayant besoin d’un travail conjoint sur le projet professionnel et sur certains freins périphériques.',
    niveauAccompagnement: 'Socioprofessionnel',
    intensiteIndicative: 'Soutenue',
    criteresOrientation: [
      'Projet professionnel imprécis ou fragile',
      'Un ou plusieurs freins périphériques identifiés',
      'Autonomie partielle',
      'Besoin d’étapes progressives avant le retour à l’emploi',
      'Besoin de coordination avec des partenaires',
    ],
    signesIncompatibilite: [
      'Freins exclusivement sociaux nécessitant un accompagnement social prioritaire',
      'Autonomie complète et projet directement opérationnel',
    ],
    objectifsConseiller: [
      'Clarifier le projet professionnel',
      'Lever progressivement les freins',
      'Structurer les démarches',
      'Coordonner les partenaires',
      'Préparer un retour progressif vers l’emploi',
    ],
    questionsEntretien: [
      'Quel est le principal obstacle à votre retour à l’emploi ?',
      'Votre projet professionnel est-il confirmé ?',
      'Quelles démarches pouvez-vous réaliser seul ?',
      'Quels partenaires vous accompagnent déjà ?',
      'Quelle première étape est réaliste dans le mois à venir ?',
    ],
    actionsPrioritaires: [
      'Réaliser un diagnostic global',
      'Hiérarchiser les freins',
      'Définir une première action réalisable',
      'Mobiliser les partenaires adaptés',
      'Programmer une réévaluation',
    ],
    prestationsPossibles: [
      'Activ’Projet',
      'Accompagnement global',
      'Atelier numérique',
      'Aide à la mobilité',
      'FLE',
      'Immersion professionnelle',
    ],
    vigilances: [
      'Ne pas multiplier les prescriptions sans hiérarchiser les besoins.',
      'Tracer les partenaires déjà mobilisés.',
      'Adapter les engagements à la capacité réelle de la personne.',
    ],
  },

  {
    id: 'glo',
    code: 'GLO',
    libelle: 'Accompagnement global',
    finalite:
      'Coordonner un accompagnement professionnel et social lorsqu’au moins deux dimensions freinent durablement le retour à l’emploi.',
    niveauAccompagnement: 'Global',
    intensiteIndicative: 'Renforcée',
    criteresOrientation: [
      'Cumul de freins sociaux et professionnels',
      'Logement instable',
      'Santé ou handicap ayant un impact sur le parcours',
      'Difficultés financières importantes',
      'Mobilité fortement contrainte',
      'Besoin de coordination entre conseiller emploi et travailleur social',
    ],
    signesIncompatibilite: [
      'Frein unique pouvant être traité dans un accompagnement standard',
      'Absence de besoin de coordination sociale',
    ],
    objectifsConseiller: [
      'Stabiliser la situation sociale',
      'Maintenir une dynamique professionnelle réaliste',
      'Coordonner les interventions',
      'Éviter les prescriptions incompatibles avec la situation',
      'Préparer une évolution de l’accompagnement',
    ],
    questionsEntretien: [
      'Quels sont les deux freins les plus urgents ?',
      'Un travailleur social intervient-il déjà ?',
      'Quelles démarches sont impossibles actuellement ?',
      'Quelles démarches restent possibles ?',
      'Quels partenaires doivent être coordonnés ?',
    ],
    actionsPrioritaires: [
      'Évaluer la pertinence de l’accompagnement global',
      'Identifier le référent social',
      'Définir les responsabilités de chaque intervenant',
      'Fixer des objectifs réalistes et progressifs',
      'Programmer une évaluation conjointe',
    ],
    prestationsPossibles: [
      'Accompagnement global',
      'Service social',
      'Aide au logement',
      'Aide à la mobilité',
      'Aide à la garde d’enfants',
      'Parcours santé',
    ],
    vigilances: [
      'Ne pas réduire l’accompagnement global à une simple orientation sociale.',
      'Maintenir une perspective professionnelle adaptée.',
      'Éviter les doublons entre intervenants.',
    ],
  },

  {
    id: 'th',
    code: 'TH',
    libelle: 'Handicap — Team Handicap / Lieu unique d’accompagnement',
    finalite:
      'Proposer un accompagnement tenant compte des conséquences du handicap sur le projet, le poste recherché et les besoins de compensation.',
    niveauAccompagnement: 'Spécialisé handicap',
    intensiteIndicative: 'Adaptée à la situation',
    criteresOrientation: [
      'RQTH ou démarche de reconnaissance',
      'Restriction médicale ayant un impact professionnel',
      'Besoin d’aménagement ou de compensation',
      'Projet nécessitant une expertise handicap',
      'Besoin d’appui de Cap emploi',
    ],
    signesIncompatibilite: [
      'Handicap ou RQTH sans incidence sur le parcours et sans besoin spécialisé identifié',
    ],
    objectifsConseiller: [
      'Évaluer les conséquences fonctionnelles',
      'Adapter le projet professionnel',
      'Identifier les besoins de compensation',
      'Sécuriser les mises en relation',
      'Coordonner France Travail et Cap emploi',
    ],
    questionsEntretien: [
      'Quelles activités ou contraintes sont difficiles ?',
      'Existe-t-il des restrictions médicales ?',
      'Quels aménagements ont déjà été utiles ?',
      'Le projet est-il compatible avec les préconisations ?',
      'Une intervention de Cap emploi est-elle nécessaire ?',
    ],
    actionsPrioritaires: [
      'Vérifier la situation RQTH',
      'Identifier les restrictions sans recueillir de données médicales inutiles',
      'Évaluer la compatibilité du projet',
      'Mobiliser la Team Handicap ou Cap emploi',
      'Étudier les aides à la compensation',
    ],
    prestationsPossibles: [
      'Cap emploi',
      'Team Handicap',
      'Immersion professionnelle',
      'Étude ergonomique',
      'Aide à la compensation',
      'Formation adaptée',
    ],
    vigilances: [
      'La RQTH seule ne justifie pas automatiquement un portefeuille spécialisé.',
      'Raisonner sur les conséquences professionnelles, pas sur le diagnostic médical.',
      'Respecter la confidentialité des données de santé.',
    ],
  },

  {
    id: 'cej',
    code: 'CEJ',
    libelle: 'Contrat d’engagement jeune',
    finalite:
      'Proposer un accompagnement intensif à un jeune ayant besoin d’un parcours structuré vers l’emploi et l’autonomie.',
    niveauAccompagnement: 'Jeunes — intensif',
    intensiteIndicative: 'Très renforcée',
    criteresOrientation: [
      'Jeune répondant aux conditions du dispositif',
      'Difficultés d’accès durable à l’emploi',
      'Besoin d’accompagnement intensif',
      'Disponibilité pour participer activement au parcours',
      'Besoin de sécurisation de l’autonomie',
    ],
    signesIncompatibilite: [
      'Emploi ou formation durable incompatible avec le parcours',
      'Indisponibilité empêchant la participation active',
      'Autonomie suffisante ne nécessitant pas ce niveau d’intensité',
    ],
    objectifsConseiller: [
      'Construire un parcours intensif',
      'Développer l’autonomie',
      'Multiplier les mises en situation',
      'Sécuriser les ressources et les freins',
      'Accéder à l’emploi ou à une formation qualifiante',
    ],
    questionsEntretien: [
      'Quelle est votre situation actuelle ?',
      'Êtes-vous disponible pour un accompagnement intensif ?',
      'Quels freins empêchent l’accès à l’emploi ?',
      'Quel est votre niveau d’autonomie dans les démarches ?',
      'Quel objectif concret visez-vous dans les prochaines semaines ?',
    ],
    actionsPrioritaires: [
      'Vérifier l’éligibilité',
      'Évaluer la disponibilité',
      'Construire un programme d’actions',
      'Mobiliser les immersions et événements',
      'Coordonner avec la Mission locale si nécessaire',
    ],
    prestationsPossibles: [
      'CEJ',
      'Immersion professionnelle',
      'Ateliers intensifs',
      'Formation',
      'Mission locale',
      'Aides à l’autonomie',
    ],
    vigilances: [
      'Vérifier les conditions du dispositif avant toute proposition.',
      'Ne pas assimiler intensité et multiplication d’actions sans cohérence.',
      'Adapter le parcours aux capacités réelles du jeune.',
    ],
  },

  {
    id: 'pp',
    code: 'PP',
    libelle: 'Projet professionnel / reconversion / création',
    finalite:
      'Accompagner les demandeurs dont le projet nécessite une phase structurée de clarification, de validation ou de construction.',
    niveauAccompagnement: 'Projet',
    intensiteIndicative: 'Variable',
    criteresOrientation: [
      'Projet de reconversion',
      'Projet de création ou reprise d’entreprise',
      'Projet de formation',
      'Projet non suffisamment confirmé',
      'Besoin de validation par une immersion ou une étude de faisabilité',
    ],
    signesIncompatibilite: [
      'Projet déjà validé et directement opérationnel',
      'Freins sociaux prioritaires empêchant le travail sur le projet',
    ],
    objectifsConseiller: [
      'Clarifier le projet',
      'Évaluer la faisabilité',
      'Vérifier les compétences et prérequis',
      'Étudier le marché et les débouchés',
      'Construire un plan d’action',
    ],
    questionsEntretien: [
      'Quel projet souhaitez-vous développer ?',
      'Pourquoi ce projet ?',
      'Quelles compétences possédez-vous déjà ?',
      'Quels prérequis manquent ?',
      'Comment avez-vous vérifié les débouchés ?',
      'Quel financement est envisagé ?',
    ],
    actionsPrioritaires: [
      'Analyser les compétences transférables',
      'Vérifier le marché du travail',
      'Étudier la formation ou la création',
      'Proposer une immersion',
      'Formaliser les étapes de validation',
    ],
    prestationsPossibles: [
      'Activ’Projet',
      'Activ’Créa',
      'VAE',
      'Bilan de compétences',
      'PMSMP',
      'AIF',
      'AFC',
    ],
    vigilances: [
      'Ne pas financer une formation avant validation du projet.',
      'Distinguer envie, projet et projet réalisable.',
      'Vérifier les débouchés et les prérequis.',
    ],
  },

  {
    id: 'intensif',
    code: 'INTENSIF',
    libelle: 'Accompagnement intensif',
    finalite:
      'Renforcer temporairement l’accompagnement lorsqu’un besoin d’appui fréquent et structuré est identifié.',
    niveauAccompagnement: 'Professionnel renforcé',
    intensiteIndicative: 'Très soutenue',
    criteresOrientation: [
      'Besoin de contacts fréquents',
      'Démarches insuffisamment structurées',
      'Risque de décrochage',
      'Retour à l’emploi possible avec mobilisation renforcée',
      'Besoin de préparation intensive',
    ],
    signesIncompatibilite: [
      'Freins sociaux empêchant toute mobilisation professionnelle',
      'Autonomie forte ne nécessitant pas de suivi fréquent',
    ],
    objectifsConseiller: [
      'Remobiliser rapidement',
      'Structurer les démarches',
      'Multiplier les opportunités utiles',
      'Mesurer les résultats',
      'Réduire progressivement l’intensité',
    ],
    questionsEntretien: [
      'Pourquoi les démarches actuelles ne produisent-elles pas de résultat ?',
      'Quel rythme de suivi serait utile ?',
      'Quelles actions doivent être engagées immédiatement ?',
      'Quels résultats seront vérifiés au prochain contact ?',
    ],
    actionsPrioritaires: [
      'Définir un plan d’action court',
      'Programmer des contacts rapprochés',
      'Suivre les résultats',
      'Mobiliser les offres et événements',
      'Réévaluer l’intensité régulièrement',
    ],
    prestationsPossibles: [
      'Ateliers intensifs',
      'Mise en relation employeur',
      'Préparation entretien',
      'Immersion',
      'Formation courte',
    ],
    vigilances: [
      'L’intensif doit répondre à un besoin précis et réévaluable.',
      'Éviter un suivi fréquent sans objectif mesurable.',
      'Prévoir une sortie ou une évolution du parcours.',
    ],
  },

  {
    id: 'mutualise',
    code: 'MUTUALISÉ',
    libelle: 'Portefeuille mutualisé',
    finalite:
      'Assurer une continuité de service lorsque le suivi n’est pas rattaché durablement à un conseiller unique ou lorsqu’une organisation collective est retenue.',
    niveauAccompagnement: 'Organisation collective',
    intensiteIndicative: 'Variable',
    criteresOrientation: [
      'Besoin ponctuel',
      'Suivi partagé',
      'Absence temporaire de conseiller référent',
      'Public autonome',
      'Organisation locale mutualisée',
    ],
    signesIncompatibilite: [
      'Situation complexe nécessitant un référent clairement identifié',
      'Besoin d’accompagnement renforcé et continu',
    ],
    objectifsConseiller: [
      'Garantir la continuité du suivi',
      'Tracer les actions',
      'Éviter les ruptures de parcours',
      'Identifier rapidement les situations nécessitant un référent',
    ],
    questionsEntretien: [
      'Quel est le dernier contact réalisé ?',
      'Quelles actions sont déjà engagées ?',
      'Une situation complexe nécessite-t-elle un référent dédié ?',
      'Quelle est la prochaine action datée ?',
    ],
    actionsPrioritaires: [
      'Consulter l’historique',
      'Tracer toute décision',
      'Éviter les prescriptions en doublon',
      'Proposer un transfert si la situation le justifie',
    ],
    prestationsPossibles: [
      'Ateliers',
      'Événements emploi',
      'Services en autonomie',
      'Rendez-vous ponctuel',
    ],
    vigilances: [
      'Le mutualisé est une modalité d’organisation, pas un diagnostic.',
      'Une situation complexe doit être réorientée vers un suivi adapté.',
      'La traçabilité doit être particulièrement rigoureuse.',
    ],
  },
]

export const getPortefeuilleAccompagnement = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()

  return (
    PORTEFEUILLES_ACCOMPAGNEMENT.find(
      (item) =>
        item.id === normalized ||
        item.code.toLowerCase() === normalized,
    ) || null
  )
}

export const getPortefeuillesOptions = () =>
  PORTEFEUILLES_ACCOMPAGNEMENT.map((item) => ({
    value: item.id,
    label: `${item.code} — ${item.libelle}`,
  }))

export const analyserCoherencePortefeuille = ({
  portefeuille,
  categorie,
  age,
  rqth,
  freins = [],
  projetConfirme,
  disponibleImmediatement,
  besoinAccompagnementIntensif,
  creationEntreprise,
  reconversion,
} = {}) => {
  const reference =
    getPortefeuilleAccompagnement(portefeuille)

  const alertes = []
  const recommandations = []

  if (!reference) {
    return {
      portefeuilleReconnu: false,
      coherent: false,
      niveauVigilance: 'Élevé',
      alertes: [
        'Le portefeuille d’accompagnement n’est pas renseigné ou n’est pas reconnu.',
      ],
      recommandations: [
        'Réaliser le diagnostic global avant de proposer une affectation.',
      ],
    }
  }

  const freinsNormalises = Array.isArray(freins)
    ? freins.filter(Boolean)
    : []

  if (
    reference.id === 'em' &&
    freinsNormalises.length >= 2
  ) {
    alertes.push(
      'Le portefeuille EM semble peu cohérent avec plusieurs freins actifs.',
    )
    recommandations.push(
      'Évaluer un accompagnement socioprofessionnel ou global.',
    )
  }

  if (
    reference.id === 'glo' &&
    freinsNormalises.length < 2
  ) {
    alertes.push(
      'L’accompagnement global doit être justifié par un besoin réel de coordination sociale et professionnelle.',
    )
  }

  if (reference.id === 'th' && !rqth) {
    alertes.push(
      'Le besoin d’un accompagnement handicap doit être confirmé par les conséquences professionnelles de la situation.',
    )
  }

  if (
    reference.id === 'cej' &&
    Number.isFinite(Number(age)) &&
    Number(age) >= 26
  ) {
    alertes.push(
      'L’âge indiqué nécessite de vérifier l’éligibilité au dispositif jeune.',
    )
  }

  if (
    reference.id === 'pp' &&
    !creationEntreprise &&
    !reconversion &&
    projetConfirme === true
  ) {
    alertes.push(
      'Le portefeuille Projet professionnel semble à réévaluer si le projet est déjà confirmé et directement opérationnel.',
    )
  }

  if (
    reference.id === 'intensif' &&
    !besoinAccompagnementIntensif
  ) {
    alertes.push(
      'Le besoin d’un accompagnement intensif n’est pas suffisamment caractérisé.',
    )
  }

  if (
    reference.id === 'em' &&
    disponibleImmediatement === false
  ) {
    alertes.push(
      'Le portefeuille EM doit être réévalué lorsque la personne n’est pas disponible immédiatement.',
    )
  }

  if (
    Number(categorie) === 9 &&
    reference.id === 'em'
  ) {
    alertes.push(
      'Une catégorie 9 est généralement incompatible avec un accompagnement centré sur le placement immédiat.',
    )
  }

  if (
    Number(categorie) === 10 &&
    !['sp', 'glo', 'th', 'pp'].includes(reference.id)
  ) {
    recommandations.push(
      'Pour une catégorie 10, confirmer l’orientation après le diagnostic global et la désignation de l’organisme référent.',
    )
  }

  return {
    portefeuilleReconnu: true,
    coherent: alertes.length === 0,
    niveauVigilance:
      alertes.length >= 3
        ? 'Très élevé'
        : alertes.length
          ? 'Élevé'
          : 'Standard',
    portefeuille: reference,
    alertes: unique(alertes),
    recommandations: unique(recommandations),
  }
}

export default PORTEFEUILLES_ACCOMPAGNEMENT