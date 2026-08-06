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
import {
  CODES_SITUATION_OP2,
  formatCodeSituationOp2,
  normaliserCodeSituationOp2,
} from '../src/data/codesSituationOp2.js'

assert.equal(NOM_PORTEFEUILLE_MUTUALISE, 'Mutualisé')
assert.deepEqual(CODES_SITUATION_OP2.map((item) => item.code), ['EM', 'SP', 'PP', 'RE', 'CE', 'SA', 'IA', 'RT', 'DS'])
assert.equal(normaliserCodeSituationOp2('em'), 'EM')
assert.equal(formatCodeSituationOp2('DS'), 'DS — Suivi délégué (AEJ, CEJ, STF)')
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
assert.match(pageSource, /Code situation OP2/)
assert.doesNotMatch(pageSource, /portefeuillePropose/)
assert.doesNotMatch(pageSource, /portefeuillesCorse/)

const componentSource = await readFile(new URL('../src/components/PortefeuilleMutualiseCard.jsx', import.meta.url), 'utf8')
assert.match(componentSource, /Aucune sanction automatique/i)
assert.match(componentSource, /10 à 15 jours/i)
assert.match(componentSource, /Ouvrir le suivi M6/i)
assert.match(componentSource, /ne correspond pas au portefeuille/i)

console.log('Portefeuille mutualisé vérifié : files, convocations, actions et alertes sans sanction automatique.')
