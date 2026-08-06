import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  ACTIONS_REMOBILISATION,
  DEFAULT_SUIVI_REMOBILISATION,
  INDICES_CRE,
  compterAlertesRemobilisation,
  genererAlertesRemobilisation,
  normaliserSuiviRemobilisation,
} from '../src/data/suiviRemobilisation.js'

assert.equal(compterAlertesRemobilisation(DEFAULT_SUIVI_REMOBILISATION), 0)
assert.deepEqual(genererAlertesRemobilisation(DEFAULT_SUIVI_REMOBILISATION), [])

const indiceIsole = normaliserSuiviRemobilisation({
  actif: true,
  indicesSelectionnes: ['candidatures'],
  justificatifsParIndice: { candidatures: 'Deux candidatures datées sont présentes dans le dossier.' },
})
assert.equal(genererAlertesRemobilisation(indiceIsole).some((item) => item.id === 'faisceau-insuffisant'), true)

const suiviDocumente = {
  actif: true,
  indicesSelectionnes: ['candidatures', 'contacts-conseiller'],
  justificatifsParIndice: {
    candidatures: 'Candidatures et réponses datées vérifiées dans le dossier.',
    'contacts-conseiller': 'Échanges et rendez-vous des trois derniers mois vérifiés.',
  },
  conclusionHumaine: 'redynamisation',
  analyseGlobale: 'Les deux domaines convergent vers un besoin ponctuel de reprise des démarches.',
  actionCategorie: 'candidatures-mer',
  actionRetenue: 'Déposer trois candidatures ciblées et mettre à jour le profil.',
  dateEcheance: '2026-08-20',
  preuveAttendue: 'Candidatures et profil mis à jour dans le dossier de démarches.',
}
assert.equal(compterAlertesRemobilisation(suiviDocumente), 0)

const suspensionSansProcedure = {
  ...suiviDocumente,
  contexteSuspension: true,
}
assert.equal(genererAlertesRemobilisation(suspensionSansProcedure).some((item) => item.id === 'aucune-levee-automatique'), true)
assert.equal(genererAlertesRemobilisation(suspensionSansProcedure).some((item) => item.id === 'procedure-interne'), true)
assert.equal(compterAlertesRemobilisation(suspensionSansProcedure), 1)
assert.equal(compterAlertesRemobilisation({ ...suspensionSansProcedure, procedureInterneConfirmee: true }), 0)

assert.equal(new Set(INDICES_CRE.map((item) => item.domaine)).size >= 5, true)
assert.equal(ACTIONS_REMOBILISATION.length >= 10, true)

const pageSource = await readFile(new URL('../src/pages/AssistantMissionPage.jsx', import.meta.url), 'utf8')
assert.match(pageSource, /<SuiviRemobilisationCard/)
assert.match(pageSource, /nombreAlertesRemobilisation/)
assert.match(pageSource, /Faisceau CRE/)
assert.match(pageSource, /suiviRemobilisation/)

const componentSource = await readFile(new URL('../src/components/SuiviRemobilisationCard.jsx', import.meta.url), 'utf8')
assert.match(componentSource, /aucun indice isolé ne suffit/i)
assert.match(componentSource, /ne déclenche ni sanction ni levée de suspension/i)
assert.match(componentSource, /procédure interne France Travail/i)

console.log('Faisceau CRE vérifié : domaines distincts, preuves, décision humaine et remobilisation sans automatisation.')
