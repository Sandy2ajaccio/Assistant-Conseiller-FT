import assert from 'node:assert/strict'
import {
  buildFormalitesSynthese,
  formalitesEntretienCompletes,
} from '../src/services/syntheseFormalitesService.js'

const signeCeJour = {
  presenceRappelee: true,
  pixStatut: 'invite',
  contratPresente: true,
  contratStatut: 'signe-ce-jour',
}
const texteSigneCeJour = buildFormalitesSynthese(signeCeJour)
assert.equal(formalitesEntretienCompletes(signeCeJour), true)
assert.match(texteSigneCeJour, /présence est obligatoire/)
assert.match(texteSigneCeJour, /Dans le cas où vous ne l’auriez pas encore fait/)
assert.match(texteSigneCeJour, /droits et obligations/)
assert.ok(texteSigneCeJour.endsWith('Nous procédons à la signature du contrat d’engagement.'))

const dejaSigne = {
  presenceRappelee: true,
  pixStatut: 'deja-realise',
  contratPresente: true,
  contratStatut: 'deja-signe',
}
const texteDejaSigne = buildFormalitesSynthese(dejaSigne)
assert.equal(formalitesEntretienCompletes(dejaSigne), true)
assert.match(texteDejaSigne, /déjà réalisé le test PIX/)
assert.match(texteDejaSigne, /déjà signé/)
assert.doesNotMatch(texteDejaSigne, /procédons à la signature/)

const aConfirmer = buildFormalitesSynthese({})
assert.equal(formalitesEntretienCompletes({}), false)
assert.equal(aConfirmer, '')

const signatureAFinaliser = {
  presenceRappelee: true,
  pixStatut: 'invite',
  contratPresente: true,
  contratStatut: 'signature-a-finaliser',
}
assert.equal(formalitesEntretienCompletes(signatureAFinaliser), true)
assert.ok(buildFormalitesSynthese(signatureAFinaliser).endsWith('La signature du contrat d’engagement reste à finaliser.'))

console.log('Formalités de synthèse vérifiées : 4 scénarios réussis.')
