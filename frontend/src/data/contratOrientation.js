export const DEFAULT_TYPE_ENTRETIEN = 'dpa'

export const ENTRETIEN_TYPES = [
  {
    value: 'dpa',
    label: 'Diagnostic préalable à l’accompagnement (DPA)',
    duree: '60 min',
    secondes: 60 * 60,
    famille: 'accompagnement',
  },
  {
    value: 'edo',
    label: 'Entretien d’orientation (EDO)',
    duree: '20 min (repère)',
    secondes: 20 * 60,
    famille: 'orientation',
    confirmationInterne: 'Confirmer la modalité et la durée dans MAP et les procédures internes en vigueur.',
  },
  {
    value: 'suivi-physique',
    label: 'Entretien de suivi',
    duree: '30 min',
    secondes: 30 * 60,
    famille: 'suivi',
  },
  {
    value: 'telephonique',
    label: 'Autre entretien téléphonique',
    duree: '15-20 min',
    secondes: 20 * 60,
    minimumRepereMinutes: 15,
    famille: 'suivi',
  },
]

const TYPE_ALIASES = {
  'premier-physique': 'dpa',
  eda: 'dpa',
}

export const normaliserTypeEntretien = (value) => {
  const type = TYPE_ALIASES[value] || value
  return ENTRETIEN_TYPES.some((item) => item.value === type)
    ? type
    : DEFAULT_TYPE_ENTRETIEN
}

export const getTypeEntretien = (value) => {
  const type = normaliserTypeEntretien(value)
  return ENTRETIEN_TYPES.find((item) => item.value === type) || ENTRETIEN_TYPES[0]
}

export const estDPA = (value) =>
  normaliserTypeEntretien(value) === 'dpa'

// Ancien nom conservé par compatibilité (données ou code externe déjà en place).
export const estPremierEntretienAccompagnement = estDPA

export const estEntretienOrientation = (value) =>
  normaliserTypeEntretien(value) === 'edo'

export const ORGANISMES_ORIENTATION = [
  'France Travail',
  'Cap emploi',
  'Mission locale',
  'Conseil départemental / Collectivité',
  'Autre organisme',
]

export const PARCOURS_ORIENTATION = [
  'Parcours professionnel',
  'Parcours socio-professionnel',
  'Parcours social',
]

export const DECISIONS_ORIENTATION = [
  { value: 'a-confirmer', label: 'À confirmer' },
  { value: 'acceptee', label: 'Proposition acceptée' },
  { value: 'refusee-remplacee', label: 'Proposition refusée et remplacée' },
  { value: 'definie-manuellement', label: 'Orientation définie par le conseiller' },
]

export const MOTIFS_REFUS_ORIENTATION = [
  'Déclaration inexacte',
  'Situation non couverte',
  'Appréciation différente',
  'Capacité d’accueil insuffisante',
  'Autre',
]

export const DEFAULT_ORIENTATION_RESEAU = {
  decision: 'a-confirmer',
  organisme: '',
  parcours: '',
  structure: '',
  motifRefus: '',
  commentaire: '',
  validationHumaine: false,
}

export const normaliserOrientationReseau = (value = {}) => ({
  ...DEFAULT_ORIENTATION_RESEAU,
  ...value,
  validationHumaine: value?.validationHumaine === true,
})

export const orientationReseauComplete = (value = {}) => {
  const orientation = normaliserOrientationReseau(value)
  const decisionRendue = orientation.decision !== 'a-confirmer'
  const cibleRenseignee = Boolean(
    orientation.organisme.trim()
    && orientation.parcours.trim()
    && orientation.structure.trim(),
  )
  const refusDocumente = orientation.decision !== 'refusee-remplacee'
    || Boolean(orientation.motifRefus.trim())

  return decisionRendue
    && cibleRenseignee
    && refusDocumente
    && orientation.validationHumaine
}

export const DEFAULT_CONTRAT_ENGAGEMENT_DETAILS = {
  organismeReferent: '',
  intensiteHebdomadaire: '',
  dateSignature: '',
  dateActualisation: '',
}

export const normaliserContratEngagementDetails = (value = {}) => ({
  ...DEFAULT_CONTRAT_ENGAGEMENT_DETAILS,
  ...value,
  intensiteHebdomadaire: value?.intensiteHebdomadaire === 0
    ? '0'
    : String(value?.intensiteHebdomadaire || '').trim(),
})

