export const CODES_SITUATION_OP2 = [
  { code: 'EM', label: 'Employable immédiatement' },
  { code: 'SP', label: 'Sociaux Pro' },
  { code: 'PP', label: 'Projet Pro' },
  { code: 'RE', label: 'Retour à l’emploi' },
  { code: 'CE', label: 'Créateur d’entreprise en activité conservée' },
  { code: 'SA', label: 'Saisonnier' },
  { code: 'IA', label: 'Inscription administrative' },
  { code: 'RT', label: 'Retraité de 6 mois à 1 an' },
  { code: 'DS', label: 'Suivi délégué (AIJ, CEJ, intensif FSE)' },
]

export const normaliserCodeSituationOp2 = (value) => {
  const code = String(value || '').trim().toUpperCase()
  return CODES_SITUATION_OP2.some((item) => item.code === code) ? code : ''
}

export const getCodeSituationOp2 = (value) => (
  CODES_SITUATION_OP2.find((item) => item.code === normaliserCodeSituationOp2(value)) || null
)

export const formatCodeSituationOp2 = (value) => {
  const situation = getCodeSituationOp2(value)
  return situation ? `${situation.code} — ${situation.label}` : 'Non renseigné'
}
