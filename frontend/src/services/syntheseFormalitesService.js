export const DEFAULT_FORMALITES_ENTRETIEN = {
  presenceRappelee: false,
  pixStatut: 'a-confirmer',
  contratPresente: false,
  contratStatut: 'a-confirmer',
}

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

  if (formalites.pixStatut === 'invite') {
    phrases.push(
      'Dans le cas où vous ne l’auriez pas encore fait, je vous invite à réaliser à votre domicile le test PIX depuis votre espace personnel France Travail. Cela vous évitera une convocation à cet atelier, que vous pouvez réaliser depuis chez vous.',
    )
  } else if (formalites.pixStatut === 'deja-realise') {
    phrases.push(
      'Vous m’indiquez avoir déjà réalisé le test PIX depuis votre espace personnel France Travail.',
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
