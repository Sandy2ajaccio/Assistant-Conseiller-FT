/**
 * Service de generation de synthese France Travail.
 *
 * Objectif:
 * - Produire un texte professionnel, clair et directement exploitable en entretien.
 * - Ne jamais inventer d'information: seules les donnees presentes sont exploitees.
 * - Ignorer les champs vides et eviter les repetitions.
 *
 * Ce service est totalement independant de React.
 */

/**
 * Convertit une valeur en texte nettoye.
 * @param {unknown} value
 * @returns {string}
 */
const toText = (value) => String(value ?? '').trim()

/**
 * Retourne true si la valeur contient un contenu exploitable.
 * @param {unknown} value
 * @returns {boolean}
 */
const hasValue = (value) => toText(value).length > 0

/**
 * Transforme une valeur en tableau plat de chaines non vides.
 * @param {unknown} value
 * @returns {string[]}
 */
const toList = (value) => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => toList(item))
      .map((item) => toText(item))
      .filter(Boolean)
  }

  if (value && typeof value === 'object') {
    return Object.values(value)
      .flatMap((item) => toList(item))
      .map((item) => toText(item))
      .filter(Boolean)
  }

  const text = toText(value)
  return text ? [text] : []
}

/**
 * Normalise une phrase pour detecter les doublons de contenu.
 * @param {string} sentence
 * @returns {string}
 */
const normalizeSentence = (sentence) =>
  toText(sentence)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Ajoute une phrase si elle est non vide et non deja presente.
 * @param {string[]} sentences
 * @param {string} sentence
 * @param {Set<string>} seen
 */
const pushUniqueSentence = (sentences, sentence, seen) => {
  const cleaned = toText(sentence)
  if (!cleaned) return

  const key = normalizeSentence(cleaned)
  if (!key || seen.has(key)) return

  seen.add(key)
  sentences.push(cleaned)
}

/**
 * Formate une liste en sequence lisible.
 * @param {string[]} items
 * @returns {string}
 */
const formatNaturalList = (items) => {
  const values = [...new Set(items.map((item) => toText(item)).filter(Boolean))]
  if (values.length === 0) return ''
  if (values.length === 1) return values[0]
  if (values.length === 2) return `${values[0]} et ${values[1]}`
  return `${values.slice(0, -1).join(', ')} et ${values[values.length - 1]}`
}

/**
 * Extrait des champs identite sans supposer de structure unique.
 * @param {Record<string, any>} identite
 * @returns {string[]}
 */
const extractIdentiteFacts = (identite = {}) => {
  const facts = []

  const nomComplet = [identite.prenom, identite.nom].map((item) => toText(item)).filter(Boolean).join(' ')
  if (nomComplet) facts.push(`identite: ${nomComplet}`)

  const identifiant = toText(identite.identifiant || identite.identifiantFt || identite.id)
  if (identifiant) facts.push(`identifiant France Travail: ${identifiant}`)

  const age = toText(identite.age)
  if (age) facts.push(`age: ${age}`)

  const categorie = toText(identite.categorie)
  if (categorie) facts.push(`categorie: ${categorie}`)

  return facts
}

/**
 * Genere le paragraphe de situation generale.
 * @param {Record<string, any>} input
 * @param {Set<string>} seen
 * @returns {string}
 */
export const generateSituation = (input = {}, seen = new Set()) => {
  const sentences = []

  const identiteFacts = extractIdentiteFacts(input.identite)
  const parcours = toList(input.parcoursProfessionnel)
  const mobilite = toList(input.mobilite)
  const notesRapides = toList(input.notesRapides)

  if (identiteFacts.length > 0) {
    pushUniqueSentence(
      sentences,
      `Vous m'indiquez les elements suivants: ${formatNaturalList(identiteFacts)}.`,
      seen,
    )
  }

  if (parcours.length > 0) {
    pushUniqueSentence(
      sentences,
      `Vous precisez votre parcours professionnel: ${formatNaturalList(parcours)}.`,
      seen,
    )
  }

  if (mobilite.length > 0) {
    pushUniqueSentence(
      sentences,
      `Vous m'indiquez concernant la mobilite: ${formatNaturalList(mobilite)}.`,
      seen,
    )
  }

  if (notesRapides.length > 0) {
    pushUniqueSentence(
      sentences,
      `Vous precisez egalement: ${formatNaturalList(notesRapides)}.`,
      seen,
    )
  }

  return sentences.join(' ')
}

/**
 * Genere le paragraphe projet professionnel.
 * @param {Record<string, any>} input
 * @param {Set<string>} seen
 * @returns {string}
 */
export const generateProjet = (input = {}, seen = new Set()) => {
  const sentences = []
  const projet = toText(input.projetProfessionnel)
  const recommandationsRetenues = toList(input.recommandationsRetenues)

  if (projet) {
    pushUniqueSentence(sentences, `Vous souhaitez ${projet}.`, seen)
  }

  if (recommandationsRetenues.length > 0) {
    pushUniqueSentence(
      sentences,
      `Nous convenons de retenir en priorite: ${formatNaturalList(recommandationsRetenues)}.`,
      seen,
    )
  }

  return sentences.join(' ')
}

/**
 * Genere le paragraphe freins et vigilances.
 * @param {Record<string, any>} input
 * @param {Set<string>} seen
 * @returns {string}
 */
export const generateFreins = (input = {}, seen = new Set()) => {
  const sentences = []

  const contraintes = toList(input.contraintes)
  const freinsDiagnostic = toList(input.diagnostic?.freinsDetectes)
  const vigilance = toList(input.diagnostic?.vigilance)
  const allFreins = [...new Set([...contraintes, ...freinsDiagnostic])]

  if (allFreins.length > 0) {
    pushUniqueSentence(
      sentences,
      `Vous precisez les contraintes suivantes: ${formatNaturalList(allFreins)}.`,
      seen,
    )
  }

  if (vigilance.length > 0) {
    pushUniqueSentence(
      sentences,
      `Je vous informe des points de vigilance a suivre: ${formatNaturalList(vigilance)}.`,
      seen,
    )
  }

  return sentences.join(' ')
}

/**
 * Genere le paragraphe competences/formation.
 * @param {Record<string, any>} input
 * @param {Set<string>} seen
 * @returns {string}
 */
export const generateCompetences = (input = {}, seen = new Set()) => {
  const sentences = []

  const competences = toList(input.competences)
  const formations = toList(input.formations)

  if (competences.length > 0) {
    pushUniqueSentence(
      sentences,
      `Vous m'indiquez vos competences mobilisables: ${formatNaturalList(competences)}.`,
      seen,
    )
  }

  if (formations.length > 0) {
    pushUniqueSentence(
      sentences,
      `Vous precisez vos elements de formation: ${formatNaturalList(formations)}.`,
      seen,
    )
  }

  return sentences.join(' ')
}

/**
 * Genere le paragraphe actions decidees.
 * @param {Record<string, any>} input
 * @param {Set<string>} seen
 * @returns {string}
 */
export const generateActions = (input = {}, seen = new Set()) => {
  const sentences = []

  const recommandations = input.recommandations || {}
  const partenaires = toList(recommandations.partenaires)
  const prestations = toList(recommandations.prestations)
  const ateliers = toList(recommandations.ateliers)
  const formations = toList(recommandations.formations)
  const actions = toList(recommandations.actions)
  const map = input.map || {}

  if (partenaires.length > 0) {
    pushUniqueSentence(
      sentences,
      `Je vous oriente vers ${formatNaturalList(partenaires)}.`,
      seen,
    )
  }

  if (prestations.length > 0) {
    pushUniqueSentence(
      sentences,
      `Je vous prescris les prestations suivantes: ${formatNaturalList(prestations)}.`,
      seen,
    )
  }

  if (ateliers.length > 0) {
    pushUniqueSentence(
      sentences,
      `Nous convenons de votre participation aux ateliers suivants: ${formatNaturalList(ateliers)}.`,
      seen,
    )
  }

  if (formations.length > 0) {
    pushUniqueSentence(
      sentences,
      `Je vous informe des pistes de formation a etudier: ${formatNaturalList(formations)}.`,
      seen,
    )
  }

  if (actions.length > 0) {
    pushUniqueSentence(
      sentences,
      `Nous convenons des actions immediates suivantes: ${formatNaturalList(actions)}.`,
      seen,
    )
  }

  const objectifPrincipal = toText(map.objectifPrincipal)
  if (objectifPrincipal) {
    pushUniqueSentence(
      sentences,
      `Dans la MAP, nous retenons comme objectif principal: ${objectifPrincipal}.`,
      seen,
    )
  }

  const etapes = toList(map.etapes)
  if (etapes.length > 0) {
    pushUniqueSentence(
      sentences,
      `Nous convenons des etapes de suivi suivantes: ${formatNaturalList(etapes)}.`,
      seen,
    )
  }

  const echeance = toText(map.echeance)
  if (echeance) {
    pushUniqueSentence(
      sentences,
      `L'echeance de suivi retenue est: ${echeance}.`,
      seen,
    )
  }

  return sentences.join(' ')
}

/**
 * Genere le paragraphe de conclusion.
 * @param {Record<string, any>} input
 * @param {Set<string>} seen
 * @returns {string}
 */
export const generateConclusion = (input = {}, seen = new Set()) => {
  const sentences = []
  const diagnostic = input.diagnostic || {}

  const urgence = toText(diagnostic.urgence)
  if (urgence) {
    pushUniqueSentence(
      sentences,
      `Je vous informe que le suivi est organise avec un niveau de priorite ${urgence}.`,
      seen,
    )
  }

  const employabilite = toText(diagnostic.employabilite)
  if (employabilite) {
    pushUniqueSentence(
      sentences,
      `Nous convenons de poursuivre l'accompagnement en tenant compte d'une employabilite ${employabilite}.`,
      seen,
    )
  }

  pushUniqueSentence(
    sentences,
    'Nous convenons de faire un point d avancement au prochain entretien sur la realisation des actions et des engagements.',
    seen,
  )

  return sentences.join(' ')
}

/**
 * Fonction principale de generation de synthese France Travail.
 *
 * Entree attendue:
 * {
 *   identite,
 *   diagnostic,
 *   projetProfessionnel,
 *   contraintes,
 *   competences,
 *   mobilite,
 *   formations,
 *   parcoursProfessionnel,
 *   recommandationsRetenues,
 *   recommandations,
 *   map,
 *   notesRapides
 * }
 *
 * Sortie:
 * {
 *   paragraphes: string[],
 *   texte: string
 * }
 *
 * @param {Record<string, any>} input
 * @returns {{paragraphes: string[], texte: string}}
 */
export const generateSyntheseFranceTravail = (input = {}) => {
  const seen = new Set()

  const paragraphes = [
    generateSituation(input, seen),
    generateProjet(input, seen),
    generateFreins(input, seen),
    generateCompetences(input, seen),
    generateActions(input, seen),
    generateConclusion(input, seen),
  ].map((item) => toText(item)).filter(Boolean)

  return {
    paragraphes,
    texte: paragraphes.join('\n\n'),
  }
}

export default generateSyntheseFranceTravail