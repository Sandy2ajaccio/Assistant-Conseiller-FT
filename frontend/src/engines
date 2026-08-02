import {
  analyserCategorieEtSituation,
} from '../data/categorieRules'

import {
  analyserCoherencePortefeuille,
  getPortefeuilleAccompagnement,
  PORTEFEUILLES_ACCOMPAGNEMENT,
} from '../data/portefeuillesAccompagnement'

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
    'beneficiaire',
    'signe',
    'signee',
  ].includes(normalizeText(value))
}

const getProfiles = (situation = {}) => {
  const values = Array.isArray(situation.profils)
    ? situation.profils
    : String(situation.profils || '')
      .split(/[;,|]/)
      .filter(Boolean)

  return new Set(values.map(normalizeText))
}

const hasProfile = (
  situation,
  searchedProfiles = [],
) => {
  const profiles = getProfiles(situation)

  return searchedProfiles.some((profile) =>
    profiles.has(normalizeText(profile)),
  )
}

const getFreins = (situation = {}) => {
  const freins = new Set()

  const sourceFreins = Array.isArray(
    situation.freinsSelectionnes,
  )
    ? situation.freinsSelectionnes
    : Array.isArray(situation.freins)
      ? situation.freins
      : []

  sourceFreins.forEach((frein) => {
    const normalized = normalizeText(frein)

    if (normalized) {
      freins.add(normalized)
    }
  })

  const correspondances = [
    ['mobilite', ['mobilite']],
    ['sante', ['sante']],
    ['logement', ['logement']],
    ['garde_enfants', ['garde_enfants']],
    ['numerique', ['numerique']],
    ['francais', ['francais', 'fle']],
    ['justice', ['justice']],
    ['finances', ['finances', 'difficultes_financieres']],
  ]

  correspondances.forEach(([frein, profiles]) => {
    if (
      isTruthyValue(situation[frein]) ||
      hasProfile(situation, profiles)
    ) {
      freins.add(frein)
    }
  })

  return [...freins]
}

const getCategorieNumber = (situation = {}) => {
  const raw =
    situation.categorie ??
    situation.categorieDemandeur ??
    situation.categorieFranceTravail ??
    situation.categorieInscription

  const number = Number(
    String(raw ?? '').replace(/[^0-9]/g, ''),
  )

  return Number.isFinite(number) &&
    number >= 1 &&
    number <= 10
    ? number
    : null
}

const detecterSituationHandicap = (
  situation = {},
) =>
  isTruthyValue(situation.rqth) ||
  hasProfile(situation, [
    'rqth',
    'handicap',
    'situation_de_handicap',
  ])

const detecterProjetCreation = (
  situation = {},
) => {
  const projet = normalizeText(
    situation.projet ||
      situation.projetProfessionnel,
  )

  return (
    isTruthyValue(
      situation.creationEntreprise,
    ) ||
    hasProfile(situation, [
      'creation_entreprise',
      'reprise_entreprise',
    ]) ||
    projet.includes('creation') ||
    projet.includes('entreprise') ||
    projet.includes('auto-entrepreneur') ||
    projet.includes('micro-entreprise')
  )
}

const detecterProjetReconversion = (
  situation = {},
) => {
  const projet = normalizeText(
    situation.projet ||
      situation.projetProfessionnel,
  )

  return (
    isTruthyValue(situation.reconversion) ||
    hasProfile(situation, [
      'reconversion',
      'formation',
      'projet_a_confirmer',
    ]) ||
    projet.includes('reconversion') ||
    projet.includes('formation')
  )
}

const detecterProjetConfirme = (
  situation = {},
) => {
  if (
    situation.projetConfirme === true ||
    isTruthyValue(
      situation.projetConfirme,
    )
  ) {
    return true
  }

  if (
    situation.projetConfirme === false
  ) {
    return false
  }

  const projet = normalizeText(
    situation.projet ||
      situation.projetProfessionnel,
  )

  if (!projet) return false

  return ![
    'a definir',
    'non defini',
    'a confirmer',
    'indetermine',
    'aucun',
  ].some((value) =>
    projet.includes(value),
  )
}

const detecterDisponibilite = (
  situation = {},
  categorieAnalyse = {},
) => {
  if (
    situation.disponibleImmediatement === true
  ) {
    return true
  }

  if (
    situation.disponibleImmediatement === false
  ) {
    return false
  }

  return (
    categorieAnalyse
      .disponibiliteImmediate ?? null
  )
}

const detecterAutonomie = (
  situation = {},
) => {
  const value = normalizeText(
    situation.autonomie ||
      situation.niveauAutonomie,
  )

  if (
    [
      'forte',
      'autonome',
      'elevee',
      'bonne',
    ].includes(value)
  ) {
    return 'forte'
  }

  if (
    [
      'faible',
      'tres faible',
      'dependant',
    ].includes(value)
  ) {
    return 'faible'
  }

  return 'moyenne'
}

const detecterBesoinIntensif = (
  situation = {},
) => {
  if (
    isTruthyValue(
      situation.besoinAccompagnementIntensif,
    )
  ) {
    return true
  }

  const autonomie =
    detecterAutonomie(situation)

  const demarches = normalizeText(
    situation.demarches ||
      situation.demarchesRealisees,
  )

  return (
    autonomie === 'faible' ||
    demarches.includes('aucune') ||
    demarches.includes('insuffisante') ||
    isTruthyValue(
      situation.risqueDecrochage,
    )
  )
}

const detecterBesoinGlobal = (
  situation = {},
  freins = [],
) => {
  const freinSocialMajeur = freins.some(
    (frein) =>
      [
        'logement',
        'finances',
        'justice',
        'sante',
      ].includes(frein),
  )

  const accompagnementSocial =
    isTruthyValue(
      situation.accompagnementSocial,
    ) ||
    Boolean(
      String(
        situation.travailleurSocial ||
          situation.referentSocial ||
          '',
      ).trim(),
    )

  return (
    freins.length >= 2 &&
    (
      freinSocialMajeur ||
      accompagnementSocial
    )
  )
}

const construireSuggestion = ({
  portefeuilleId,
  score,
  motifs = [],
  vigilances = [],
}) => {
  const portefeuille =
    getPortefeuilleAccompagnement(
      portefeuilleId,
    )

  if (!portefeuille) return null

  return {
    id: portefeuille.id,
    code: portefeuille.code,
    libelle: portefeuille.libelle,
    score,
    motifs: unique(motifs),
    vigilances: unique(vigilances),
    finalite: portefeuille.finalite,
    niveauAccompagnement:
      portefeuille.niveauAccompagnement,
    actionsPrioritaires:
      portefeuille.actionsPrioritaires || [],
  }
}

const classerSuggestions = (
  suggestions = [],
) =>
  suggestions
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)

const evaluerPortefeuilles = (
  situation = {},
) => {
  const categorieAnalyse =
    analyserCategorieEtSituation(situation)

  const categorie =
    getCategorieNumber(situation)

  const age = Number(situation.age)

  const freins = getFreins(situation)

  const rqth =
    detecterSituationHandicap(situation)

  const creationEntreprise =
    detecterProjetCreation(situation)

  const reconversion =
    detecterProjetReconversion(situation)

  const projetConfirme =
    detecterProjetConfirme(situation)

  const disponibleImmediatement =
    detecterDisponibilite(
      situation,
      categorieAnalyse,
    )

  const autonomie =
    detecterAutonomie(situation)

  const besoinIntensif =
    detecterBesoinIntensif(situation)

  const besoinGlobal =
    detecterBesoinGlobal(
      situation,
      freins,
    )

  const suggestions = []

  let scoreEm = 0
  const motifsEm = []
  const vigilancesEm = []

  if (
    disponibleImmediatement === true
  ) {
    scoreEm += 30
    motifsEm.push(
      'Disponibilité immédiate identifiée.',
    )
  }

  if (projetConfirme) {
    scoreEm += 25
    motifsEm.push(
      'Projet professionnel défini.',
    )
  }

  if (freins.length === 0) {
    scoreEm += 25
    motifsEm.push(
      'Aucun frein périphérique majeur identifié.',
    )
  }

  if (autonomie === 'forte') {
    scoreEm += 20
    motifsEm.push(
      'Autonomie élevée dans les démarches.',
    )
  }

  if (
    categorie === 1 ||
    categorie === 2 ||
    categorie === 3
  ) {
    scoreEm += 15
    motifsEm.push(
      'Catégorie compatible avec une recherche active et une disponibilité immédiate.',
    )
  }

  if (freins.length >= 2) {
    scoreEm -= 30
    vigilancesEm.push(
      'Plusieurs freins rendent le placement immédiat moins adapté.',
    )
  }

  if (
    disponibleImmediatement === false
  ) {
    scoreEm -= 30
    vigilancesEm.push(
      'La personne n’est pas immédiatement disponible.',
    )
  }

  if (categorie === 9) {
    scoreEm -= 40
    vigilancesEm.push(
      'La catégorie 9 est peu compatible avec une logique de placement immédiat.',
    )
  }

  suggestions.push(
    construireSuggestion({
      portefeuilleId: 'em',
      score: scoreEm,
      motifs: motifsEm,
      vigilances: vigilancesEm,
    }),
  )

  let scoreSp = 0
  const motifsSp = []

  if (freins.length >= 1) {
    scoreSp += 25
    motifsSp.push(
      'Présence d’au moins un frein périphérique.',
    )
  }

  if (!projetConfirme) {
    scoreSp += 25
    motifsSp.push(
      'Projet professionnel à clarifier ou sécuriser.',
    )
  }

  if (autonomie === 'moyenne') {
    scoreSp += 20
    motifsSp.push(
      'Autonomie partielle dans les démarches.',
    )
  }

  if (
    categorie === 9 ||
    categorie === 10
  ) {
    scoreSp += 20
    motifsSp.push(
      'La situation nécessite une approche socioprofessionnelle et un diagnostic global.',
    )
  }

  if (
    freins.length >= 3 &&
    besoinGlobal
  ) {
    scoreSp -= 10
  }

  suggestions.push(
    construireSuggestion({
      portefeuilleId: 'sp',
      score: scoreSp,
      motifs: motifsSp,
    }),
  )

  let scoreGlo = 0
  const motifsGlo = []

  if (freins.length >= 2) {
    scoreGlo += 30
    motifsGlo.push(
      'Cumul de plusieurs freins.',
    )
  }

  if (besoinGlobal) {
    scoreGlo += 40
    motifsGlo.push(
      'Besoin de coordination sociale et professionnelle.',
    )
  }

  if (
    categorie === 9
  ) {
    scoreGlo += 20
    motifsGlo.push(
      'Catégorie orientée vers un accompagnement à vocation d’insertion sociale.',
    )
  }

  suggestions.push(
    construireSuggestion({
      portefeuilleId: 'glo',
      score: scoreGlo,
      motifs: motifsGlo,
    }),
  )

  let scoreTh = 0
  const motifsTh = []

  if (rqth) {
    scoreTh += 50
    motifsTh.push(
      'RQTH ou situation de handicap identifiée.',
    )
  }

  if (
    isTruthyValue(
      situation.besoinCompensation,
    )
  ) {
    scoreTh += 30
    motifsTh.push(
      'Besoin de compensation ou d’aménagement identifié.',
    )
  }

  if (
    isTruthyValue(
      situation.restrictionsProfessionnelles,
    )
  ) {
    scoreTh += 20
    motifsTh.push(
      'Restrictions ayant un impact professionnel.',
    )
  }

  suggestions.push(
    construireSuggestion({
      portefeuilleId: 'th',
      score: scoreTh,
      motifs: motifsTh,
      vigilances: rqth
        ? []
        : [
          'La RQTH seule ne doit pas être supposée : vérifier les éléments professionnels utiles.',
        ],
    }),
  )

  let scoreCej = 0
  const motifsCej = []

  if (
    Number.isFinite(age) &&
    age < 26
  ) {
    scoreCej += 35
    motifsCej.push(
      'Jeune de moins de 26 ans.',
    )
  }

  if (
    Number.isFinite(age) &&
    age < 30 &&
    rqth
  ) {
    scoreCej += 20
    motifsCej.push(
      'Jeune en situation de handicap : éligibilité spécifique à vérifier.',
    )
  }

  if (besoinIntensif) {
    scoreCej += 25
    motifsCej.push(
      'Besoin d’accompagnement intensif.',
    )
  }

  if (
    disponibleImmediatement === true
  ) {
    scoreCej += 10
  }

  suggestions.push(
    construireSuggestion({
      portefeuilleId: 'cej',
      score: scoreCej,
      motifs: motifsCej,
      vigilances:
        Number.isFinite(age) &&
        age >= 26 &&
        !(age < 30 && rqth)
          ? [
            'L’âge indiqué nécessite une vérification précise de l’éligibilité.',
          ]
          : [],
    }),
  )

  let scorePp = 0
  const motifsPp = []

  if (!projetConfirme) {
    scorePp += 30
    motifsPp.push(
      'Projet professionnel à clarifier ou valider.',
    )
  }

  if (creationEntreprise) {
    scorePp += 35
    motifsPp.push(
      'Projet de création ou reprise d’entreprise.',
    )
  }

  if (reconversion) {
    scorePp += 30
    motifsPp.push(
      'Projet de reconversion ou de formation.',
    )
  }

  suggestions.push(
    construireSuggestion({
      portefeuilleId: 'pp',
      score: scorePp,
      motifs: motifsPp,
    }),
  )

  let scoreIntensif = 0
  const motifsIntensif = []

  if (besoinIntensif) {
    scoreIntensif += 40
    motifsIntensif.push(
      'Besoin de contacts rapprochés et d’un plan d’action structuré.',
    )
  }

  if (
    autonomie === 'faible'
  ) {
    scoreIntensif += 20
    motifsIntensif.push(
      'Faible autonomie dans les démarches.',
    )
  }

  if (
    freins.length <= 1 &&
    disponibleImmediatement === true
  ) {
    scoreIntensif += 20
    motifsIntensif.push(
      'Retour à l’emploi possible avec un renforcement temporaire.',
    )
  }

  if (besoinGlobal) {
    scoreIntensif -= 20
  }

  suggestions.push(
    construireSuggestion({
      portefeuilleId: 'intensif',
      score: scoreIntensif,
      motifs: motifsIntensif,
    }),
  )

  let scoreMutualise = 0
  const motifsMutualise = []

  if (
    autonomie === 'forte' &&
    freins.length === 0
  ) {
    scoreMutualise += 25
    motifsMutualise.push(
      'Situation autonome nécessitant principalement une continuité de service.',
    )
  }

  if (
    isTruthyValue(
      situation.besoinPonctuel,
    )
  ) {
    scoreMutualise += 25
    motifsMutualise.push(
      'Besoin ponctuel identifié.',
    )
  }

  if (
    freins.length >= 2 ||
    besoinIntensif ||
    besoinGlobal
  ) {
    scoreMutualise -= 30
  }

  suggestions.push(
    construireSuggestion({
      portefeuilleId: 'mutualise',
      score: scoreMutualise,
      motifs: motifsMutualise,
    }),
  )

  return {
    categorieAnalyse,
    contexte: {
      categorie,
      age: Number.isFinite(age)
        ? age
        : null,
      freins,
      rqth,
      creationEntreprise,
      reconversion,
      projetConfirme,
      disponibleImmediatement,
      autonomie,
      besoinIntensif,
      besoinGlobal,
    },
    suggestions:
      classerSuggestions(suggestions),
  }
}

export const orienterVersPortefeuille = (
  situation = {},
) => {
  const evaluation =
    evaluerPortefeuilles(situation)

  const suggestionsPertinentes =
    evaluation.suggestions.filter(
      (suggestion) =>
        suggestion.score > 0,
    )

  const principale =
    suggestionsPertinentes[0] || null

  const alternatives =
    suggestionsPertinentes.slice(1, 4)

  const alertes = []

  if (!principale) {
    alertes.push(
      'Aucun portefeuille ne peut être proposé sans compléter le diagnostic.',
    )
  }

  if (
    principale &&
    principale.score < 35
  ) {
    alertes.push(
      'La suggestion reste fragile : plusieurs informations doivent être complétées.',
    )
  }

  if (
    principale &&
    alternatives[0] &&
    principale.score -
      alternatives[0].score <= 10
  ) {
    alertes.push(
      'Plusieurs portefeuilles sont proches : une décision humaine est nécessaire.',
    )
  }

  return {
    orientationProposee: Boolean(
      principale,
    ),
    portefeuillePrincipal:
      principale,
    alternatives,
    alertes: unique(alertes),
    contexte: evaluation.contexte,
    analyseCategorie:
      evaluation.categorieAnalyse,
    toutesLesSuggestions:
      evaluation.suggestions,
    decisionHumaineRequise: true,
  }
}

export const verifierPortefeuilleActuel = (
  situation = {},
) => {
  const portefeuilleActuel =
    situation.portefeuille ||
    situation.portefeuilleActuel ||
    situation.codePortefeuille

  const orientation =
    orienterVersPortefeuille(situation)

  const coherence =
    analyserCoherencePortefeuille({
      portefeuille: portefeuilleActuel,
      categorie:
        orientation.contexte.categorie,
      age: orientation.contexte.age,
      rqth: orientation.contexte.rqth,
      freins:
        orientation.contexte.freins,
      projetConfirme:
        orientation.contexte.projetConfirme,
      disponibleImmediatement:
        orientation.contexte
          .disponibleImmediatement,
      besoinAccompagnementIntensif:
        orientation.contexte
          .besoinIntensif,
      creationEntreprise:
        orientation.contexte
          .creationEntreprise,
      reconversion:
        orientation.contexte.reconversion,
    })

  const actuel =
    getPortefeuilleAccompagnement(
      portefeuilleActuel,
    )

  const correspondAProposition =
    Boolean(
      actuel &&
      orientation.portefeuillePrincipal &&
      actuel.id ===
        orientation
          .portefeuillePrincipal.id,
    )

  return {
    portefeuilleActuel: actuel,
    coherence,
    orientation,
    correspondAProposition,
    changementAEtudier:
      Boolean(actuel) &&
      !correspondAProposition &&
      orientation.portefeuillePrincipal
        ?.score >= 35,
  }
}

export const getReferentielPortefeuilles =
  () =>
    PORTEFEUILLES_ACCOMPAGNEMENT.map(
      (portefeuille) => ({
        id: portefeuille.id,
        code: portefeuille.code,
        libelle: portefeuille.libelle,
        finalite: portefeuille.finalite,
        niveauAccompagnement:
          portefeuille
            .niveauAccompagnement,
      }),
    )

export default orienterVersPortefeuille