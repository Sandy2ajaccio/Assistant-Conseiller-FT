const asString = (value) => String(value || '').trim()

const asArray = (value) => (Array.isArray(value) ? value : [])

const unique = (items) => [...new Set(items.filter(Boolean))]

const formatList = (items, fallback = 'Aucun élément renseigné') => {
  const values = unique(asArray(items).map((item) => asString(item)).filter(Boolean))
  return values.length > 0 ? values.join(', ') : fallback
}

const getIdentiteResume = (dossier = {}) => {
  const identifiant = asString(dossier.identifiant || dossier.id)
  const age = Number.isFinite(Number(dossier.age))
    ? `${Number(dossier.age)} ans`
    : asString(dossier.dateNaissance || dossier.date_naissance)
      ? 'âge à calculer à partir de la date de naissance'
      : ''
  const portefeuille = asString(dossier.portefeuille)
  const categorie = asString(dossier.categorie)
  const projet = asString(dossier.projetProfessionnel || dossier.projet)

  const segments = [
    identifiant ? `Dossier ${identifiant}` : 'Dossier conseiller',
    categorie ? `catégorie ${categorie}` : '',
    portefeuille ? `portefeuille ${portefeuille}` : '',
    age ? age : '',
    projet ? `projet : ${projet}` : 'projet à préciser',
  ].filter(Boolean)

  return segments.join(' - ')
}

const getDiagnosticHighlights = (diagnostic = {}) => ({
  autonomie: Number.isFinite(Number(diagnostic.autonomie)) ? Number(diagnostic.autonomie) : null,
  distanceEmploi: Number.isFinite(Number(diagnostic.distanceEmploi)) ? Number(diagnostic.distanceEmploi) : null,
  maturiteProjet: Number.isFinite(Number(diagnostic.maturiteProjet)) ? Number(diagnostic.maturiteProjet) : null,
  employabilite: asString(diagnostic.employabilite),
  urgence: asString(diagnostic.urgence),
  scoreGlobal: Number.isFinite(Number(diagnostic.scoreGlobal)) ? Number(diagnostic.scoreGlobal) : null,
})

const buildPointForts = (dossier = {}, diagnostic = {}) => {
  const pointsForts = []

  if (dossier.dpaRealisee) pointsForts.push('DPA réalisée')
  if (dossier.premierEntretienRealise) pointsForts.push('Premier entretien réalisé')
  if (dossier.cvVisible) pointsForts.push('CV visible')
  if (asString(dossier.contratEngagement).toLowerCase() === 'oui') pointsForts.push("Contrat d'engagement actif")
  if (normalizeRecherche(dossier.rechercheEmploi) === 'active') pointsForts.push("Recherche d'emploi active")
  if (asArray(dossier.ateliers).length > 0) pointsForts.push('Ateliers déjà engagés')
  if (asArray(dossier.prestations).length > 0) pointsForts.push('Prestations déjà mobilisées')
  if (asArray(dossier.formations).length > 0) pointsForts.push('Formations déjà identifiées')
  if (asString(diagnostic.employabilite) === 'forte') pointsForts.push('Employabilité favorable')

  return unique(pointsForts)
}

const normalizeRecherche = (value) => asString(value).toLowerCase()

const buildFreins = (dossier = {}, diagnostic = {}) => {
  const freins = unique([...
    asArray(diagnostic.freinsDetectes),
    ...asArray(dossier.freins).map((item) => asString(item?.libelle || item?.nom || item?.message || item)),
  ])

  if (!dossier.cvVisible && !freins.some((item) => item.toLowerCase().includes('cv'))) {
    freins.push('CV non visible')
  }

  if (!asString(dossier.projetProfessionnel || dossier.projet) && !freins.some((item) => item.toLowerCase().includes('projet'))) {
    freins.push('Projet professionnel à clarifier')
  }

  return unique(freins)
}

const buildActions = (recommandations = {}, diagnostic = {}) => {
  const actions = []

  if (asArray(recommandations.ateliers).length > 0) {
    actions.push(`Prescrire ou planifier les ateliers suivants : ${formatList(recommandations.ateliers)}.`)
  }

  if (asArray(recommandations.prestations).length > 0) {
    actions.push(`Mobiliser les prestations suivantes : ${formatList(recommandations.prestations)}.`)
  }

  if (asArray(recommandations.partenaires).length > 0) {
    actions.push(`Orienter vers les partenaires suivants : ${formatList(recommandations.partenaires)}.`)
  }

  if (asArray(recommandations.formations).length > 0) {
    actions.push(`Étudier les pistes de formation suivantes : ${formatList(recommandations.formations)}.`)
  }

  if (asArray(recommandations.map).length > 0) {
    actions.push(`Formaliser la MAP autour de : ${formatList(recommandations.map)}.`)
  }

  if (asString(recommandations.portefeuille)) {
    actions.push(`Consolider l'orientation vers le portefeuille ${asString(recommandations.portefeuille)}.`)
  } else if (asString(diagnostic.employabilite)) {
    actions.push(`Adapter le portefeuille à un niveau d'employabilité ${asString(diagnostic.employabilite)}.`)
  }

  return unique(actions)
}

const buildSuiteAccompagnement = (diagnostic = {}, recommandations = {}) => {
  const pieces = []

  if (asString(diagnostic.urgence)) {
    pieces.push(`Priorité de suivi : niveau ${asString(diagnostic.urgence)}.`)
  }

  if (asString(diagnostic.scoreGlobal)) {
    pieces.push(`Score global de suivi : ${asString(diagnostic.scoreGlobal)}.`)
  }

  if (asString(diagnostic.employabilite)) {
    pieces.push(`Employabilité évaluée à ${asString(diagnostic.employabilite)}.`)
  }

  if (asString(recommandations.portefeuille)) {
    pieces.push(`Portefeuille cible recommandé : ${asString(recommandations.portefeuille)}.`)
  }

  if (asArray(recommandations.ateliers).length > 0 || asArray(recommandations.prestations).length > 0) {
    pieces.push('Les actions rapides doivent être planifiées dès le prochain point de suivi.')
  }

  if (asArray(diagnostic.vigilance).length > 0) {
    pieces.push(`Points de vigilance à suivre : ${formatList(diagnostic.vigilance)}.`)
  }

  return pieces.join(' ')
}

const buildTexteComplet = ({ resume, diagnostic, pointsForts, freins, actions, suiteAccompagnement, recommandations }) => {
  const diagnosticLigne = [
    `Autonomie : ${diagnostic.autonomie ?? 'non renseignée'}`,
    `Distance à l'emploi : ${diagnostic.distanceEmploi ?? 'non renseignée'}`,
    `Maturité du projet : ${diagnostic.maturiteProjet ?? 'non renseignée'}`,
    `Employabilité : ${diagnostic.employabilite || 'non renseignée'}`,
    `Urgence : ${diagnostic.urgence || 'non renseignée'}`,
    `Score global : ${diagnostic.scoreGlobal ?? 'non renseigné'}`,
  ].join(' | ')

  const blocs = [
    `Résumé : ${resume}`,
    `Diagnostic : ${diagnosticLigne}`,
    `Points forts : ${formatList(pointsForts)}`,
    `Freins : ${formatList(freins)}`,
    `Actions : ${formatList(actions)}`,
    `Suite d'accompagnement : ${suiteAccompagnement || 'À définir selon le prochain entretien.'}`,
    `Recommandations prioritaires : ${formatList(recommandations.recommandationsPrioritaires)}`,
  ]

  return blocs.join('\n')
}

export const genererSynthese = (dossier = {}, diagnostic = {}, recommandations = {}) => {
  const diagnosticNormalise = getDiagnosticHighlights(diagnostic)
  const resume = getIdentiteResume(dossier)
  const pointsForts = buildPointForts(dossier, diagnostic)
  const freins = buildFreins(dossier, diagnostic)
  const actions = buildActions(recommandations, diagnostic)
  const suiteAccompagnement = buildSuiteAccompagnement(diagnostic, recommandations)
  const texteComplet = buildTexteComplet({
    resume,
    diagnostic: diagnosticNormalise,
    pointsForts,
    freins,
    actions,
    suiteAccompagnement,
    recommandations,
  })

  return {
    resume,
    diagnostic: diagnosticNormalise,
    pointsForts,
    freins,
    actions,
    suiteAccompagnement,
    texteComplet,
  }
}

export default genererSynthese