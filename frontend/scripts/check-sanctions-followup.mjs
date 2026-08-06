import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  DEFAULT_SUIVI_OBLIGATIONS,
  SOURCES_SANCTIONS,
  compterAlertesActionnables,
  genererAlertesSuivi,
  normaliserSuiviObligations,
} from '../src/data/suiviObligations.js'

assert.equal(compterAlertesActionnables(DEFAULT_SUIVI_OBLIGATIONS), 0)
assert.deepEqual(genererAlertesSuivi(DEFAULT_SUIVI_OBLIGATIONS), [])

const suiviIncomplet = normaliserSuiviObligations({ fait: 'obligations-contrat' })
const alertesIncompletes = genererAlertesSuivi(suiviIncomplet)
assert.equal(alertesIncompletes.some((item) => item.id === 'repere-juridique'), true)
assert.equal(alertesIncompletes.some((item) => item.id === 'motif-legitime'), true)
assert.equal(alertesIncompletes.some((item) => item.id === 'procedure-interne'), true)
assert.equal(compterAlertesActionnables(suiviIncomplet) >= 5, true)

const suiviDocumente = {
  fait: 'obligations-contrat',
  situationDroits: 'droit-ouvert',
  recurrence: 'premier',
  motifLegitime: 'non-signale',
  dateConstat: '2026-08-06',
  elementsFactuels: 'Convocation et échanges à vérifier dans le dossier.',
  procedureInterneConfirmee: true,
}
assert.equal(compterAlertesActionnables(suiviDocumente), 0)
assert.equal(genererAlertesSuivi(suiviDocumente).length, 1)

const rsaHorsDroits = {
  ...suiviDocumente,
  situationDroits: 'rsa-hors-droits-devoirs',
}
assert.equal(
  genererAlertesSuivi(rsaHorsDroits).some((item) => item.id === 'rsa-hors-droits-devoirs'),
  true,
)
assert.equal(compterAlertesActionnables(rsaHorsDroits), 1)

assert.equal(SOURCES_SANCTIONS.every((source) => source.url.startsWith('https://www.legifrance.gouv.fr/')), true)

const pageSource = await readFile(new URL('../src/pages/AssistantMissionPage.jsx', import.meta.url), 'utf8')
assert.match(pageSource, /<SuiviObligationsCard/)
assert.match(pageSource, /Alertes M6/)
assert.match(pageSource, /alertesSuiviObligations/)
assert.match(pageSource, /nombreAlertesSuivi > 0/)

const componentSource = await readFile(new URL('../src/components/SuiviObligationsCard.jsx', import.meta.url), 'utf8')
assert.match(componentSource, /ne calcule pas une sanction/i)
assert.match(componentSource, /procédure M6/i)

console.log('Suivi sanctions vérifié : alertes M6, sources officielles et absence de décision automatique.')
