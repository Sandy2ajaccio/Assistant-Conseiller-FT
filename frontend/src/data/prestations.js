import { prestationsCorse } from './configurationCorse'

const normaliser = (valeur) =>
  String(valeur ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const unique = (elements = []) =>
  [...new Set(elements.filter(Boolean))]

export const PRESTATIONS_FRANCE_TRAVAIL = [
  {
    id: 'activ-projet',
    nom: "Activ'Projet",
    type: 'Prestation',
    objectif:
      'Clarifier, construire ou confirmer un projet professionnel.',
    situationsAdaptees: [
      'Projet professionnel non défini',
      'Projet à confirmer',
      'Reconversion professionnelle',
      'Besoin d’explorer plusieurs métiers',
      'Besoin de vérifier la faisabilité du projet',
    ],
    contreIndications: [
      'Projet déjà confirmé et directement opérationnel',
      'Entrée en emploi imminente',
      'Freins sociaux empêchant temporairement le travail sur le projet',
    ],
    declencheurs: [
      'projet_non_defini',
      'projet_a_confirmer',
      'reconversion',
      'besoin_exploration_metiers',
    ],
    questionsConseiller: [
      'Quel métier ou secteur envisagez-vous ?',
      'Pourquoi souhaitez-vous changer de métier ?',
      'Quelles compétences pouvez-vous transférer ?',
      'Comment avez-vous vérifié les débouchés ?',
      'Une immersion permettrait-elle de confirmer le projet ?',
    ],
    resultatsAttendus: [
      'Projet professionnel clarifié',
      'Faisabilité vérifiée',
      'Plan d’action défini',
    ],
    prioriteIndicative: 80,
  },

  {
    id: 'activ-crea',
    nom: "Activ'Créa",
    type: 'Prestation',
    objectif:
      'Explorer ou structurer un projet de création ou de reprise d’entreprise.',
    situationsAdaptees: [
      'Projet de création d’entreprise',
      'Projet de reprise d’entreprise',
      'Projet de micro-entreprise',
      'Besoin de vérifier la faisabilité économique',
    ],
    contreIndications: [
      'Absence de projet entrepreneurial',
      'Entreprise déjà suffisamment structurée et autonome',
      'Freins personnels empêchant temporairement l’engagement dans le projet',
    ],
    declencheurs: [
      'creation_entreprise',
      'reprise_entreprise',
      'micro_entreprise',
      'auto_entrepreneur',
    ],
    questionsConseiller: [
      'Quelle activité souhaitez-vous développer ?',
      'Quel besoin du marché avez-vous identifié ?',
      'Avez-vous étudié les charges et les recettes prévisionnelles ?',
      'Avez-vous besoin d’un accompagnement BGE, ADIE ou CitéLab ?',
    ],
    resultatsAttendus: [
      'Projet entrepreneurial clarifié',
      'Faisabilité étudiée',
      'Étapes de création planifiées',
    ],
    prioriteIndicative: 85,
  },

  {
    id: 'pmsmp',
    nom: 'PMSMP / immersion professionnelle',
    type: 'Dispositif',
    objectif:
      'Découvrir un métier, confirmer un projet ou évaluer des compétences en situation professionnelle.',
    situationsAdaptees: [
      'Projet à confirmer',
      'Découverte d’un métier',
      'Reconversion professionnelle',
      'Besoin de vérifier les conditions réelles d’exercice',
      'Besoin de préparer une embauche',
    ],
    contreIndications: [
      'Objectif de l’immersion non défini',
      'Entreprise d’accueil non identifiée',
      'Situation incompatible avec les conditions de l’immersion',
    ],
    declencheurs: [
      'immersion',
      'projet_a_confirmer',
      'decouverte_metier',
      'reconversion',
    ],
    questionsConseiller: [
      'Quel métier souhaitez-vous observer ?',
      'Quel objectif précis doit être vérifié pendant l’immersion ?',
      'Une entreprise d’accueil a-t-elle été identifiée ?',
      'Quelles compétences devront être observées ?',
    ],
    resultatsAttendus: [
      'Projet confirmé ou réorienté',
      'Conditions d’exercice mieux connues',
      'Compétences observées',
    ],
    prioriteIndicative: 75,
  },

  {
    id: 'poei',
    nom: 'POEI',
    type: 'Formation préalable au recrutement',
    objectif:
      'Former une personne avant une embauche lorsqu’un écart de compétences est identifié.',
    situationsAdaptees: [
      'Employeur identifié',
      'Projet de recrutement concret',
      'Écart de compétences limité et identifiable',
      'Formation préalable nécessaire',
    ],
    contreIndications: [
      'Absence d’employeur ou de recrutement identifié',
      'Projet professionnel non validé',
      'Formation sans lien direct avec une embauche',
    ],
    declencheurs: [
      'employeur_identifie',
      'promesse_embauche',
      'ecart_competences',
      'formation_avant_recrutement',
    ],
    questionsConseiller: [
      'Quel employeur prévoit le recrutement ?',
      'Quel poste est proposé ?',
      'Quelles compétences doivent être acquises ?',
      'Quel engagement d’embauche est prévu ?',
    ],
    resultatsAttendus: [
      'Compétences adaptées au poste',
      'Recrutement sécurisé',
      'Prise de poste facilitée',
    ],
    prioriteIndicative: 95,
  },

  {
    id: 'afpr',
    nom: 'AFPR',
    type: 'Formation préalable au recrutement',
    objectif:
      'Adapter les compétences avant une embauche prévue sur un contrat compatible avec le dispositif.',
    situationsAdaptees: [
      'Employeur identifié',
      'Recrutement concret',
      'Besoin d’adaptation au poste',
      'Formation courte avant l’embauche',
    ],
    contreIndications: [
      'Absence d’offre ou d’employeur',
      'Projet non confirmé',
      'Besoin de formation sans perspective d’embauche',
    ],
    declencheurs: [
      'employeur_identifie',
      'ecart_competences',
      'adaptation_poste',
    ],
    questionsConseiller: [
      'Quel poste est proposé ?',
      'Quel contrat est envisagé ?',
      'Quelles compétences doivent être développées ?',
      'Quelle formation est nécessaire avant la prise de poste ?',
    ],
    resultatsAttendus: [
      'Adaptation au poste',
      'Accès à l’emploi',
      'Recrutement sécurisé',
    ],
    prioriteIndicative: 90,
  },

  {
    id: 'aif',
    nom: 'AIF',
    type: 'Aide à la formation',
    objectif:
      'Contribuer au financement d’une formation cohérente avec un projet professionnel validé.',
    situationsAdaptees: [
      'Projet professionnel validé',
      'Formation nécessaire au retour à l’emploi',
      'Financement principal insuffisant',
      'Débouchés professionnels vérifiés',
    ],
    contreIndications: [
      'Projet non validé',
      'Formation sans débouché identifié',
      'Formation non nécessaire au projet',
      'Demande de financement incomplète',
    ],
    declencheurs: [
      'formation',
      'projet_confirme',
      'besoin_financement',
      'ecart_competences',
    ],
    questionsConseiller: [
      'Quel métier sera accessible après la formation ?',
      'Pourquoi cette formation est-elle nécessaire ?',
      'Quels débouchés ont été vérifiés ?',
      'Quels financements sont déjà mobilisés ?',
      'Les prérequis sont-ils acquis ?',
    ],
    resultatsAttendus: [
      'Qualification ou compétences acquises',
      'Retour à l’emploi facilité',
      'Projet professionnel sécurisé',
    ],
    prioriteIndicative: 75,
  },

  {
    id: 'afc',
    nom: 'AFC',
    type: 'Formation collective',
    objectif:
      'Permettre l’acquisition de compétences correspondant à des besoins de recrutement identifiés.',
    situationsAdaptees: [
      'Projet professionnel compatible avec la formation',
      'Besoin de qualification',
      'Métiers présentant des besoins de recrutement',
      'Prérequis compatibles',
    ],
    contreIndications: [
      'Projet non cohérent avec la formation',
      'Prérequis non atteints',
      'Indisponibilité pendant la formation',
    ],
    declencheurs: [
      'formation_collective',
      'besoin_qualification',
      'metier_en_tension',
    ],
    questionsConseiller: [
      'La formation correspond-elle au projet ?',
      'Les prérequis sont-ils acquis ?',
      'La personne est-elle disponible pendant toute la formation ?',
      'Quels débouchés sont identifiés ?',
    ],
    resultatsAttendus: [
      'Compétences certifiées ou professionnalisantes',
      'Accès à un métier recherché',
      'Retour à l’emploi',
    ],
    prioriteIndicative: 75,
  },

  {
    id: 'vae',
    nom: 'VAE',
    type: 'Certification',
    objectif:
      'Faire reconnaître officiellement des compétences acquises par l’expérience.',
    situationsAdaptees: [
      'Expérience significative dans un métier',
      'Besoin de certification',
      'Évolution professionnelle',
      'Reconversion fondée sur des compétences déjà acquises',
    ],
    contreIndications: [
      'Expérience insuffisamment liée à la certification visée',
      'Certification non identifiée',
      'Besoin prioritaire de formation complète',
    ],
    declencheurs: [
      'experience',
      'certification',
      'vae',
      'evolution_professionnelle',
    ],
    questionsConseiller: [
      'Quelle expérience souhaitez-vous faire reconnaître ?',
      'Quelle certification visez-vous ?',
      'Vos activités correspondent-elles au référentiel de certification ?',
      'Avez-vous besoin d’un accompagnement pour constituer le dossier ?',
    ],
    resultatsAttendus: [
      'Certification totale ou partielle',
      'Compétences reconnues',
      'Évolution professionnelle facilitée',
    ],
    prioriteIndicative: 65,
  },

  {
    id: 'pix-emploi',
    nom: 'PIX Emploi',
    type: 'Évaluation et accompagnement numérique',
    objectif:
      'Évaluer et renforcer l’autonomie numérique utile à la recherche d’emploi.',
    situationsAdaptees: [
      'Difficultés avec l’espace personnel',
      'Difficultés avec les démarches en ligne',
      'Faible maîtrise de la messagerie',
      'Besoin d’évaluer les compétences numériques',
    ],
    contreIndications: [
      'Autonomie numérique confirmée',
      'Frein prioritaire plus urgent empêchant la participation',
    ],
    declencheurs: [
      'numerique',
      'faible_autonomie_numerique',
      'pix',
    ],
    questionsConseiller: [
      'Savez-vous vous connecter à votre espace personnel ?',
      'Savez-vous transmettre un document en ligne ?',
      'Utilisez-vous une adresse électronique ?',
      'Pouvez-vous rechercher et candidater à une offre ?',
    ],
    resultatsAttendus: [
      'Niveau numérique évalué',
      'Autonomie améliorée',
      'Démarches en ligne sécurisées',
    ],
    prioriteIndicative: 70,
  },

  {
    id: 'accompagnement-global',
    nom: 'Accompagnement global',
    type: 'Modalité d’accompagnement',
    objectif:
      'Coordonner simultanément les dimensions professionnelles et sociales du parcours.',
    situationsAdaptees: [
      'Cumul de freins sociaux et professionnels',
      'Besoin de coordination avec un travailleur social',
      'Logement instable',
      'Difficultés financières importantes',
      'Santé ou mobilité affectant fortement le parcours',
    ],
    contreIndications: [
      'Frein unique pouvant être traité dans un suivi standard',
      'Absence de besoin social identifié',
      'Autonomie suffisante et projet opérationnel',
    ],
    declencheurs: [
      'freins_multiples',
      'accompagnement_social',
      'logement',
      'finances',
      'sante',
    ],
    questionsConseiller: [
      'Quels freins doivent être traités en priorité ?',
      'Un travailleur social accompagne-t-il déjà la personne ?',
      'Quelles démarches professionnelles restent possibles ?',
      'Quels partenaires doivent être coordonnés ?',
    ],
    resultatsAttendus: [
      'Situation sociale stabilisée',
      'Coordination des intervenants',
      'Reprise progressive du parcours professionnel',
    ],
    prioriteIndicative: 90,
  },

  {
    id: 'cej',
    nom: 'Contrat d’engagement jeune',
    type: 'Accompagnement intensif',
    objectif:
      'Proposer un parcours intensif et structuré vers l’emploi ou la formation à un jeune éligible.',
    situationsAdaptees: [
      'Jeune répondant aux conditions du dispositif',
      'Difficulté d’accès durable à l’emploi',
      'Besoin d’accompagnement intensif',
      'Disponibilité pour participer activement au parcours',
    ],
    contreIndications: [
      'Emploi durable incompatible avec l’accompagnement',
      'Formation durable déjà engagée',
      'Indisponibilité empêchant la participation active',
      'Conditions d’éligibilité non remplies',
    ],
    declencheurs: [
      'jeune',
      'moins_26_ans',
      'cej',
      'besoin_accompagnement_intensif',
    ],
    questionsConseiller: [
      'La personne répond-elle aux conditions du CEJ ?',
      'Est-elle disponible pour un parcours intensif ?',
      'Quels freins doivent être levés ?',
      'Quel objectif concret peut être fixé ?',
    ],
    resultatsAttendus: [
      'Autonomie renforcée',
      'Accès à l’emploi ou à la formation',
      'Parcours intensif structuré',
    ],
    prioriteIndicative: 85,
  },

  {
    id: 'parcours-emploi-sante',
    nom: 'Parcours Emploi Santé',
    type: 'Prestation',
    objectif:
      'Analyser l’incidence de la santé sur le parcours professionnel et identifier des solutions adaptées.',
    situationsAdaptees: [
      'Santé freinant le retour à l’emploi',
      'Restrictions professionnelles à préciser',
      'Projet devenu incompatible avec les capacités',
      'Besoin de coordination emploi-santé',
    ],
    contreIndications: [
      'Situation médicale urgente relevant d’un suivi de soins',
      'Absence d’incidence de la santé sur le projet professionnel',
    ],
    declencheurs: [
      'sante',
      'restrictions_professionnelles',
      'projet_incompatible',
    ],
    questionsConseiller: [
      'La santé limite-t-elle certains gestes ou horaires ?',
      'Le métier recherché est-il encore compatible ?',
      'Des aménagements sont-ils nécessaires ?',
      'Une orientation handicap doit-elle être étudiée ?',
    ],
    resultatsAttendus: [
      'Impact professionnel de la santé clarifié',
      'Projet adapté',
      'Solutions d’accompagnement identifiées',
    ],
    prioriteIndicative: 85,
  },
]

const prestationsLocales = (prestationsCorse || [])
  .filter(Boolean)
  .filter(
    (nom) =>
      !PRESTATIONS_FRANCE_TRAVAIL.some(
        (prestation) =>
          normaliser(prestation.nom) ===
          normaliser(nom),
      ),
  )
  .map((nom, index) => ({
    id: `corse-${index + 1}`,
    nom,
    type: 'Prestation locale',
    objectif:
      'Prestation issue du référentiel local Corse.',
    situationsAdaptees: [],
    contreIndications: [],
    declencheurs: [],
    questionsConseiller: [],
    resultatsAttendus: [],
    prioriteIndicative: 50,
  }))

export const prestations = [
  ...PRESTATIONS_FRANCE_TRAVAIL,
  ...prestationsLocales,
]

export const getPrestationById = (id) =>
  prestations.find(
    (prestation) =>
      prestation.id === String(id || '').trim(),
  ) || null

export const rechercherPrestations = (recherche) => {
  const terme = normaliser(recherche)

  if (!terme) return prestations

  return prestations.filter((prestation) =>
    [
      prestation.nom,
      prestation.type,
      prestation.objectif,
      ...(prestation.situationsAdaptees || []),
      ...(prestation.declencheurs || []),
    ].some((valeur) =>
      normaliser(valeur).includes(terme),
    ),
  )
}

export const recommanderPrestations = ({
  projetConfirme,
  creationEntreprise,
  reconversion,
  formation,
  employeurIdentifie,
  rqth,
  sante,
  numerique,
  rsa,
  freins = [],
  age,
  besoinAccompagnementIntensif,
} = {}) => {
  const declencheurs = []

  if (projetConfirme === false) {
    declencheurs.push(
      'projet_non_defini',
      'projet_a_confirmer',
    )
  }

  if (creationEntreprise) {
    declencheurs.push(
      'creation_entreprise',
      'micro_entreprise',
    )
  }

  if (reconversion) {
    declencheurs.push('reconversion')
  }

  if (formation) {
    declencheurs.push(
      'formation',
      'besoin_qualification',
    )
  }

  if (employeurIdentifie) {
    declencheurs.push(
      'employeur_identifie',
      'formation_avant_recrutement',
    )
  }

  if (rqth) {
    declencheurs.push(
      'situation_de_handicap',
    )
  }

  if (sante) {
    declencheurs.push(
      'sante',
      'restrictions_professionnelles',
    )
  }

  if (numerique) {
    declencheurs.push(
      'numerique',
      'faible_autonomie_numerique',
    )
  }

  if (
    rsa &&
    Array.isArray(freins) &&
    freins.length >= 2
  ) {
    declencheurs.push(
      'freins_multiples',
      'accompagnement_social',
    )
  }

  if (
    Number.isFinite(Number(age)) &&
    Number(age) < 26
  ) {
    declencheurs.push(
      'jeune',
      'moins_26_ans',
    )
  }

  if (besoinAccompagnementIntensif) {
    declencheurs.push(
      'besoin_accompagnement_intensif',
    )
  }

  const declencheursUniques =
    unique(declencheurs)

  return prestations
    .map((prestation) => {
      const correspondances =
        prestation.declencheurs.filter(
          (declencheur) =>
            declencheursUniques.includes(
              declencheur,
            ),
        )

      return {
        ...prestation,
        score:
          correspondances.length * 25 +
          Math.round(
            prestation.prioriteIndicative / 10,
          ),
        motifs: correspondances,
      }
    })
    .filter((prestation) => prestation.score > 0)
    .sort((a, b) => b.score - a.score)
}

export default prestations