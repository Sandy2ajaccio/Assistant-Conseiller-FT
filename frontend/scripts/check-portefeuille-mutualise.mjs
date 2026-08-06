import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  ACTIONS_MUTUALISEES,
  DEFAULT_SUIVI_PORTEFEUILLE_MUTUALISE,
  NOM_PORTEFEUILLE_MUTUALISE,
  compterAlertesPortefeuilleMutualise,
  genererAlertesPortefeuilleMutualise,
  getFilePortefeuilleMutualise,
  normaliserSuiviPortefeuilleMutualise,
} from '../src/data/portefeuilleMutualise.js'

assert.equal(NOM_PORTEFEUILLE_MUTUALISE, 'Mutualisé')
assert.equal(compterAlertesPortefeuilleMutualise(DEFAULT_SUIVI_PORTEFEUILLE_MUTUALISE), 1)
assert.equal(genererAlertesPortefeuilleMutualise(DEFAULT_SUIVI_PORTEFEUILLE_MUTUALISE)[0].id, 'file-a-definir')

const fileRdvl = getFilePortefeuilleMutualise('rdvl')
const actionsRdvl = Object.fromEntries(fileRdvl.actions.map((actionId) => [actionId, true]))
const rdvlComplet = {
  file: 'rdvl',
  dateConvocation: '2026-08-10',
  dateRendezVous: '2026-08-24',
  modaliteRendezVous: 'visio',
  actionsRealisees: actionsRdvl,
}
assert.equal(compterAlertesPortefeuilleMutualise(rdvlComplet), 0)
assert.equal(
  genererAlertesPortefeuilleMutualise({ ...rdvlComplet, modaliteRendezVous: 'presentiel' })
    .some((item) => item.id === 'rdvl-visio'),
  true,
)
assert.equal(
  genererAlertesPortefeuilleMutualise({ ...rdvlComplet, dateRendezVous: '2026-08-30' })
    .some((item) => item.id === 'delai-convocation'),
  true,
)

const avertir = normaliserSuiviPortefeuilleMutualise({ file: 'a-avertir' })
assert.equal(genererAlertesPortefeuilleMutualise(avertir).some((item) => item.id === 'procedure-interne'), true)
assert.equal(genererAlertesPortefeuilleMutualise(avertir).some((item) => item.id === 'aucune-sanction-automatique'), true)
assert.equal(Object.values(ACTIONS_MUTUALISEES).some((label) => /automatique/i.test(label)), false)

const pageSource = await readFile(new URL('../src/pages/AssistantMissionPage.jsx', import.meta.url), 'utf8')
assert.match(pageSource, /<PortefeuilleMutualiseCard/)
assert.match(pageSource, /NOM_PORTEFEUILLE_MUTUALISE/)
assert.match(pageSource, /nombreAlertesPortefeuille/)
assert.match(pageSource, /Portefeuille mutualisé/)

const componentSource = await readFile(new URL('../src/components/PortefeuilleMutualiseCard.jsx', import.meta.url), 'utf8')
assert.match(componentSource, /Aucune sanction automatique/i)
assert.match(componentSource, /10 à 15 jours/i)
assert.match(componentSource, /Ouvrir le suivi M6/i)

console.log('Portefeuille mutualisé vérifié : files, convocations, actions et alertes sans sanction automatique.')
