import { REGLES_METIER } from '../data/reglesMetier'
import { analyseDiagnostic } from './diagnosticService'
import { getReferentielSection } from './referentielService'

const UNCERTAIN_PROJECT_TERMS = [
  'a definir',
  'à définir',
  'flou',
  'incertain',
  'non defini',
  'non défini',
  'pas de projet',
  'aucun projet',
  'hesitation',
  'hésitation',
  'reconversion',
  'creation',
  'création',
  'entreprise',
  'rsa',
  'cej',
  'senior',
  'handicap',
  'rqth',
  'mobilite',
  'mobilité',
  'logement',
  'sante',
  'santé',
  'numerique',
  'numérique',
  'cv',
  'emploi',
  'pmsmp',
  'iae',
  'cadre',
  'francais',
  'français',
  'durable',
]

const ACTION_PREFIXES = {
  atelier: 'Proposer l atelier',
  prestation: 'Etudier la prestation',
  partenaire: 'Mobiliser le partenaire',
  formation: 'Verifier la piste de formation',
}

const CATEGORY_KEYS = ['ateliers', 'prestations', 'partenaires', 'formations']

const REFERENTIEL_SECTIONS = {
  ateliers: getReferentielSection('ateliers'),
  prestations: getReferentielSection('prestations'),
  partenaires: getReferentielSection('partenaires'),
  formations: getReferentielSection('formations'),
  map: getReferentielSection('map'),
  portefeuilles: getReferentielSection('portefeuilles'),
}

const buildDiagnosticContext = (dossier) => {
  const diagnostic = analyseDiagnostic(dossier)

  return {
    diagnostic,
    prioritizedLabels: new Set(diagnostic.recommandationsPrioritaires.map((item) => normalizeText(item))),
    portfolioPriorities: getDiagnosticPortfolioPriorities(diagnostic, dossier),
  }
}

const getDiagnosticPortfolioPriorities = (diagnostic, dossier = {}) => {
  const priorities = []
  const age = Number(dossier.age)

  if (diagnostic.urgence === 'critique' || diagnostic.urgence === 'haute') {
    priorities.push('glo')
  }

  if (diagnostic.maturiteProjet < 45 || diagnostic.freinsDetectes.some((item) => textIncludesAny(item, ['projet', 'formation', 'reconversion']))) {
    priorities.push('pp')
  }

  if (diagnostic.employabilite === 'forte' && diagnostic.distanceEmploi <= 35) {
    priorities.push('em')
  }

  if (diagnostic.freinsDetectes.some((item) => textIncludesAny(item, ['handicap', 'rqth', 'sante', 'santé']))) {
    priorities.push('th')
  }

  if (age >= 16 && age <= 25) {
    priorities.push('cej')
  }

  if (diagnostic.distanceEmploi >= 55 || diagnostic.autonomie < 45) {
    priorities.push('sp')
  }

  return uniqueValues(priorities)
}

const getRuleDiagnosticBonus = (rule, diagnosticContext) => {
  if (!diagnosticContext) return 0

  const portfolio = normalizeText(rule.recommandations?.portefeuille)
  let bonus = 0

  if (diagnosticContext.portfolioPriorities.includes(portfolio)) {
    bonus += 60
  }

  const ruleRecommendations = [
    ...asArray(rule.recommandations?.ateliers),
    ...asArray(rule.recommandations?.prestations),
    ...asArray(rule.recommandations?.partenaires),
    ...asArray(rule.recommandations?.formations),
    ...asArray(rule.recommandations?.map),
  ]

  const matchedRecommendations = ruleRecommendations.filter((item) => diagnosticContext.prioritizedLabels.has(normalizeText(item)))
  bonus += Math.min(30, matchedRecommendations.length * 10)

  if ((diagnosticContext.diagnostic.urgence === 'critique' || diagnosticContext.diagnostic.urgence === 'haute') && (portfolio === 'glo' || portfolio === 'th')) {
    bonus += 10
  }

  return bonus
}

const getCandidateDiagnosticBonus = (category, value, diagnosticContext) => {
  if (!diagnosticContext) return 0

  const normalizedValue = normalizeText(value)
  let bonus = diagnosticContext.prioritizedLabels.has(normalizedValue) ? 100 : 0

  if ((diagnosticContext.diagnostic.urgence === 'critique' || diagnosticContext.diagnostic.urgence === 'haute') && ['ateliers', 'prestations', 'partenaires'].includes(category)) {
    bonus += 10
  }

  if (diagnosticContext.diagnostic.maturiteProjet < 45 && category === 'prestations' && textIncludesAny(normalizedValue, ['activ projet', 'bilan de competences', 'prepa competences', 'preparation a la formation'])) {
    bonus += 15
  }

  if (diagnosticContext.diagnostic.distanceEmploi >= 55 && category === 'ateliers' && textIncludesAny(normalizedValue, ['creation cv', 'marche du travail', 'pix emploi'])) {
    bonus += 10
  }

  if (diagnosticContext.diagnostic.freinsDetectes.some((item) => textIncludesAny(item, ['handicap', 'rqth', 'sante', 'santé'])) && category === 'partenaires' && textIncludesAny(normalizedValue, ['cap emploi', 'mdph'])) {
    bonus += 15
  }

  return bonus
}

const EXCLUSION_REASON_BY_SITUATION = {
  'Projet flou': 'projet encore à construire',
  'Projet valide': 'projet déjà validé',
  'Besoin de formation': 'montée en compétences prioritaire',
  'Creation entreprise': 'projet entrepreneurial prioritaire',
  RSA: 'accompagnement global prioritaire',
  CEJ: 'parcours jeune prioritaire',
  Senior: 'positionnement senior spécifique',
  Handicap: 'compensations à sécuriser',
  Mobilite: 'frein de mobilité à lever',
  Logement: 'stabilité résidentielle insuffisante',
  Sante: 'capacité à agir insuffisante',
  'Difficultes numeriques': 'autonomie numérique insuffisante',
  'Absence CV': 'CV à construire',
  'Recherche emploi': 'démarche active déjà engagée',
  PMSMP: 'mise en situation déjà structurée',
  IAE: 'orientation IAE prioritaire',
  Reconversion: 'projet de transition en cours',
  Cadre: 'positionnement cadre spécifique',
  'Francais insuffisant': 'maîtrise du français à renforcer',
  'Emploi durable': 'emploi durable déjà visé',
}

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const uniqueValues = (values) => Array.from(new Set(values.filter(Boolean)))

const formatList = (values) => uniqueValues(asArray(values)).join(', ')

const resolveReferentielLabel = (sectionName, value) => {
  const normalizedValue = normalizeText(value)
  const section = REFERENTIEL_SECTIONS[sectionName] || []
  const found = section.find((item) => normalizeText(item.libelle || item.nom) === normalizedValue)

  return found?.libelle || found?.nom || value
}

const asArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (value == null || value === '') return []
  return [value]
}

const includesNormalized = (list, expected) => {
  const normalizedExpected = normalizeText(expected)
  return list.some((item) => normalizeText(item) === normalizedExpected)
}

const textIncludesAny = (text, terms) => {
  const normalizedText = normalizeText(text)
  return terms.some((term) => normalizedText.includes(normalizeText(term)))
}

const classifyProjectSignals = (project) => {
  const normalizedProject = normalizeText(project)
  const empty = normalizedProject.length === 0
  const uncertain = empty || textIncludesAny(normalizedProject, UNCERTAIN_PROJECT_TERMS)

  return {
    empty,
    uncertain,
    validated: normalizedProject.length >= 8 && !uncertain,
    formation: textIncludesAny(normalizedProject, ['formation', 'certification', 'competence', 'competence', 'afc', 'aif']),
    creation: textIncludesAny(normalizedProject, ['creation', 'création', 'entreprise', 'micro', 'entrepreneur']),
    rsa: textIncludesAny(normalizedProject, ['rsa']),
    cej: textIncludesAny(normalizedProject, ['cej', 'jeune']),
    senior: textIncludesAny(normalizedProject, ['senior', '50+', '55+']),
    handicap: textIncludesAny(normalizedProject, ['handicap', 'rqth', 'cap emploi']),
    mobilite: textIncludesAny(normalizedProject, ['mobilite', 'mobilité', 'transport', 'permis']),
    logement: textIncludesAny(normalizedProject, ['logement', 'hebergement', 'hébergement']),
    sante: textIncludesAny(normalizedProject, ['sante', 'santé', 'medical', 'médical']),
    numerique: textIncludesAny(normalizedProject, ['numerique', 'numérique', 'digital', 'ordinateur']),
    cv: textIncludesAny(normalizedProject, ['cv', 'candidature']),
    emploi: textIncludesAny(normalizedProject, ['emploi', 'cdi', 'cdd', 'poste', 'recrutement']),
    pmsmp: textIncludesAny(normalizedProject, ['pmsmp', 'immersion']),
    iae: textIncludesAny(normalizedProject, ['iae', 'siae', 'insertion']),
    reconversion: textIncludesAny(normalizedProject, ['reconversion', 'transition professionnelle']),
    cadre: textIncludesAny(normalizedProject, ['cadre', 'management', 'direction']),
    francais: textIncludesAny(normalizedProject, ['francais', 'français', 'fLE', 'langue']),
    durable: textIncludesAny(normalizedProject, ['durable', 'stable', 'emploi durable']),
  }
}

const deriveSituationSignals = (diagnostic = {}) => {
  const projectSignals = classifyProjectSignals(diagnostic.projet)
  const advp = normalizeText(diagnostic.advp)
  const capaciteAgir = normalizeText(diagnostic.capaciteAgir)
  const freins = asArray(diagnostic.freins)
  const ressources = asArray(diagnostic.ressources)
  const hasFrein = (expected) => includesNormalized(freins, expected)
  const hasRessource = (expected) => includesNormalized(ressources, expected)

  return {
    'Projet flou': projectSignals.uncertain || advp === 'explorer',
    'Projet valide': projectSignals.validated && advp === 'realiser',
    'Besoin de formation': projectSignals.formation || hasFrein('Competences'),
    'Creation entreprise': projectSignals.creation,
    RSA: projectSignals.rsa || hasFrein('Finances'),
    CEJ: projectSignals.cej || hasRessource('Disponibilite'),
    Senior: projectSignals.senior || hasRessource('Experience'),
    Handicap: projectSignals.handicap || hasFrein('Sante'),
    Mobilite: projectSignals.mobilite || hasFrein('Mobilite'),
    Logement: projectSignals.logement || hasFrein('Logement'),
    Sante: projectSignals.sante || hasFrein('Sante') || capaciteAgir.includes('progress'),
    'Difficultes numeriques': projectSignals.numerique || hasFrein('Competences numeriques'),
    'Absence CV': projectSignals.cv || hasFrein('Absence CV') || hasFrein('Projet professionnel'),
    'Recherche emploi': projectSignals.emploi || advp === 'realiser',
    PMSMP: projectSignals.pmsmp,
    IAE: projectSignals.iae,
    Reconversion: projectSignals.reconversion,
    Cadre: projectSignals.cadre,
    'Francais insuffisant': projectSignals.francais || hasFrein('Maitrise du francais'),
    'Emploi durable': projectSignals.durable || (projectSignals.validated && hasRessource('Autonomie')),
  }
}

const matchesProjectCondition = (rule, diagnostic, signals) => {
  const projectCondition = normalizeText(rule.conditions?.projet)
  const projectText = normalizeText(diagnostic.projet)

  if (!projectCondition) return true
  if (!projectText && signals['Projet flou']) return projectCondition.includes('definir') || projectCondition.includes('construction')

  const situationSignal = signals[rule.situation]
  if (situationSignal) return true

  return projectText.includes(projectCondition) || projectCondition.includes(projectText)
}

const matchesAdvpCondition = (rule, diagnostic) => {
  const expected = normalizeText(rule.conditions?.advp)
  if (!expected) return true
  return normalizeText(diagnostic.advp) === expected
}

const matchesCapacityCondition = (rule, diagnostic) => {
  const expected = normalizeText(rule.conditions?.capaciteAgir)
  const actual = normalizeText(diagnostic.capaciteAgir)
  if (!expected) return true
  if (!actual) return false
  return actual.includes(expected) || expected.includes(actual)
}

const matchesListCondition = (expectedValues, actualValues) => {
  const expected = asArray(expectedValues)
  if (expected.length === 0) return true
  const actual = asArray(actualValues)
  return expected.every((value) => includesNormalized(actual, value))
}

const collectMatchingItems = (expectedValues, actualValues) => {
  const expected = asArray(expectedValues)
  const actual = asArray(actualValues)
  return expected.filter((value) => includesNormalized(actual, value))
}

const getRuleExclusions = (rule) =>
  CATEGORY_KEYS.reduce(
    (accumulator, category) => ({
      ...accumulator,
      [category]: asArray(rule.exclusions?.[category]),
    }),
    {},
  )

const buildExclusionReason = (rule, category, item, diagnostic) => {
  const baseReason = EXCLUSION_REASON_BY_SITUATION[rule.situation] || 'incompatible avec la situation métier'
  const normalizedItem = normalizeText(item)
  const normalizedCapacity = normalizeText(rule.conditions?.capaciteAgir)
  const normalizedProject = normalizeText(diagnostic.projet)

  if (normalizedItem.includes('pmsmp') || normalizedItem.includes('immersion')) {
    if (normalizedCapacity.includes('a soutenir') || normalizedCapacity.includes('fragilisee') || normalizedCapacity.includes('a renforcer') || normalizedCapacity.includes('freinee')) {
      return 'capacité à agir insuffisante'
    }
  }

  if ((normalizedItem.includes("activ'projet") || normalizedItem.includes('bilan de competences') || normalizedItem.includes('préparation à la formation') || normalizedItem.includes('preparation a la formation')) && normalizedProject.includes('valide')) {
    return 'projet déjà validé'
  }

  if (category === 'partenaires' && rule.situation === 'Projet valide') {
    return 'partenariat non nécessaire à ce stade'
  }

  return baseReason
}

const getNiveauConfiance = (score) => {
  if (score >= 90) return 'Très élevé'
  if (score >= 70) return 'Élevé'
  if (score >= 50) return 'Moyen'
  return 'Faible'
}

const buildJustification = (diagnostic, primaryRule, motifsCorrespondance) => {
  const project = String(diagnostic.projet || '').trim()
  const advp = String(diagnostic.advp || '').trim()
  const capaciteAgir = String(diagnostic.capaciteAgir || '').trim()
  const freins = formatList(diagnostic.freins)
  const ressources = formatList(diagnostic.ressources)

  const lines = [
    project ? `Projet professionnel : ${project}.` : 'Projet professionnel à construire.',
    advp ? `ADVP en phase ${advp}.` : 'ADVP non précisée.',
    capaciteAgir ? `Capacité à agir ${capaciteAgir}.` : 'Capacité à agir à préciser.',
    `Freins pris en compte : ${freins || 'aucun frein identifié'}.`,
    `Ressources mobilisables : ${ressources || 'aucune ressource explicitée'}.`,
  ]

  if (primaryRule?.situation) {
    lines.push(`Règle prioritaire retenue : ${primaryRule.situation}.`)
  }

  if (motifsCorrespondance.length > 0) {
    lines.push(`Motifs de correspondance : ${motifsCorrespondance.join(' ; ')}.`)
  }

  if (primaryRule?.justification) {
    lines.push(`Fond métier : ${primaryRule.justification}`)
  }

  return lines.join(' ')
}

const scoreRule = (rule, diagnostic, signals) => {
  const motifsCorrespondance = []
  let score = 0

  const projectMatch = matchesProjectCondition(rule, diagnostic, signals)
  if (projectMatch) {
    score += 40
    motifsCorrespondance.push('Projet correspondant')
  }

  const advpMatch = matchesAdvpCondition(rule, diagnostic)
  if (advpMatch) {
    score += 25
    motifsCorrespondance.push('ADVP correspondant')
  }

  const capacityMatch = matchesCapacityCondition(rule, diagnostic)
  if (capacityMatch) {
    score += 20
    motifsCorrespondance.push('Capacité à agir correspondante')
  }

  const matchingFreins = collectMatchingItems(rule.conditions?.freins, diagnostic.freins)
  if (matchingFreins.length > 0) {
    score += matchingFreins.length * 10
    matchingFreins.forEach((item) => {
      motifsCorrespondance.push(`Frein correspondant: ${item}`)
    })
  }

  const matchingRessources = collectMatchingItems(rule.conditions?.ressources, diagnostic.ressources)
  if (matchingRessources.length > 0) {
    score += matchingRessources.length * 5
    matchingRessources.forEach((item) => {
      motifsCorrespondance.push(`Ressource correspondante: ${item}`)
    })
  }

  return {
    score,
    motifsCorrespondance,
    compatible: score > 0,
  }
}

const buildCandidateList = (rules, diagnosticContext) =>
  CATEGORY_KEYS.reduce(
    (accumulator, category) => ({
      ...accumulator,
      [category]: rules.flatMap((rule) =>
        asArray(rule.recommandations?.[category]).map((value) => ({
          value,
          score: rule.score,
          ruleId: rule.id,
          situation: rule.situation,
          priorite: rule.priorite,
          sectionName: category,
          diagnosticBonus: getCandidateDiagnosticBonus(category, value, diagnosticContext),
        })),
      ),
    }),
    {},
  )

const buildExclusionIndex = (rules, diagnostic) =>
  CATEGORY_KEYS.reduce(
    (accumulator, category) => {
      const categoryIndex = new Map()

      rules.forEach((rule) => {
        asArray(rule.exclusions?.[category]).forEach((item) => {
          const key = normalizeText(item)
          const entry = categoryIndex.get(key) || { value: item, reasons: [] }
          const reason = buildExclusionReason(rule, category, item, diagnostic)
          if (reason && !entry.reasons.includes(reason)) {
            entry.reasons.push(reason)
          }
          categoryIndex.set(key, entry)
        })
      })

      return {
        ...accumulator,
        [category]: categoryIndex,
      }
    },
    {},
  )

const filterAndSortRecommendations = (candidates, exclusions, warnings) => {
  const sortedCandidates = [...candidates].sort((left, right) => {
    const leftScore = left.score + (left.diagnosticBonus || 0)
    const rightScore = right.score + (right.diagnosticBonus || 0)

    if (leftScore !== rightScore) return rightScore - leftScore
    if (left.priorite !== right.priorite) return left.priorite - right.priorite
    return String(left.value).localeCompare(String(right.value), 'fr')
  })

  const kept = []
  const seen = new Set()

  sortedCandidates.forEach((candidate) => {
    const normalized = normalizeText(candidate.value)
    const exclusion = exclusions.get(normalized)
    if (exclusion) {
      warnings.push(`${exclusion.value} non proposé : ${uniqueValues(exclusion.reasons).join(' ; ')}.`)
      return
    }

    if (seen.has(normalized)) return
    seen.add(normalized)
    kept.push(resolveReferentielLabel(candidate.sectionName || candidate.category || '', candidate.value))
  })

  return kept
}

const getCompatibleRules = (diagnostic = {}, diagnosticContext = null) => {
  const signals = deriveSituationSignals(diagnostic)

  return REGLES_METIER
    .map((rule) => {
      const diagnosticBonus = getRuleDiagnosticBonus(rule, diagnosticContext)
      const evaluation = scoreRule(rule, diagnostic, signals)
      return {
        ...rule,
        ...evaluation,
        diagnosticBonus,
      }
    })
    .filter((rule) => rule.compatible)
    .sort((left, right) => {
      const leftScore = left.score + (left.diagnosticBonus || 0)
      const rightScore = right.score + (right.diagnosticBonus || 0)

      if (leftScore !== rightScore) return rightScore - leftScore
      if (left.priorite !== right.priorite) return left.priorite - right.priorite
      return left.situation.localeCompare(right.situation, 'fr')
    })
}

export function getRecommandations(diagnostic = {}) {
  const diagnosticAnalysis = analyseDiagnostic(diagnostic)
  const diagnosticContext = {
    diagnostic: diagnosticAnalysis,
    prioritizedLabels: new Set(diagnosticAnalysis.recommandationsPrioritaires.map((item) => normalizeText(item))),
    portfolioPriorities: getDiagnosticPortfolioPriorities(diagnosticAnalysis, diagnostic),
  }

  const compatibleRules = getCompatibleRules(diagnostic, diagnosticContext)
  const primaryRule = compatibleRules[0] || null

  const candidatesByCategory = buildCandidateList(compatibleRules, diagnosticContext)
  const exclusionsByCategory = buildExclusionIndex(compatibleRules, diagnostic)
  const avertissements = []

  const ateliers = filterAndSortRecommendations(candidatesByCategory.ateliers, exclusionsByCategory.ateliers, avertissements)
  const prestations = filterAndSortRecommendations(candidatesByCategory.prestations, exclusionsByCategory.prestations, avertissements)
  const partenaires = filterAndSortRecommendations(candidatesByCategory.partenaires, exclusionsByCategory.partenaires, avertissements)
  const formations = filterAndSortRecommendations(candidatesByCategory.formations, exclusionsByCategory.formations, avertissements)
  const map = uniqueValues(
    compatibleRules.flatMap((rule) => (rule.recommandations?.map || []).map((item) => resolveReferentielLabel('map', item))),
  )
  const portefeuille = resolveReferentielLabel('portefeuilles', primaryRule?.recommandations?.portefeuille || '')
  const motifsCorrespondance = primaryRule?.motifsCorrespondance || []
  const score = primaryRule?.score || 0
  const niveauConfiance = getNiveauConfiance(score)
  const justification = buildJustification(diagnostic, primaryRule, motifsCorrespondance)
  const warningsNormalized = uniqueValues(avertissements)

  const actions = uniqueValues([
    ...ateliers.map((item) => `${ACTION_PREFIXES.atelier} ${item}`),
    ...prestations.map((item) => `${ACTION_PREFIXES.prestation} ${item}`),
    ...partenaires.map((item) => `${ACTION_PREFIXES.partenaire} ${item}`),
    ...formations.map((item) => `${ACTION_PREFIXES.formation} ${item}`),
    ...map,
  ])

  return {
    score,
    niveauConfiance,
    justification,
    avertissements: warningsNormalized,
    motifsCorrespondance,
    orientation: primaryRule
      ? {
          principale: primaryRule.situation,
          compatibles: compatibleRules.map((rule) => ({
            id: rule.id,
            situation: rule.situation,
            priorite: rule.priorite,
            score: rule.score,
            motifsCorrespondance: rule.motifsCorrespondance,
          })),
        }
      : {
          principale: '',
          compatibles: [],
        },
    ateliers,
    prestations,
    partenaires,
    formations,
    portefeuille,
    map,
    actions,
    diagnostic: diagnosticAnalysis,
  }
}

export default getRecommandations