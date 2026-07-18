const asString = (value) => String(value || '').trim()

const asArray = (value) => (Array.isArray(value) ? value : [])

const unique = (items) => [...new Set(items.filter(Boolean))]

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

const formatList = (items, fallback = 'Aucun élément renseigné') => {
  const values = unique(asArray(items).map((item) => asString(item)).filter(Boolean))
  return values.length > 0 ? values.join(', ') : fallback
}

const getIdentite = (dossier = {}) => {
  const identifiant = asString(dossier.identifiant || dossier.id)
  const age = Number.isFinite(Number(dossier.age))
    ? `${Number(dossier.age)} ans`
    : asString(dossier.dateNaissance || dossier.date_naissance)
      ? 'âge à confirmer'
      : ''
  const portefeuille = asString(dossier.portefeuille)
  const projet = asString(dossier.projetProfessionnel || dossier.projet)

  return [
    identifiant ? `Dossier ${identifiant}` : 'Dossier conseiller',
    portefeuille ? `portefeuille ${portefeuille}` : '',
    age ? age : '',
    projet ? `projet : ${projet}` : 'projet à préciser',
  ].filter(Boolean).join(' - ')
}

const getPrimaryRecommendation = (recommandations = {}) => {
  const sources = [
    asArray(recommandations.recommandationsPrioritaires),
    asArray(recommandations.prestations),
    asArray(recommandations.ateliers),
    asArray(recommandations.partenaires),
    asArray(recommandations.formations),
    asArray(recommandations.map),
  ]

  const candidate = sources.flat().find((item) => asString(item))
  return asString(candidate)
}

const getObjectiveLabel = (dossier = {}, diagnostic = {}, recommendations = {}) => {
  const primary = getPrimaryRecommendation(recommendations)
  const project = asString(dossier.projetProfessionnel || dossier.projet)

  if (primary) return primary
  if (asString(diagnostic.urgence) === 'critique') return 'Lever les freins prioritaires'
  if (asString(diagnostic.employabilite) === 'forte') return 'Sécuriser un retour rapide à l emploi'
  if (asString(diagnostic.maturiteProjet) && Number(diagnostic.maturiteProjet) < 40) return 'Clarifier le projet professionnel'
  if (project) return project
  return 'Construire et sécuriser le parcours'
}

const buildSecondaryObjectives = (dossier = {}, diagnostic = {}, recommendations = {}) => {
  const objectifs = []
  const age = Number.isFinite(Number(dossier.age)) ? Number(dossier.age) : null

  if (!asString(dossier.projetProfessionnel || dossier.projet)) {
    objectifs.push('Formaliser un projet professionnel lisible')
  }

  if (!dossier.cvVisible) {
    objectifs.push('Rendre le CV exploitable pour les démarches')
  }

  if (Number(diagnostic.distanceEmploi) >= 60) {
    objectifs.push('Réduire la distance à l emploi par des actions courtes et ciblées')
  }

  if (Number(diagnostic.autonomie) < 50) {
    objectifs.push('Renforcer l autonomie dans les démarches')
  }

  if (Number(diagnostic.maturiteProjet) < 50) {
    objectifs.push('Consolider la maturité du projet et les choix d orientation')
  }

  if (asString(diagnostic.urgence) === 'haute' || asString(diagnostic.urgence) === 'critique') {
    objectifs.push('Traiter en priorité les freins bloquants')
  }

  if (age !== null && age < 26) {
    objectifs.push('Sécuriser le rythme d accompagnement du public jeune')
  }

  if (age !== null && age >= 50) {
    objectifs.push('Valoriser l expérience et ajuster la stratégie de candidature')
  }

  if (asArray(recommendations.ateliers).length > 0 || asArray(recommendations.prestations).length > 0) {
    objectifs.push('Mettre en œuvre les prescriptions retenues')
  }

  return unique(objectifs)
}

const buildConseillerCommitments = (dossier = {}, diagnostic = {}, recommendations = {}) => {
  const engagements = []

  engagements.push('Formaliser un plan d action lisible et progressif')

  if (asArray(recommendations.ateliers).length > 0) {
    engagements.push(`Prescrire ou proposer les ateliers suivants : ${formatList(recommendations.ateliers)}.`)
  }

  if (asArray(recommendations.prestations).length > 0) {
    engagements.push(`Activer les prestations adaptées : ${formatList(recommendations.prestations)}.`)
  }

  if (asArray(recommendations.partenaires).length > 0) {
    engagements.push(`Mobiliser les partenaires pertinents : ${formatList(recommendations.partenaires)}.`)
  }

  if (asArray(recommendations.formations).length > 0) {
    engagements.push(`Vérifier les solutions de formation : ${formatList(recommendations.formations)}.`)
  }

  if (asArray(recommendations.map).length > 0) {
    engagements.push(`Suivre la MAP autour de : ${formatList(recommendations.map)}.`)
  }

  if (asString(recommendations.portefeuille)) {
    engagements.push(`Ajuster le portefeuille cible vers ${asString(recommendations.portefeuille)}.`)
  } else if (asString(diagnostic.employabilite)) {
    engagements.push(`Adapter le portefeuille au niveau d employabilité ${asString(diagnostic.employabilite)}.`)
  }

  if (!dossier.cvVisible) {
    engagements.push('Accompagner la remise à niveau du CV')
  }

  if (Number(diagnostic.autonomie) < 50) {
    engagements.push('Renforcer l autonomie numérique et administrative')
  }

  if (Number(diagnostic.distanceEmploi) >= 60) {
    engagements.push('Rythmer le suivi avec des échéances rapprochées')
  }

  return unique(engagements)
}

const buildDemandeurCommitments = (dossier = {}, diagnostic = {}, recommendations = {}) => {
  const engagements = []

  engagements.push('Réaliser les démarches convenues dans les délais fixés')

  if (asArray(recommendations.ateliers).length > 0) {
    engagements.push('Participer aux ateliers prescrits')
  }

  if (asArray(recommendations.prestations).length > 0) {
    engagements.push('Engager les prestations et les rendez-vous nécessaires')
  }

  if (asArray(recommendations.partenaires).length > 0) {
    engagements.push('Prendre contact avec les partenaires orientés')
  }

  if (asArray(recommendations.formations).length > 0) {
    engagements.push('Étudier ou engager la solution de formation adaptée')
  }

  if (!dossier.cvVisible) {
    engagements.push('Mettre à jour ou rendre visible le CV')
  }

  if (!asString(dossier.projetProfessionnel || dossier.projet)) {
    engagements.push('Préciser progressivement le projet professionnel')
  }

  if (Number(diagnostic.autonomie) < 50) {
    engagements.push('Prévenir rapidement tout blocage dans les démarches')
  }

  if (Number(diagnostic.distanceEmploi) >= 60) {
    engagements.push('Maintenir un rythme d action régulier')
  }

  return unique(engagements)
}

const buildSteps = (diagnostic = {}, recommendations = {}) => {
  const etapes = []

  etapes.push('1. Confirmer le diagnostic partagé avec le demandeur.')

  if (asArray(recommendations.ateliers).length > 0) {
    etapes.push(`2. Programmer les ateliers : ${formatList(recommendations.ateliers)}.`)
  }

  if (asArray(recommendations.prestations).length > 0) {
    etapes.push(`3. Déclencher les prestations : ${formatList(recommendations.prestations)}.`)
  }

  if (asArray(recommendations.partenaires).length > 0) {
    etapes.push(`4. Orienter vers les partenaires : ${formatList(recommandations.partenaires)}.`)
  }

  if (asArray(recommendations.formations).length > 0) {
    etapes.push(`5. Vérifier l opportunité de formation : ${formatList(recommendations.formations)}.`)
  }

  if (asArray(recommendations.map).length > 0) {
    etapes.push(`6. Formaliser la MAP autour de : ${formatList(recommendations.map)}.`)
  }

  if (Number(diagnostic.distanceEmploi) >= 60 || Number(diagnostic.autonomie) < 50) {
    etapes.push('7. Prévoir un point de suivi rapproché pour vérifier les avancées.')
  } else {
    etapes.push('7. Prévoir un suivi de consolidation à échéance standard.')
  }

  return unique(etapes)
}

const buildIndicators = (dossier = {}, diagnostic = {}, recommendations = {}) => {
  const indicateurs = []

  indicateurs.push(`Autonomie cible : ${asString(diagnostic.autonomie) || 'à suivre'}`)
  indicateurs.push(`Distance à l emploi : ${asString(diagnostic.distanceEmploi) || 'à suivre'}`)
  indicateurs.push(`Maturité du projet : ${asString(diagnostic.maturiteProjet) || 'à suivre'}`)
  indicateurs.push(`Score global : ${asString(diagnostic.scoreGlobal) || 'à suivre'}`)

  if (asString(diagnostic.employabilite)) {
    indicateurs.push(`Employabilité : ${asString(diagnostic.employabilite)}`)
  }

  if (asString(diagnostic.urgence)) {
    indicateurs.push(`Urgence : ${asString(diagnostic.urgence)}`)
  }

  if (asArray(recommendations.ateliers).length > 0) {
    indicateurs.push(`Ateliers suivis : ${asArray(dossier.ateliers).length}`)
  }

  if (asArray(recommendations.prestations).length > 0) {
    indicateurs.push(`Prestations mobilisées : ${asArray(dossier.prestations).length}`)
  }

  if (asArray(recommendations.partenaires).length > 0) {
    indicateurs.push(`Partenaires mobilisés : ${asArray(dossier.simulateurDecision?.partenaires).length}`)
  }

  return unique(indicateurs)
}

const buildEcheance = (diagnostic = {}) => {
  if (asString(diagnostic.urgence) === 'critique') return 'Sous 7 jours'
  if (asString(diagnostic.urgence) === 'haute') return 'Sous 15 jours'
  if (Number(diagnostic.distanceEmploi) >= 60 || Number(diagnostic.autonomie) < 50) return 'Sous 30 jours'
  return 'Sous 45 jours'
}

const buildTexteComplet = ({ objectifPrincipal, objectifsSecondaires, engagementsConseiller, engagementsDemandeur, etapes, indicateursSuivi, echeance, diagnostic, recommandations }) => {
  const lignes = [
    `MAP - ${objectifPrincipal}.`,
    `Objectifs secondaires : ${formatList(objectifsSecondaires, 'Aucun objectif secondaire renseigné')}.`,
    `Engagements conseiller : ${formatList(engagementsConseiller)}.`,
    `Engagements demandeur : ${formatList(engagementsDemandeur)}.`,
    `Étapes : ${formatList(etapes)}.`,
    `Indicateurs de suivi : ${formatList(indicateursSuivi)}.`,
    `Échéance : ${echeance}.`,
    `Diagnostic de référence : autonomie ${asString(diagnostic.autonomie) || 'NR'}, distance emploi ${asString(diagnostic.distanceEmploi) || 'NR'}, maturité projet ${asString(diagnostic.maturiteProjet) || 'NR'}, employabilité ${asString(diagnostic.employabilite) || 'NR'}, urgence ${asString(diagnostic.urgence) || 'NR'}, score global ${asString(diagnostic.scoreGlobal) || 'NR'}.`,
    `Recommandations prioritaires : ${formatList(recommandations.recommandationsPrioritaires)}.`,
  ]

  return lignes.join(' ')
}

export const genererMAP = (dossier = {}, diagnostic = {}, recommandations = {}) => {
  const objectifPrincipal = getObjectiveLabel(dossier, diagnostic, recommandations)
  const objectifsSecondaires = buildSecondaryObjectives(dossier, diagnostic, recommandations)
  const engagementsConseiller = buildConseillerCommitments(dossier, diagnostic, recommandations)
  const engagementsDemandeur = buildDemandeurCommitments(dossier, diagnostic, recommandations)
  const etapes = buildSteps(diagnostic, recommandations)
  const indicateursSuivi = buildIndicators(dossier, diagnostic, recommandations)
  const echeance = buildEcheance(diagnostic)
  const texteComplet = buildTexteComplet({
    objectifPrincipal,
    objectifsSecondaires,
    engagementsConseiller,
    engagementsDemandeur,
    etapes,
    indicateursSuivi,
    echeance,
    diagnostic,
    recommandations,
  })

  return {
    objectifPrincipal,
    objectifsSecondaires,
    engagementsConseiller,
    engagementsDemandeur,
    etapes,
    indicateursSuivi,
    echeance,
    texteComplet,
  }
}

export default genererMAP