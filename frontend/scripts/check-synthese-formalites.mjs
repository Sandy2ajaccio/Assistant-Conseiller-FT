import assert from 'node:assert/strict'
import {
  buildFormalitesSynthese,
  formalitesEntretienCompletes,
  RAPPEL_PIX_FINAL,
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
assert.match(texteSigneCeJour, /droits et obligations/)
assert.ok(texteSigneCeJour.endsWith('Nous procédons à la signature du contrat d’engagement.'))
assert.doesNotMatch(texteSigneCeJour, /test PIX/)

const dejaSigne = {
  presenceRappelee: true,
  pixStatut: 'deja-realise',
  contratPresente: true,
  contratStatut: 'deja-signe',
}
const texteDejaSigne = buildFormalitesSynthese(dejaSigne)
assert.equal(formalitesEntretienCompletes(dejaSigne), true)
assert.match(texteDejaSigne, /déjà signé/)
assert.doesNotMatch(texteDejaSigne, /procédons à la signature/)
assert.doesNotMatch(texteDejaSigne, /test PIX/)

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

const syntheseFinale = [texteSigneCeJour, RAPPEL_PIX_FINAL].filter(Boolean).join('\n')
assert.ok(syntheseFinale.endsWith(RAPPEL_PIX_FINAL))
assert.equal((syntheseFinale.match(/test PIX/g) || []).length, 1)
assert.match(RAPPEL_PIX_FINAL, /^Si vous ne l’avez pas déjà réalisé depuis chez vous/)

console.log('Formalités et rappel PIX final vérifiés : 4 scénarios réussis.')
