export const DEFAULT_FORMALITES_ENTRETIEN = {
  presenceRappelee: false,
  pixStatut: 'a-confirmer',
  contratPresente: false,
  contratStatut: 'a-confirmer',
}

export const RAPPEL_PIX_FINAL = 'Si vous ne l’avez pas déjà réalisé depuis chez vous, merci de réaliser le test PIX. Cela vous évitera d’être appelé(e) à venir réaliser cet atelier sur place.'

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
      'Je vous rappelle que votre présence est obligatoire à tous les rendez-vous fixés par France Travail dans le cadre de votre accompagnement.',
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
