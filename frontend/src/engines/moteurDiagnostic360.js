import analyserPrescriptions from './moteurPrescriptions'
import analyserCategorieEtSituation from '../data/categorieRules'
import orienterVersPortefeuille from './moteurOrientationPortefeuille'

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

const getNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const getAge = (situation = {}) =>
  getNumber(situation.age)

const getCategorie = (situation = {}) => {
  const raw =
    situation.categorie ??
    situation.categorieDemandeur ??
    situation.categorieFranceTravail ??
    situation.categorieInscription

  const numero = Number(
    String(raw ?? '').replace(/[^0-9]/g, ''),
  )

  return numero >= 1 && numero <= 10
    ? numero
    : null
}

const getFreins = (situation = {}) => {
  const freins = []

  const freinsDirects = Array.isArray(situation.freins)
    ? situation.freins
    : Array.isArray(situation.freinsSelectionnes)
      ? situation.freinsSelectionnes
      : []

  freins.push(...freinsDirects)

  const correspondances = [
    ['Mobilité', situation.mobilite],
    ['Santé', situation.sante],
    ['Logement', situation.logement],
    ['Garde d’enfants', situation.gardeEnfants],
    ['Numérique', situation.numerique],
    ['Français / FLE', situation.francais],
    ['Justice', situation.justice],
    ['Difficultés financières', situation.finances],
  ]

  correspondances.forEach(([label, value]) => {
    if (isTruthyValue(value)) {
      freins.push(label)
    }
  })

  return unique(
    freins.map((frein) =>
      String(frein || '').trim(),
    ),
  )
}

const analyserIndemnisation = (situation = {}) => {
  const droits = []
  const alertes = []
  const controles = []

  const are =
    isTruthyValue(situation.are) ||
    normalizeText(
      situation.indemnisation,
    ).includes('are')

  const ass =
    isTruthyValue(situation.ass) ||
    normalizeText(
      situation.indemnisation,
    ).includes('ass')

  const rsa =
    isTruthyValue(situation.rsa) ||
    normalizeText(
      situation.indemnisation,
    ).includes('rsa')

  const aah =
    isTruthyValue(situation.aah) ||
    normalizeText(
      situation.indemnisation,
    ).includes('aah')

  const nonIndemnise =
    isTruthyValue(situation.nonIndemnise) ||
    normalizeText(
      situation.indemnisation,
    ).includes('non indemnise')

  if (are) droits.push('ARE')
  if (ass) droits.push('ASS')
  if (rsa) droits.push('RSA')
  if (aah) droits.push('AAH')
  if (nonIndemnise) droits.push('Non indemnisé')

  if (!droits.length) {
    alertes.push(
      'La situation d’indemnisation n’est pas renseignée.',
    )

    controles.push(
      'Vérifier les droits en cours et leur date de fin.',
    )
  }

  const dateFinDroits =
    situation.dateFinDroits ||
    situation.finDroits ||
    null

  if (dateFinDroits) {
    controles.push(
      `Échéance des droits à vérifier : ${dateFinDroits}.`,
    )
  }

  if (rsa) {
    controles.push(
      'Vérifier l’organisme référent et le contrat d’engagement.',
    )
  }

  return {
    droits,
    are,
    ass,
    rsa,
    aah,
    nonIndemnise,
    dateFinDroits,
    alertes,
    controles,
  }
}

const analyserHandicap = (situation = {}) => {
  const rqth =
    isTruthyValue(situation.rqth) ||
    normalizeText(
      situation.statutHandicap,
    ).includes('rqth')

  const restrictions =
    isTruthyValue(
      situation.restrictionsProfessionnelles,
    ) ||
    Boolean(
      String(
        situation.restrictions || '',
      ).trim(),
    )

  const besoinCompensation =
    isTruthyValue(
      situation.besoinCompensation,
    )

  const recommandations = []
  const questions = []

  if (rqth || restrictions || besoinCompensation) {
    recommandations.push(
      'Évaluer les conséquences professionnelles du handicap.',
      'Vérifier la compatibilité du projet avec les restrictions.',
      'Étudier les besoins d’aménagement ou de compensation.',
    )

    questions.push(
      'Quelles activités sont difficiles ou impossibles ?',
      'Quels aménagements ont déjà été utiles ?',
      'Une intervention de la Team Handicap ou de Cap emploi est-elle nécessaire ?',
    )
  }

  return {
    rqth,
    restrictions,
    besoinCompensation,
    recommandations,
    questions,
  }
}

const analyserProjet = (situation = {}) => {
  const projet =
    situation.projetProfessionnel ||
    situation.projet ||
    ''

  const projetNormalise =
    normalizeText(projet)

  const creationEntreprise =
    isTruthyValue(
      situation.creationEntreprise,
    ) ||
    projetNormalise.includes('creation') ||
    projetNormalise.includes('entreprise') ||
    projetNormalise.includes('micro-entreprise') ||
    projetNormalise.includes('auto-entrepreneur')

  const reconversion =
    isTruthyValue(situation.reconversion) ||
    projetNormalise.includes('reconversion')

  const formation =
    isTruthyValue(situation.formation) ||
    projetNormalise.includes('formation')

  const projetConfirme =
    isTruthyValue(situation.projetConfirme) ||
    (
      Boolean(projetNormalise) &&
      ![
        'a definir',
        'non defini',
        'a confirmer',
        'indetermine',
        'aucun',
      ].some((value) =>
        projetNormalise.includes(value),
      )
    )

  const alertes = []
  const actions = []

  if (!projetNormalise) {
    alertes.push(
      'Le projet professionnel n’est pas renseigné.',
    )

    actions.push(
      'Clarifier le métier ou l’objectif professionnel.',
    )
  }

  if (!projetConfirme) {
    actions.push(
      'Vérifier les compétences transférables.',
      'Étudier le marché du travail.',
      'Valider le projet par une immersion ou une prestation adaptée.',
    )
  }

  if (creationEntreprise) {
    actions.push(
      'Évaluer la viabilité du projet de création.',
      'Identifier les besoins d’accompagnement entrepreneurial.',
    )
  }

  if (reconversion || formation) {
    actions.push(
      'Vérifier les prérequis, les débouchés et le financement.',
    )
  }

  return {
    projet,
    projetConfirme,
    creationEntreprise,
    reconversion,
    formation,
    alertes,
    actions,
  }
}

const analyserDisponibilite = (
  situation = {},
  categorieAnalyse = {},
) => {
  let disponible = null

  if (
    situation.disponibleImmediatement === true
  ) {
    disponible = true
  } else if (
    situation.disponibleImmediatement === false
  ) {
    disponible = false
  } else {
    disponible =
      categorieAnalyse
        .disponibiliteImmediate ?? null
  }

  const alertes = []
  const questions = []

  if (disponible === false) {
    questions.push(
      'Quelle est la cause de l’indisponibilité ?',
      'À quelle date la personne redeviendra-t-elle disponible ?',
    )
  }

  if (disponible === null) {
    alertes.push(
      'La disponibilité immédiate doit être vérifiée.',
    )
  }

  return {
    disponibleImmediatement: disponible,
    alertes,
    questions,
  }
}

const calculerPriorite = ({
  categorie,
  freins,
  indemnisation,
  handicap,
  projet,
  disponibilite,
  orientation,
} = {}) => {
  let score = 20
  const motifs = []

  if (categorie === 9 || categorie === 10) {
    score += 20
    motifs.push(
      'Catégorie nécessitant un diagnostic global renforcé.',
    )
  }

  if (freins.length >= 1) {
    score += Math.min(freins.length * 8, 24)
    motifs.push(
      `${freins.length} frein(s) actif(s) identifié(s).`,
    )
  }

  if (
    indemnisation.rsa &&
    !isTruthyValue(
      orientation?.analyseCategorie
        ?.contratEngagementSigne,
    )
  ) {
    score += 10
    motifs.push(
      'Situation RSA et contrat d’engagement à vérifier.',
    )
  }

  if (
    handicap.rqth ||
    handicap.restrictions
  ) {
    score += 10
    motifs.push(
      'Situation de handicap ou restrictions professionnelles.',
    )
  }

  if (!projet.projetConfirme) {
    score += 10
    motifs.push(
      'Projet professionnel à clarifier ou valider.',
    )
  }

  if (
    disponibilite
      .disponibleImmediatement === false
  ) {
    score += 8
    motifs.push(
      'Indisponibilité immédiate.',
    )
  }

  if (
    orientation?.alertes?.length
  ) {
    score += 8
    motifs.push(
      'Orientation nécessitant une validation renforcée.',
    )
  }

  score = Math.min(score, 100)

  let niveau = 'Faible'

  if (score >= 75) niveau = 'Très élevée'
  else if (score >= 55) niveau = 'Élevée'
  else if (score >= 35) niveau = 'Moyenne'

  return {
    score,
    niveau,
    motifs: unique(motifs),
  }
}

export const analyserSituation360 = (
  situation = {},
) => {
  const categorie =
    getCategorie(situation)

  const categorieAnalyse =
    analyserCategorieEtSituation(situation)

  const freins =
    getFreins(situation)

  const indemnisation =
    analyserIndemnisation(situation)

  const handicap =
    analyserHandicap(situation)

  const projet =
    analyserProjet(situation)

  const disponibilite =
    analyserDisponibilite(
      situation,
      categorieAnalyse,
    )

  const orientation =
    orienterVersPortefeuille({
      ...situation,
      freins,
      categorie,
      projetConfirme:
        projet.projetConfirme,
      creationEntreprise:
        projet.creationEntreprise,
      reconversion:
        projet.reconversion,
      disponibleImmediatement:
        disponibilite
          .disponibleImmediatement,
      rqth: handicap.rqth,
    })

  const priorite =
    calculerPriorite({
      categorie,
      freins,
      indemnisation,
      handicap,
      projet,
      disponibilite,
      orientation,
    })

  const alertes = unique([
    ...(categorieAnalyse.alertes || []),
    ...(indemnisation.alertes || []),
    ...(projet.alertes || []),
    ...(disponibilite.alertes || []),
    ...(orientation.alertes || []),
  ])

  const questions = unique([
    ...(categorieAnalyse.questions || []),
    ...(handicap.questions || []),
    ...(disponibilite.questions || []),
  ])

  const actions = unique([
    ...(categorieAnalyse.actionsConseiller || []),
    ...(indemnisation.controles || []),
    ...(handicap.recommandations || []),
    ...(projet.actions || []),
  ])

  const recommandations = unique([
    ...(categorieAnalyse.recommandations || []),
    ...(orientation
      .portefeuillePrincipal
      ?.actionsPrioritaires || []),
  ])

  const prescriptions = analyserPrescriptions({
    ...situation,
    age: getAge(situation),
    projetConfirme: projet.projetConfirme,
    creationEntreprise: projet.creationEntreprise,
    reconversion: projet.reconversion,
    formation: projet.formation,
    rqth: handicap.rqth,
    rsa: indemnisation.rsa,
    sante: freins.some((frein) => normalizeText(frein).includes('sante')),
    numerique: freins.some((frein) => normalizeText(frein).includes('numerique')),
    freins,
  })

  return {
    diagnosticDisponible: true,

    identifiant:
      situation.identifiant || null,

    identite: {
      nom: situation.nom || '',
      prenom: situation.prenom || '',
      age: getAge(situation),
    },

    categorie: {
      numero: categorie,
      libelle:
        categorieAnalyse.libelleCategorie,
      description:
        categorieAnalyse
          .descriptionCategorie,
    },

    situationAdministrative: {
      droits: indemnisation.droits,
      rsa: indemnisation.rsa,
      are: indemnisation.are,
      ass: indemnisation.ass,
      aah: indemnisation.aah,
      nonIndemnise:
        indemnisation.nonIndemnise,
      dateFinDroits:
        indemnisation.dateFinDroits,
    },

    projet,

    handicap,

    disponibilite,

    freins,

    orientation: {
      portefeuillePrincipal:
        orientation.portefeuillePrincipal,
      alternatives:
        orientation.alternatives,
      decisionHumaineRequise:
        orientation.decisionHumaineRequise,
    },

    priorite,

    synthese: {
      objectifPrincipal:
        categorieAnalyse
          .objectifPrincipal,

      accompagnementPrincipal:
        categorieAnalyse
          .accompagnementPrincipal,

      niveauVigilance:
        categorieAnalyse
          .niveauVigilance,

      alertes,

      questions,

      actions,

      recommandations,
    },

    prescriptions,

    principesDecision:
      categorieAnalyse.principesDecision ||
      [],

    dateAnalyse:
      new Date().toISOString(),
  }
}

export const analyserPortefeuille360 = (
  records = [],
) =>
  records.map((record) =>
    analyserSituation360(record),
  )

export default analyserSituation360
