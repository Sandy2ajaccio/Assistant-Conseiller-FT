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
}
assert.deepEqual(generatePortfolioAlerts(complete, now), [])

const summary = getPortfolioAlertSummary([{ identifiant: 'IA001', codeSituationOp2: 'IA' }, complete], now)
assert.equal(summary.dossiersAvecAlertes, 1)
assert.equal(summary.dossiersUrgents, 1)
assert.equal(summary.dossiersAJour, 1)

console.log('Alertes portefeuille vérifiées : urgence, IA, M6, échéances, contrat, parcours, actions, handicap et freins.')
