import assert from 'node:assert/strict'
import { generatePortfolioAlerts, getPortfolioAlertSummary } from '../src/services/portfolioAlertsService.js'

const now = new Date(2026, 7, 16, 12)

const ia = generatePortfolioAlerts({ identifiant: 'IA001', codeSituationOp2: 'IA' }, now)
assert.equal(ia[0].id, 'ia-ne-pas-convoquer')
assert.match(ia[0].titre, /ne jamais convoquer/i)

const m6 = generatePortfolioAlerts({ identifiant: 'M6001', alerte: 'Absence au rendez-vous, avertissement envoyé' }, now)
assert.ok(m6.some((item) => item.id === 'm6-a-verifier'))
assert.ok(m6.some((item) => /Aucune sanction automatique/i.test(item.action)))

const overdue = generatePortfolioAlerts({
  identifiant: 'RET001',
  dateRappel: '10/08/2026',
  echeance: '15/08/2026',
  contratEngagement: 'Signé',
  parcoursProfessionnel: 'Recherche active',
  action: 'Candidatures à réaliser',
}, now)
assert.ok(overdue.some((item) => item.id === 'rappel-overdue'))
assert.ok(overdue.some((item) => item.id === 'echeance-overdue'))

const incomplete = generatePortfolioAlerts({ identifiant: 'INC001', profils: ['rqth', 'mobilite'] }, now)
assert.ok(incomplete.some((item) => item.id === 'contrat-a-verifier'))
assert.ok(incomplete.some((item) => item.id === 'civilite-manquante'))
assert.ok(incomplete.some((item) => item.id === 'parcours-manquant'))
assert.ok(incomplete.some((item) => item.id === 'action-manquante'))
assert.ok(incomplete.some((item) => item.id === 'frein-sans-solution'))
assert.ok(incomplete.some((item) => item.id === 'handicap-a-verifier'))

const complete = {
  identifiant: 'OK001',
  civilite: 'Mme',
  contratEngagement: 'Signé',
  parcoursProfessionnel: 'Projet défini et recherche active',
  action: 'Candidatures ciblées',
  statut: 'En cours',
  categorieActuelle: '1',
}
assert.deepEqual(generatePortfolioAlerts(complete, now), [])

const importedFollowUp = generatePortfolioAlerts({
  identifiant: 'IMP001',
  civilite: 'Mme',
  categorieActuelle: '2',
  dateDernierContact: '2026-03-01',
  dateProchainJalon: '2026-08-15',
  dateConvocation: '2026-08-15',
  motifProchainJalon: 'FIN DE FORMATION',
  nombreActionsConseillees: 5,
  nombreActionsEnCoursOuTerminees: 2,
  statutProfil: 'Non visible par les recruteurs',
  oreAContractualiser: 'OUI',
  consentementPromotionProfil: 'Non renseigné',
  indisponibiliteEnCours: 'OUI',
}, now)
assert.ok(importedFollowUp.some((item) => item.id === 'contact-ancien'))
assert.ok(importedFollowUp.some((item) => item.id === 'jalon-overdue'))
assert.ok(importedFollowUp.some((item) => item.id === 'convocation-overdue'))
assert.ok(importedFollowUp.some((item) => item.id === 'actions-a-suivre'))
assert.ok(importedFollowUp.some((item) => item.id === 'profil-non-visible'))
assert.ok(importedFollowUp.some((item) => item.id === 'ore-a-contractualiser'))
assert.ok(importedFollowUp.some((item) => item.id === 'consentement-a-renseigner'))
assert.ok(importedFollowUp.some((item) => item.id === 'indisponibilite-en-cours'))
assert.ok(importedFollowUp.some((item) => item.id === 'bilan-action-a-faire'))

const radiation = generatePortfolioAlerts({ identifiant: 'RAD001', motifProchainJalon: 'A radier' }, now)
assert.ok(radiation.some((item) => item.id === 'radiation-a-verifier'))
assert.ok(radiation.some((item) => /Aucune radiation automatique/i.test(item.action)))

const importStatuses = [
  ['action_requise', 'import-action-requise'],
  ['a_reconvoquer', 'import-a-reconvoquer'],
  ['a_avertir', 'import-a-avertir'],
  ['a_signaler_cre', 'import-a-signaler-cre'],
  ['a_recontacter', 'import-a-recontacter'],
]
importStatuses.forEach(([status, expectedAlert]) => {
  const alerts = generatePortfolioAlerts({ identifiant: `SUIVI-${status}`, statutSuiviImport: status }, now)
  assert.ok(alerts.some((item) => item.id === expectedAlert))
})
assert.ok(generatePortfolioAlerts({ identifiant: 'AVERTIR', statutSuiviImport: 'a_avertir' }, now)
  .some((item) => /Aucune décision automatique/i.test(item.action)))

const summary = getPortfolioAlertSummary([{ identifiant: 'IA001', codeSituationOp2: 'IA' }, complete], now)
assert.equal(summary.dossiersAvecAlertes, 1)
assert.equal(summary.dossiersUrgents, 1)
assert.equal(summary.dossiersAJour, 1)

console.log('Alertes portefeuille vérifiées : urgence, IA, M6, échéances, contrat, parcours, actions, handicap et freins.')
