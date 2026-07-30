import { IAE_REPERES_INTERNES, IAE_SOURCE_INTERNE, structuresIAECorse } from '../data/iaeCorse.js'

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()

const asArray = (value) => (Array.isArray(value) ? value : [])

const getContextText = (dossier = {}) => normalize([
  dossier.situation,
  dossier.situationAdministrative,
  dossier.situationPersonnelle,
  dossier.parcoursProfessionnel,
  dossier.projet,
  dossier.projetProfessionnel,
  dossier.rechercheEmploi,
  dossier.besoin,
  dossier.objectif,
  dossier.formation,
  dossier.capaciteAgir,
  ...asArray(dossier.freins).map((item) => item?.libelle || item?.nom || item),
].filter(Boolean).join(' '))

const includesAny = (text, terms) => terms.some((term) => text.includes(normalize(term)))

const getAge = (dossier = {}, text = '') => {
  if (Number.isFinite(Number(dossier.age))) return Number(dossier.age)
  const match = text.match(/\b(1[6-9]|[2-8][0-9])\s*ans\b/)
  return match ? Number(match[1]) : null
}

const scoreStructure = (structure, text) => structure.motsCles.reduce(
  (score, motCle) => score + (text.includes(normalize(motCle)) ? 3 : 0),
  0,
)

const selectStructures = (text) => {
  const ranked = structuresIAECorse
    .map((structure, index) => ({ structure, index, score: scoreStructure(structure, text) }))
    .sort((left, right) => right.score - left.score || left.index - right.index)

  if (ranked[0]?.score > 0) {
    return ranked.filter((item) => item.score > 0).slice(0, 4).map((item) => item.structure)
  }

  const defaultIds = new Set(['iae-iniziativa', 'iae-visaltis', 'iae-ergos', 'iae-citt'])
  return structuresIAECorse.filter((structure) => defaultIds.has(structure.id))
}

export const analyserPisteIAE = (dossier = {}) => {
  const text = getContextText(dossier)
  const age = getAge(dossier, text)
  const freins = asArray(dossier.freins)
  const rsa = Boolean(dossier.rsa) || /\b(?:rsa|brsa)\b/.test(text)
  const ass = Boolean(dossier.ass)
    || includesAny(text, ['allocation spécifique de solidarité', 'allocation specifique de solidarite'])
    || /\bass\b/.test(text)
  const areFragile = includesAny(text, ['are minimale', 'are faible', 'fin de droits', 'fin de droit'])
  const deld = includesAny(text, ['deld', 'demandeur emploi longue duree', 'demandeur d emploi de longue duree', 'chomage longue duree'])
  const rqth = Boolean(dossier.reconnaissanceTH) || includesAny(text, ['rqth', 'travailleur handicape', 'reconnaissance travailleur handicape'])
  const senior = (age !== null && age >= 50) || includesAny(text, ['senior'])
  const jeunePeuQualifie = (
    ((age !== null && age < 26) || includesAny(text, ['jeune']))
    && includesAny(text, ['sans diplome', 'peu qualifie', 'non qualifie', 'aucune qualification'])
  )
  const creationIndependanteFragile = includesAny(text, [
    'activite independante creee trop vite',
    'activite non salariee a developper',
    'micro-entreprise avec un accompagnement',
    'micro entreprise avec un accompagnement',
  ])
  const explicitIAE = includesAny(text, ['iae', 'siae', 'insertion par l activite economique', 'chantier d insertion', 'entreprise d insertion'])
  const sansEmploiExplicite = includesAny(text, ['sans emploi', 'sans activite', 'demandeur d emploi', 'recherche d emploi'])
  const difficultesInsertion = freins.length >= 2 || includesAny(text, [
    'difficultes d insertion',
    'difficulte d insertion',
    'freins multiples',
    'remobilisation',
    'accompagnement renforce',
    'capacite a agir a consolider',
    'capacite a agir limitee',
  ])

  const retraiteLiquidee = includesAny(text, ['retraite liquidee', 'retraite liquidée', 'percoit sa retraite', 'perçoit sa retraite', 'beneficie de sa retraite', 'bénéficie de sa retraite'])
  const activiteEnCours = (
    includesAny(text, ['emploi en cours', 'contrat en cours', 'travaille actuellement', 'activite salariee en cours', 'activité salariée en cours'])
    && !sansEmploiExplicite
  )

  const motifs = [
    explicitIAE ? 'Une orientation IAE ou SIAE est explicitement évoquée.' : null,
    rsa ? 'Bénéficiaire du RSA mentionné.' : null,
    ass ? 'Bénéficiaire de l’ASS mentionné.' : null,
    areFragile ? 'ARE faible ou fin de droits mentionnée.' : null,
    deld ? 'Chômage ou inscription de longue durée mentionné.' : null,
    rqth ? 'RQTH ou situation de handicap mentionnée.' : null,
    senior ? 'Situation senior mentionnée.' : null,
    jeunePeuQualifie ? 'Jeune peu qualifié mentionné.' : null,
    creationIndependanteFragile ? 'Activité indépendante récemment créée nécessitant un accompagnement au développement.' : null,
    difficultesInsertion ? 'Plusieurs difficultés d’insertion ou un besoin de remobilisation sont identifiés.' : null,
  ].filter(Boolean)

  const blocages = [
    retraiteLiquidee ? 'Une retraite liquidée est mentionnée.' : null,
    activiteEnCours ? 'Une activité salariée en cours est mentionnée.' : null,
  ].filter(Boolean)

  const pertinente = blocages.length === 0 && (
    explicitIAE
    || creationIndependanteFragile
    || (sansEmploiExplicite && motifs.length >= 2)
    || ((rsa || ass || areFragile || deld || rqth || senior || jeunePeuQualifie) && difficultesInsertion)
  )

  return {
    pertinente,
    niveau: explicitIAE || motifs.length >= 4 ? 'fort' : pertinente ? 'à confirmer' : 'non retenu',
    motifs,
    blocages,
    propositions: pertinente ? selectStructures(text) : [],
    apportsParcours: IAE_REPERES_INTERNES.apportsParcours,
    pointsAVerifier: [
      'Confirmer avec la personne son intérêt pour un parcours d’insertion par l’activité économique.',
      'Vérifier l’éligibilité et le circuit de prescription dans les procédures internes France Travail.',
      'Vérifier les postes ouverts, le secteur, la localisation, les horaires et la mobilité auprès de la structure.',
      'Ne pas reprendre automatiquement les durées de contrat du support interne sans confirmation actualisée.',
    ],
    confirmationInterne: IAE_REPERES_INTERNES.verificationInterne,
    sourceInterne: IAE_SOURCE_INTERNE,
  }
}

export default analyserPisteIAE
