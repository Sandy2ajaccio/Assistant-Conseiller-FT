export const DEFAULT_FORMALITES_ENTRETIEN = {
  presenceRappelee: false,
  pixStatut: 'a-confirmer',
  contratPresente: false,
  contratStatut: 'a-confirmer',
}

export const RAPPEL_PIX_FINAL = 'Si vous ne l’avez pas déjà réalisé depuis chez vous, merci de réaliser le test PIX. Cela vous évitera d’être appelé(e) à venir réaliser cet atelier sur place.'

export const retirerAgeDeSynthese = (value = '') => String(value)
  .replace(/(?:âgé(?:e)?\s+de|âge\s*:?|j['’]ai|vous avez|à l['’]âge de|à)\s*(?:1[6-9]|[2-9]\d|100)\s*ans\b/gi, '')
  .replace(/(^|[,.]\s*)(?:1[6-9]|[2-9]\d|100)\s*ans(?=\s*[,.;]|$)/gi, '$1')
  .replace(/\s+,/g, ',')
  .replace(/,\s*,+/g, ', ')
  .replace(/(^|[.!?]\s*)[,;]\s*/g, '$1')
  .replace(/\s{2,}/g, ' ')
  .trim()

export const normalizeFormalitesEntretien = (value = {}) => ({
  ...DEFAULT_FORMALITES_ENTRETIEN,
  ...(value && typeof value === 'object' ? value : {}),
  presenceRappelee: value?.presenceRappelee === true,
  contratPresente: value?.contratPresente === true,
})

export const formalitesEntretienCompletes = (value = {}) => {
  const formalites = normalizeFormalitesEntretien(value)
  return (
    formalites.presenceRappelee
    && ['invite', 'deja-realise'].includes(formalites.pixStatut)
    && formalites.contratPresente
    && ['signe-ce-jour', 'deja-signe', 'signature-a-finaliser'].includes(formalites.contratStatut)
  )
}

export const buildFormalitesSynthese = (value = {}) => {
  const formalites = normalizeFormalitesEntretien(value)
  const phrases = []

  if (formalites.presenceRappelee) {
    phrases.push(
      'Je vous rappelle que, dans le cadre de la loi pour le plein emploi, votre contrat d’engagement prévoit votre assiduité et votre participation active aux actions inscrites dans votre plan d’action, notamment aux rendez-vous fixés par France Travail.',
    )
  }

  if (formalites.contratPresente) {
    phrases.push('Je vous présente le contrat d’engagement, vos droits et obligations.')
  }

  if (formalites.contratStatut === 'signe-ce-jour') {
    phrases.push('Nous procédons à la signature du contrat d’engagement.')
  } else if (formalites.contratStatut === 'deja-signe') {
    phrases.push('Votre contrat d’engagement étant déjà signé, nous en confirmons les engagements.')
  } else if (formalites.contratStatut === 'signature-a-finaliser') {
    phrases.push('La signature du contrat d’engagement reste à finaliser.')
  }

  return phrases.join(' ')
}
