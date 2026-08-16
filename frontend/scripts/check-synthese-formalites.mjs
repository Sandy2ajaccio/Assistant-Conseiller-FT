import assert from 'node:assert/strict'
import {
  buildFormalitesSynthese,
  formalitesEntretienCompletes,
  RAPPEL_PIX_FINAL,
  retirerAgeDeSynthese,
} from '../src/services/syntheseFormalitesService.js'

const signeCeJour = {
  presenceRappelee: true,
  pixStatut: 'invite',
  contratPresente: true,
  contratStatut: 'signe-ce-jour',
}
const texteSigneCeJour = buildFormalitesSynthese(signeCeJour)
assert.equal(formalitesEntretienCompletes(signeCeJour), true)
assert.match(texteSigneCeJour, /loi pour le plein emploi/)
assert.match(texteSigneCeJour, /assiduité et votre participation active/)
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

const syntheseFinale = [RAPPEL_PIX_FINAL, texteSigneCeJour].filter(Boolean).join('\n')
assert.ok(syntheseFinale.indexOf(RAPPEL_PIX_FINAL) < syntheseFinale.indexOf('loi pour le plein emploi'))
assert.equal((syntheseFinale.match(/test PIX/g) || []).length, 1)
assert.match(RAPPEL_PIX_FINAL, /^Si vous ne l’avez pas déjà réalisé depuis chez vous/)

const texteSansAge = retirerAgeDeSynthese('20 ans dans la boulangerie, ne souhaite plus exercer ce métier, à 56 ans, sans projet défini.')
assert.match(texteSansAge, /20 ans dans la boulangerie/)
assert.doesNotMatch(texteSansAge, /56 ans/)

console.log('Formalités, ordre PIX et retrait de l’âge vérifiés : 5 scénarios réussis.')
