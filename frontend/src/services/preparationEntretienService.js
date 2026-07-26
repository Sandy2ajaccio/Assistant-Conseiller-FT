import { listStoredDossiers } from './dossierLoaderService'

const asArray = (value) => (Array.isArray(value) ? value : [])
const asString = (value) => String(value || '').trim()

const FREIN_LABELS = {
  mobilitePermis: 'Mobilité - permis',
  mobiliteVehicule: 'Mobilité - véhicule',
  mobiliteTransport: 'Mobilité - transport',
  mobiliteCarburant: 'Mobilité - carburant',
  logementHebergement: 'Logement - hébergement',
  logementExpulsion: 'Logement - expulsion',
  logementDemenagement: 'Logement - déménagement',
  santeMaladie: 'Santé - maladie',
  santeHandicap: 'Santé - handicap',
  santeAddiction: 'Santé - addiction',
  familleGardeEnfant: "Vie familiale - garde d'enfant",
  familleAidant: 'Vie familiale - aidant',
  familleParentIsole: 'Vie familiale - parent isolé',
  numeriqueSansOrdinateur: 'Numérique - pas d\'ordinateur',
  numeriqueSansInternet: 'Numérique - pas d\'internet',
  numeriqueDifficultes: 'Numérique - difficultés',
  financierEndettement: 'Financier - endettement',
  financierAbsenceRessources: 'Financier - absence de ressources',
  financierBudgetInsuffisant: 'Financier - budget insuffisant',
  administratifJustice: 'Administratif - justice',
  administratifDroitsAttente: 'Administratif - droits en attente',
  administratifSituation: 'Administratif - situation administrative',
}

const DECISION_LABELS = {
  poursuiteAccompagnement: "Poursuivre l'accompagnement",
  demandeAffectation: "Demande d'affectation",
  prescriptionPrestation: 'Prescription de prestation',
  prescriptionAtelier: "Prescription d'atelier",
  orientationPartenaire: 'Orientation partenaire',
  entreeFormation: 'Entrée en formation',
  contratEngagement: "Mise à jour du contrat d'engagement",
  actualisationProjet: 'Actualisation du projet professionnel',
  rechercheEmploi: "Appui à la recherche d'emploi",
  creationEntreprise: "Accompagnement à la création d'entreprise",
  iae: 'Orientation IAE',
  leveeFreins: 'Plan de levée des freins',
}

const normalizeList = (value) =>
  asArray(value)
    .map((item) => {
      if (item && typeof item === 'object') {
        return asString(item.libelle || item.nom || item.message)
      }
      return asString(item)
    })
    .filter(Boolean)

const unique = (items) => [...new Set(items.filter(Boolean))]

const getLatestEntretien = (dossier = {}) => asArray(dossier.historiqueEntretiens)[0] || null

const getDerniereSynthese = (dossier = {}) => {
  if (asString(dossier.synthese?.contenu)) return asString(dossier.synthese.contenu)
  if (asString(dossier.syntheseEntretien)) return asString(dossier.syntheseEntretien)
  return 'Non renseignée'
}

const getDerniereMap = (dossier = {}, entretien = null) => {
  if (asString(entretien?.snapshot?.mapTexte)) return asString(entretien.snapshot.mapTexte)
  if (asString(dossier.mapTexte)) return asString(dossier.mapTexte)
  if (asString(dossier.simulateurDecision?.map)) return asString(dossier.simulateurDecision.map)
  return 'Non renseignée'
}

const getFreinsOuverts = (dossier = {}) => {
  const freins = dossier.freins || {}
  return Object.entries(FREIN_LABELS)
    .filter(([key]) => Boolean(freins[key]))
    .map(([, label]) => label)
}

const getAtoutsPrincipaux = (dossier = {}, entretien = null) => {
  const atouts = []
  if (dossier.dpaRealisee) atouts.push('DPA réalisée')
  if (dossier.premierEntretienRealise) atouts.push('Premier entretien déjà réalisé')
  if (dossier.cvVisible) atouts.push('CV visible')
  if (asString(dossier.rechercheEmploi).toLowerCase() === 'active') atouts.push("Recherche d'emploi active")
  if (Boolean(dossier.droits?.rsa)) atouts.push('Droit RSA identifié')
  if (Boolean(dossier.droits?.rqth)) atouts.push('RQTH identifiée')
  if (asString(entretien?.decisionPrincipale)) atouts.push(`Décision récente: ${asString(entretien.decisionPrincipale)}`)
  return unique(atouts)
}

const getPointsVigilance = (dossier = {}, freinsOuverts = []) => {
  const points = []
  if (freinsOuverts.length > 0) {
    points.push(`${freinsOuverts.length} frein(s) encore ouvert(s).`)
  }

  if (!dossier.dpaRealisee) points.push('DPA à réaliser ou à actualiser.')
  if (!dossier.cvVisible) points.push('CV non visible.')
  if (asString(dossier.rechercheEmploi).toLowerCase() === 'faible') points.push("Dynamique de recherche d'emploi à renforcer.")

  const alertesAnalyse = normalizeList(dossier.analyse?.alertes)
  points.push(...alertesAnalyse)

  return unique(points)
}

const getQuestionsSuggerees = (dossier = {}, freinsOuverts = []) => {
  const questionsAnalyse = normalizeList(dossier.analyse?.questions)
  const questionsBase = [
    'Quels objectifs concrets sont prioritaires avant le prochain entretien ?',
    'Quels freins bloquent encore les démarches prévues ?',
  ]

  if (freinsOuverts.some((item) => item.toLowerCase().includes('mobilité'))) {
    questionsBase.push('Quelles solutions mobilité sont mobilisables immédiatement ?')
  }

  if (freinsOuverts.some((item) => item.toLowerCase().includes('numérique'))) {
    questionsBase.push('Quel niveau d\'autonomie numérique reste à sécuriser ?')
  }

  if (!dossier.cvVisible) {
    questionsBase.push('Quelles actions pour rendre le CV visible avant le prochain point ?')
  }

  return unique([...questionsAnalyse, ...questionsBase])
}

const getActionsConseiller = (dossier = {}, entretien = null) => {
  const actions = []
  if (asString(entretien?.decisionPrincipale)) {
    actions.push(asString(entretien.decisionPrincipale))
  }

  const decisions = dossier.decisions || {}
  Object.entries(DECISION_LABELS).forEach(([key, label]) => {
    if (decisions[key]) actions.push(label)
  })

  return unique(actions)
}

const getActionsDemandeur = (dossier = {}, entretien = null) => {
  const actions = []
  const fromSnapshot = normalizeList(entretien?.snapshot?.actionsDemandeur)
  actions.push(...fromSnapshot)

  if (asString(dossier.rechercheEmploi).toLowerCase() !== 'absente') {
    actions.push("Poursuivre les démarches de recherche d'emploi")
  }

  const convocations = normalizeList(dossier.convocations)
  if (convocations.length > 0) {
    actions.push(`Honorier les convocations: ${convocations.join(' | ')}`)
  }

  return unique(actions)
}

export const buildPreparationEntretienFiche = (dossier = {}) => {
  const entretien = getLatestEntretien(dossier)
  const freinsOuverts = getFreinsOuverts(dossier)
  const atoutsPrincipaux = getAtoutsPrincipaux(dossier, entretien)
  const pointsVigilance = getPointsVigilance(dossier, freinsOuverts)

  return {
    identifiantFt: asString(dossier.identifiant || dossier.demandeur?.identifiant) || 'Non renseigné',
    typeEntretien: asString(dossier.typeEntretien || entretien?.typeEntretien) || 'Non renseigné',
    dateDernierEntretien: asString(entretien?.date) || 'Non renseignée',
    derniereSynthese: getDerniereSynthese(dossier),
    derniereMap: getDerniereMap(dossier, entretien),
    dernieresActionsConseiller: getActionsConseiller(dossier, entretien),
    dernieresActionsDemandeur: getActionsDemandeur(dossier, entretien),
    prestationsEnCours: unique([
      ...normalizeList(dossier.prestations),
      asString(dossier.prestationChoisie),
      ...normalizeList(entretien?.prestations),
    ]),
    partenairesMobilises: unique([
      ...normalizeList(entretien?.partenaires),
      asString(dossier.partenaireChoisi),
      ...normalizeList(dossier.analyse?.partenaires),
    ]),
    freinsOuverts,
    atoutsPrincipaux,
    pointsVigilance,
    questionsSuggerees: getQuestionsSuggerees(dossier, freinsOuverts),
  }
}

export const listPreparationEntretienDossiers = () => {
  const dossiers = listStoredDossiers()
    .filter((item) => item.dossier && item.identifiant)
    .map((item) => ({
      identifiant: item.identifiant,
      updatedAt: item.dossier?.versionnement?.updatedAt || item.payload?.updatedAt || '',
    }))

  dossiers.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
  return dossiers
}
