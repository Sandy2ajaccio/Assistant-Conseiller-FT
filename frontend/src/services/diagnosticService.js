import { REFERENTIEL_METIER } from '../data/referentielMetier'
import { getReferentielSection } from './referentielService'

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

const asString = (value) => String(value || '').trim()

const asArray = (value) => (Array.isArray(value) ? value : [])

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value))

const unique = (values) => [...new Set(values.filter(Boolean))]

const readSection = (sectionName) => REFERENTIEL_METIER[sectionName] || getReferentielSection(sectionName) || []

const findInSection = (sectionName, matcher) => readSection(sectionName).find(matcher) || null

const findByLabel = (sectionName, value) => {
  const normalizedValue = normalize(value)
  if (!normalizedValue) return null

  return findInSection(sectionName, (item) => normalize(item.libelle || item.nom) === normalizedValue)
}

const includesAny = (text, terms) => {
  const normalizedText = normalize(text)
  return terms.some((term) => normalizedText.includes(normalize(term)))
}

const readFirstString = (...values) => asString(values.find((value) => asString(value)))

const getAge = (dossier = {}) => {
  if (Number.isFinite(Number(dossier.age))) {
    return Number(dossier.age)
  }

  const dateNaissance = readFirstString(dossier.dateNaissance, dossier.date_naissance)
  if (!dateNaissance) return null

  const birthDate = new Date(dateNaissance)
  if (Number.isNaN(birthDate.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }

  return age >= 0 ? age : null
}

const getProjectText = (dossier = {}) =>
  readFirstString(
    dossier.projetProfessionnel,
    dossier.projet,
    dossier.situationProfessionnelle,
    dossier.situation,
    dossier.objectif,
  )

const getAutonomyHint = (dossier = {}) => readFirstString(dossier.autonomie, dossier.niveauAutonomie, dossier.autonomieNumerique)

const getExperienceText = (dossier = {}) =>
  readFirstString(dossier.experience, dossier.experiences, dossier.anneesExperience, dossier.annees_experience, dossier.parcours)

const getFormationText = (dossier = {}) => readFirstString(dossier.formation, dossier.niveauFormation, dossier.qualification)

const getFreinsDetectes = (dossier = {}, age = null) => {
  const freins = []
  const explicitFreins = asArray(dossier.freins)

  explicitFreins.forEach((item) => {
    const label = asString(item?.libelle || item?.nom || item?.message || item)
    if (label) freins.push(label)
  })

  const projectText = getProjectText(dossier)
  const mobilityText = readFirstString(dossier.mobilite, dossier.mobiliteDetaillee)
  const experienceText = getExperienceText(dossier)
  const formationText = getFormationText(dossier)
  const autonomyHint = getAutonomyHint(dossier)

  if (dossier.rsa) freins.push('RSA')
  if (dossier.are) freins.push('ARE')
  if (dossier.reconnaissanceTH) freins.push('Handicap')
  if (!readFirstString(dossier.projetProfessionnel, dossier.projet)) freins.push('Projet flou')
  if (!dossier.cvVisible) freins.push('Absence CV')
  if (normalize(dossier.rechercheEmploi).includes('faible')) freins.push('Recherche emploi')
  if (includesAny(mobilityText, ['limit', 'faible', 'complex', 'difficile', 'transports'])) freins.push('Mobilité')
  if (includesAny(projectText, ['flou', 'à définir', 'a definir', 'incertain', 'hesitation'])) freins.push('Projet professionnel à clarifier')
  if (includesAny(formationText, ['aucun', 'non', 'pas'])) freins.push('Formation non précisée')
  if (includesAny(autonomyHint, ['faible', 'limite', 'à renforcer', 'a renforcer'])) freins.push('Autonomie à renforcer')
  if (age !== null && age < 26 && !includesAny(dossier.contratEngagement, ['oui', 'actif'])) freins.push('Jeune sans cadre d accompagnement explicite')
  if (age !== null && age >= 50 && !experienceText) freins.push('Expérience à expliciter')
  if (Number(dossier.nombreFreins || 0) > 0) freins.push('Freins multiples')

  return unique(freins)
}

const getAtouts = (dossier = {}, age = null) => {
  const atouts = []
  const projectText = getProjectText(dossier)
  const experienceText = getExperienceText(dossier)

  if (dossier.dpaRealisee) atouts.push('DPA réalisée')
  if (dossier.premierEntretienRealise) atouts.push('Premier entretien réalisé')
  if (dossier.cvVisible) atouts.push('CV visible')
  if (normalize(dossier.rechercheEmploi).includes('active')) atouts.push("Recherche d'emploi active")
  if (asString(dossier.contratEngagement).toLowerCase() === 'oui') atouts.push("Contrat d'engagement actif")
  if (dossier.reconnaissanceTH) atouts.push('RQTH identifiée')
  if (age !== null && age >= 50) atouts.push('Expérience senior mobilisable')
  if (age !== null && age < 26) atouts.push('Public jeune mobilisable')
  if (experienceText) atouts.push('Expérience renseignée')
  if (getFormationText(dossier)) atouts.push('Formation renseignée')
  if (projectText && projectText.length >= 20) atouts.push('Projet renseigné')
  if (asArray(dossier.ateliers).length > 0) atouts.push('Ateliers déjà suivis')
  if (asArray(dossier.prestations).length > 0) atouts.push('Prestations déjà mobilisées')
  if (asArray(dossier.formations).length > 0) atouts.push('Formations déjà engagées')

  return unique(atouts)
}

const getProjectSignals = (dossier = {}) => {
  const projectText = getProjectText(dossier)
  const age = getAge(dossier)
  const categories = readSection('categoriesDE')
  const projets = readSection('projetsProfessionnels')
  const orientationLabels = readSection('orientations').map((item) => normalize(item.libelle))

  const knownProject = projets.find((item) => includesAny(projectText, [item.libelle, item.description])) || null
  const knownCategory = categories.find((item) => normalize(item.libelle) === normalize(dossier.categorie)) || null
  const knownOrientation = orientationLabels.find((label) => normalize(projectText) === label || includesAny(projectText, [label])) || ''

  return {
    age,
    projectText,
    hasProject: Boolean(projectText),
    projectLength: projectText.length,
    projectIsFlou: !projectText || includesAny(projectText, ['flou', 'à définir', 'a definir', 'incertain', 'hésitation', 'hesitation']),
    projectIsValidated: Boolean(knownProject) || projectText.length >= 25,
    projectIsFormation: includesAny(projectText, ['formation', 'qualif', 'prepa', 'prépa', 'aif', 'afc', 'vae']),
    projectIsCreation: includesAny(projectText, ['creation', 'création', 'entreprise', 'reprise', 'entrepreneur']),
    projectIsEmployment: includesAny(projectText, ['emploi', 'candidature', 'recrutement', 'poste', 'travail']),
    projectIsPmsmp: includesAny(projectText, ['pmsmp', 'immersion']),
    projectIsIae: includesAny(projectText, ['iae', 'siae', 'insertion']),
    projectIsReconversion: includesAny(projectText, ['reconversion', 'transition']),
    projectIsCadre: includesAny(projectText, ['cadre', 'management', 'direction']),
    projectIsSenior: age !== null && age >= 50,
    projectIsYoung: age !== null && age < 26,
    projectIsKnownCategory: Boolean(knownCategory),
    projectOrientation: knownOrientation,
  }
}

const getAutonomie = (dossier = {}, freinsDetectes = [], atouts = [], signals = {}) => {
  let score = 45

  if (dossier.cvVisible) score += 12
  if (normalize(dossier.rechercheEmploi).includes('active')) score += 10
  if (dossier.dpaRealisee) score += 8
  if (dossier.premierEntretienRealise) score += 6
  if (asString(dossier.contratEngagement).toLowerCase() === 'oui') score += 5
  if (signals.projectIsValidated) score += 5
  if (signals.projectIsKnownCategory) score += 3
  if (atouts.length >= 4) score += 5
  if (asArray(dossier.ateliers).length > 0) score += 3
  if (asArray(dossier.prestations).length > 0) score += 2

  if (freinsDetectes.some((item) => includesAny(item, ['absence cv']))) score -= 10
  if (freinsDetectes.some((item) => includesAny(item, ['autonomie à renforcer', 'autonomie'])) && !dossier.cvVisible) score -= 8
  if (freinsDetectes.some((item) => includesAny(item, ['mobilité']))) score -= 7
  if (freinsDetectes.some((item) => includesAny(item, ['freins multiples']))) score -= 8
  if (freinsDetectes.some((item) => includesAny(item, ['sante', 'handicap']))) score -= 10
  if (signals.projectIsFlou) score -= 8
  if (signals.projectIsYoung && !dossier.premierEntretienRealise) score -= 3

  return clamp(score)
}

const getDistanceEmploi = (dossier = {}, freinsDetectes = [], autonomie = 0, signals = {}) => {
  let score = 35

  if (signals.projectIsFlou) score += 20
  if (!signals.hasProject) score += 15
  if (!dossier.cvVisible) score += 12
  if (normalize(dossier.rechercheEmploi).includes('faible')) score += 10
  if (!normalize(dossier.rechercheEmploi).includes('active') && !normalize(dossier.rechercheEmploi).includes('en cours')) score += 4
  if (Number(dossier.nombreFreins || 0) >= 3) score += 10
  if (freinsDetectes.some((item) => includesAny(item, ['mobilité']))) score += 8
  if (freinsDetectes.some((item) => includesAny(item, ['logement']))) score += 6
  if (freinsDetectes.some((item) => includesAny(item, ['sante', 'handicap']))) score += 10
  if (signals.projectIsFormation) score += 2
  if (signals.projectIsIae) score += 5
  if (signals.projectIsCreation) score += 4
  if (signals.projectIsYoung && !asString(dossier.contratEngagement)) score += 4

  if (autonomie >= 70) score -= 10
  if (autonomie >= 55) score -= 5
  if (dossier.dpaRealisee) score -= 5
  if (dossier.premierEntretienRealise) score -= 4
  if (signals.projectIsValidated) score -= 6

  return clamp(score)
}

const getMaturiteProjet = (dossier = {}, signals = {}) => {
  const projectText = signals.projectText
  let score = 10

  if (signals.hasProject) score += 20
  if (projectText.length >= 20) score += 10
  if (projectText.length >= 40) score += 10
  if (signals.projectIsValidated) score += 15
  if (signals.projectIsFormation || signals.projectIsCreation || signals.projectIsEmployment) score += 10
  if (signals.projectIsPmsmp) score += 8
  if (signals.projectIsIae) score += 8
  if (signals.projectIsReconversion) score += 6
  if (signals.projectIsCadre) score += 4
  if (dossier.dpaRealisee) score += 8
  if (dossier.premierEntretienRealise) score += 8
  if (asArray(dossier.formations).length > 0) score += 5
  if (asArray(dossier.prestations).length > 0) score += 3
  if (asArray(dossier.ateliers).length > 0) score += 3
  if (signals.projectOrientation) score += 4

  if (signals.projectIsFlou) score -= 15
  if (!signals.hasProject) score -= 10
  if (includesAny(getExperienceText(dossier), ['non', 'aucune'])) score -= 2

  return clamp(score)
}

const getEmployabilite = ({ autonomie, distanceEmploi, maturiteProjet, freinsDetectes, signals, dossier }) => {
  let score = Math.round((autonomie * 0.35) + ((100 - distanceEmploi) * 0.3) + (maturiteProjet * 0.35))

  if (signals.projectIsValidated) score += 5
  if (signals.projectIsEmployment) score += 4
  if (signals.projectIsFormation) score += 2
  if (dossier.cvVisible) score += 3
  if (normalize(dossier.rechercheEmploi).includes('active')) score += 3

  if (freinsDetectes.some((item) => includesAny(item, ['sante', 'handicap']))) score -= 8
  if (freinsDetectes.some((item) => includesAny(item, ['freins multiples']))) score -= 5
  if (freinsDetectes.some((item) => includesAny(item, ['mobilité']))) score -= 4
  if (freinsDetectes.some((item) => includesAny(item, ['logement']))) score -= 3

  return clamp(score)
}

const getUrgence = ({ freinsDetectes, autonomie, distanceEmploi, maturiteProjet, dossier, signals }) => {
  const hasCriticalFrein = freinsDetectes.some((item) =>
    includesAny(item, ['sante', 'handicap', 'mobilité', 'logement', 'freins multiples', 'absence cv']),
  )

  if (hasCriticalFrein && autonomie < 40) return 'critique'
  if ((distanceEmploi >= 75 && maturiteProjet < 40) || (!signals.hasProject && autonomie < 45)) return 'haute'
  if (distanceEmploi >= 60 || maturiteProjet < 50 || !dossier.cvVisible) return 'moyenne'
  return 'faible'
}

const getScoreGlobal = ({ autonomie, distanceEmploi, maturiteProjet, employabilite, freinsDetectes, atouts }) => {
  let score = Math.round((autonomie * 0.3) + ((100 - distanceEmploi) * 0.2) + (maturiteProjet * 0.25) + (employabilite * 0.25))

  score += Math.min(8, atouts.length * 2)
  score -= Math.min(12, freinsDetectes.length * 2)

  return clamp(score)
}

const buildVigilance = ({ dossier, freinsDetectes, autonomie, distanceEmploi, maturiteProjet, signals }) => {
  const vigilance = []

  if (!dossier.dpaRealisee) vigilance.push('DPA à réaliser ou à actualiser.')
  if (!dossier.cvVisible) vigilance.push('CV non visible.')
  if (!signals.hasProject) vigilance.push('Projet professionnel à clarifier.')
  if (signals.projectIsFlou) vigilance.push('Projet encore flou ou trop peu formalisé.')
  if (normalize(dossier.rechercheEmploi).includes('faible')) vigilance.push("Dynamique de recherche d'emploi à renforcer.")
  if (freinsDetectes.some((item) => includesAny(item, ['mobilité']))) vigilance.push('Frein de mobilité à traiter.')
  if (freinsDetectes.some((item) => includesAny(item, ['sante', 'handicap']))) vigilance.push('Situation de santé ou de handicap à sécuriser.')
  if (freinsDetectes.length >= 3) vigilance.push('Freins multiples à coordonner.')
  if (autonomie < 40) vigilance.push('Autonomie à renforcer.')
  if (distanceEmploi >= 70) vigilance.push('Distance à l emploi importante.')
  if (maturiteProjet < 40) vigilance.push('Projet peu mature.')
  if (signals.projectIsYoung && !asString(dossier.contratEngagement)) vigilance.push('Cadre d accompagnement jeune à formaliser.')
  if (signals.projectIsSenior) vigilance.push('Valoriser l expérience et adapter la stratégie de candidature.')

  return unique(vigilance)
}

const pushIfPresent = (items, value) => {
  if (value) items.push(value)
}

const buildRecommendations = ({ dossier, signals, freinsDetectes, autonomie, distanceEmploi, maturiteProjet }) => {
  const recommendations = []

  const projetFlou = findByLabel('projetsProfessionnels', 'Projet flou')
  const activProjet = findByLabel('prestations', "Activ'Projet")
  const atelierCV = findByLabel('ateliers', 'Création CV')
  const atelierMarché = findByLabel('ateliers', 'Mon Marché du Travail')
  const atelier360 = findByLabel('ateliers', 'Atelier 360')
  const atelier360Senior = findByLabel('ateliers', 'Atelier 360 Seniors')
  const atelierPix = findByLabel('ateliers', 'PIX Emploi')
  const prepaCompetences = findByLabel('prestations', 'Prépa Compétences')
  const preparationFormation = findByLabel('prestations', 'Préparation à la formation')
  const aif = findByLabel('prestations', 'AIF')
  const afc = findByLabel('prestations', 'AFC')
  const pmsmpPrestation = findByLabel('prestations', 'PMSMP')
  const acquisitionImmersion = findByLabel('prestations', 'Immersion professionnelle PMSMP')
  const capEmploi = findByLabel('partenaires', 'Cap Emploi Corse')
  const missionLocale = findByLabel('partenaires', 'Mission Locale Ajaccio')
  const afpa = findByLabel('partenaires', 'AFPA Corse')
  const bge = findByLabel('partenaires', 'BGE Corse')
  const cibc = findByLabel('partenaires', 'CIBC Corse')
  const cidff = findByLabel('partenaires', 'CIDFF Corse-du-Sud')
  const carsat = findByLabel('partenaires', 'CARSAT Corse')
  const caf = findByLabel('partenaires', 'CAF Corse-du-Sud')
  const cpam = findByLabel('partenaires', 'CPAM Corse-du-Sud')
  const mdph = findByLabel('partenaires', 'MDPH Corse')
  const collectivite = findByLabel('partenaires', 'Collectivité de Corse')
  const cci = findByLabel('partenaires', "Chambre de Commerce et d'Industrie de Corse")
  const cma = findByLabel('partenaires', "Chambre de Métiers et de l'Artisanat de Corse")
  const structuresIAE = findByLabel('partenaires', 'Structures IAE Corse-du-Sud')
  const orientationPP = findByLabel('orientations', 'PP')
  const orientationTH = findByLabel('orientations', 'TH')
  const orientationCEJ = findByLabel('orientations', 'CEJ')
  const orientationIAE = findByLabel('orientations', 'IAE')
  const parcoursFormation = findByLabel('parcours', 'Formation')
  const parcoursGlobal = findByLabel('parcours', 'Accompagnement global')
  const parcoursPMSMP = findByLabel('parcours', 'PMSMP')
  const parcoursIAE = findByLabel('parcours', 'IAE')
  const remuneration = findByLabel('remunerationFormation', 'Rémunération formation') || findByLabel('remunerationFormation', 'Remuneration formation')

  if (signals.projectIsFlou || !signals.hasProject) {
    pushIfPresent(recommendations, projetFlou?.libelle)
    pushIfPresent(recommendations, activProjet?.libelle)
    pushIfPresent(recommendations, atelier360?.libelle)
    pushIfPresent(recommendations, cibc?.libelle)
    if (signals.projectIsYoung) pushIfPresent(recommendations, missionLocale?.libelle)
  }

  if (signals.projectIsFormation || freinsDetectes.some((item) => includesAny(item, ['compétences', 'competences', 'formation', 'qualification', 'français', 'francais']))) {
    pushIfPresent(recommendations, prepaCompetences?.libelle)
    pushIfPresent(recommendations, preparationFormation?.libelle)
    pushIfPresent(recommendations, afpa?.libelle)
    pushIfPresent(recommendations, aif?.libelle)
    pushIfPresent(recommendations, afc?.libelle)
    pushIfPresent(recommendations, remuneration?.libelle)
    pushIfPresent(recommendations, parcoursFormation?.libelle)
  }

  if (signals.projectIsEmployment || normalize(dossier.rechercheEmploi).includes('active') || (!dossier.cvVisible && distanceEmploi >= 50)) {
    pushIfPresent(recommendations, atelierCV?.libelle)
    pushIfPresent(recommendations, atelierMarché?.libelle)
    pushIfPresent(recommendations, findByLabel('prestations', "Techniques de recherche d'emploi")?.libelle)
    pushIfPresent(recommendations, missionLocale?.libelle)
  }

  if (freinsDetectes.some((item) => includesAny(item, ['sante', 'handicap']))) {
    pushIfPresent(recommendations, capEmploi?.libelle)
    pushIfPresent(recommendations, mdph?.libelle)
    pushIfPresent(recommendations, orientationTH?.libelle)
    pushIfPresent(recommendations, findByLabel('prestations', 'Emploi accompagné')?.libelle)
    pushIfPresent(recommendations, findByLabel('prestations', 'Prestations Cap Emploi')?.libelle)
  }

  if (freinsDetectes.some((item) => includesAny(item, ['mobilité']))) {
    pushIfPresent(recommendations, collectivite?.libelle)
    pushIfPresent(recommendations, findByLabel('prestations', 'Aide à la mobilité')?.libelle)
  }

  if (freinsDetectes.some((item) => includesAny(item, ['logement', 'finances', 'social', 'freins multiples']))) {
    pushIfPresent(recommendations, parcoursGlobal?.libelle)
    pushIfPresent(recommendations, cidff?.libelle)
    pushIfPresent(recommendations, caf?.libelle)
    pushIfPresent(recommendations, cpam?.libelle)
    pushIfPresent(recommendations, collectivite?.libelle)
  }

  if (signals.projectIsCreation) {
    pushIfPresent(recommendations, bge?.libelle)
    pushIfPresent(recommendations, cci?.libelle)
    pushIfPresent(recommendations, cma?.libelle)
    pushIfPresent(recommendations, findByLabel('prestations', "Activ'Créa")?.libelle)
  }

  if (signals.projectIsPmsmp || (maturiteProjet >= 50 && distanceEmploi >= 45)) {
    pushIfPresent(recommendations, parcoursPMSMP?.libelle)
    pushIfPresent(recommendations, pmsmpPrestation?.libelle)
    pushIfPresent(recommendations, acquisitionImmersion?.libelle)
  }

  if (signals.projectIsIae || freinsDetectes.some((item) => includesAny(item, ['iae', 'insertion']))) {
    pushIfPresent(recommendations, orientationIAE?.libelle)
    pushIfPresent(recommendations, parcoursIAE?.libelle)
    pushIfPresent(recommendations, structuresIAE?.libelle)
    pushIfPresent(recommendations, findByLabel('prestations', 'PASS IAE')?.libelle)
  }

  if (signals.projectIsSenior || (getAge(dossier) !== null && getAge(dossier) >= 50)) {
    pushIfPresent(recommendations, carsat?.libelle)
    pushIfPresent(recommendations, atelier360Senior?.libelle)
    pushIfPresent(recommendations, findByLabel('prestations', 'VAE')?.libelle)
    pushIfPresent(recommendations, cibc?.libelle)
  }

  if (signals.projectIsYoung) {
    pushIfPresent(recommendations, missionLocale?.libelle)
    pushIfPresent(recommendations, orientationCEJ?.libelle)
    pushIfPresent(recommendations, findByLabel('prestations', 'CEJ')?.libelle)
  }

  if (autonomie < 40) {
    pushIfPresent(recommendations, atelierPix?.libelle)
    pushIfPresent(recommendations, findByLabel('prestations', 'Pix Emploi')?.libelle)
  }

  if (distanceEmploi < 40 && maturiteProjet >= 60) {
    pushIfPresent(recommendations, findByLabel('orientations', 'EM')?.libelle)
  }

  return unique(recommendations)
}

const detectEmployability = ({ autonomie, distanceEmploi, maturiteProjet, freinsDetectes, atouts }) => {
  const favorable = autonomie >= 70 && distanceEmploi <= 35 && maturiteProjet >= 65
  const medium = autonomie >= 50 && distanceEmploi <= 60 && maturiteProjet >= 45
  const constrained = freinsDetectes.length >= 3 || distanceEmploi >= 70 || maturiteProjet < 35

  if (favorable && freinsDetectes.length <= 1) return 'forte'
  if (constrained) return 'faible'
  if (medium || atouts.length >= 3) return 'moyenne'
  return 'moyenne'
}

export const analyseDiagnostic = (dossier = {}) => {
  const age = getAge(dossier)
  const signals = getProjectSignals(dossier)
  const freinsDetectes = getFreinsDetectes(dossier, age)
  const atouts = getAtouts(dossier, age)

  const autonomie = getAutonomie(dossier, freinsDetectes, atouts, signals)
  const distanceEmploi = getDistanceEmploi(dossier, freinsDetectes, autonomie, signals)
  const maturiteProjet = getMaturiteProjet(dossier, signals)
  const employabilite = detectEmployability({ autonomie, distanceEmploi, maturiteProjet, freinsDetectes, atouts })
  const urgence = getUrgence({ freinsDetectes, autonomie, distanceEmploi, maturiteProjet, dossier, signals })
  const scoreGlobal = getScoreGlobal({ autonomie, distanceEmploi, maturiteProjet, employabilite: employabilite === 'forte' ? 85 : employabilite === 'moyenne' ? 60 : 35, freinsDetectes, atouts })
  const vigilance = buildVigilance({ dossier, freinsDetectes, autonomie, distanceEmploi, maturiteProjet, signals })
  const recommandationsPrioritaires = buildRecommendations({ dossier, signals, freinsDetectes, autonomie, distanceEmploi, maturiteProjet })

  return {
    autonomie,
    distanceEmploi,
    maturiteProjet,
    freinsDetectes,
    atouts,
    vigilance,
    urgence,
    employabilite,
    recommandationsPrioritaires,
    scoreGlobal,
  }
}

export default analyseDiagnostic