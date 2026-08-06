import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  DEFAULT_TYPE_ENTRETIEN,
  estEntretienOrientation,
  estPremierEntretienAccompagnement,
  getTypeEntretien,
  normaliserContratEngagementDetails,
  normaliserOrientationReseau,
  normaliserTypeEntretien,
  orientationReseauComplete,
} from '../src/data/contratOrientation.js'

assert.equal(DEFAULT_TYPE_ENTRETIEN, 'eda')
assert.equal(normaliserTypeEntretien('premier-physique'), 'eda')
assert.equal(estPremierEntretienAccompagnement('eda'), true)
assert.equal(estEntretienOrientation('edo'), true)
assert.equal(getTypeEntretien('edo').confirmationInterne.length > 0, true)

const orientationValidee = {
  decision: 'acceptee',
  organisme: 'France Travail',
  parcours: 'Parcours professionnel',
  structure: 'Agence test',
  validationHumaine: true,
}
assert.equal(orientationReseauComplete(orientationValidee), true)
assert.equal(orientationReseauComplete({ ...orientationValidee, validationHumaine: false }), false)
assert.equal(orientationReseauComplete({
  ...orientationValidee,
  decision: 'refusee-remplacee',
  motifRefus: '',
}), false)
assert.equal(orientationReseauComplete({
  ...orientationValidee,
  decision: 'refusee-remplacee',
  motifRefus: 'Situation non couverte',
}), true)

assert.deepEqual(normaliserOrientationReseau(), {
  decision: 'a-confirmer',
  organisme: '',
  parcours: '',
  structure: '',
  motifRefus: '',
  commentaire: '',
  validationHumaine: false,
})
assert.equal(normaliserContratEngagementDetails({ intensiteHebdomadaire: 0 }).intensiteHebdomadaire, '0')

const pageSource = await readFile(new URL('../src/pages/AssistantMissionPage.jsx', import.meta.url), 'utf8')
assert.match(pageSource, /<OrientationReseauCard/)
assert.match(pageSource, /contratEngagementDetails/)
assert.match(pageSource, /orientationReseauComplete/)
assert.match(pageSource, /L’intensité saisie est un élément du contrat/)
assert.doesNotMatch(pageSource, /\bDE\b/)
assert.doesNotMatch(pageSource, /demandeur d[’']emploi/i)

console.log('Parcours LPE vérifié : EDO/EDA, orientation humaine, contrat structuré et libellés centrés sur la personne.')
