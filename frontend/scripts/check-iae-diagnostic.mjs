import assert from 'node:assert/strict'
import { analyserPisteIAE } from '../src/services/iaeDiagnosticService.js'

const rsaSansEmploi = analyserPisteIAE({
  situation: 'Bénéficiaire du RSA, sans emploi, avec des difficultés d’insertion et une mobilité limitée.',
  freins: ['Mobilité', 'Confiance en soi'],
})

assert.equal(rsaSansEmploi.pertinente, true)
assert.match(rsaSansEmploi.motifs.join(' '), /RSA/)
assert.ok(rsaSansEmploi.propositions.length > 0)

const cuisine = analyserPisteIAE({
  situation: 'Sans emploi, BRSA et en remobilisation.',
  projet: 'Recherche une activité en cuisine ou restauration.',
  freins: ['Mobilité', 'Projet professionnel'],
})

assert.equal(cuisine.pertinente, true)
assert.equal(cuisine.propositions[0].nom, 'INIZIATIVA')
assert.ok(cuisine.propositions.some((item) => item.nom === 'ATLAS Insertion'))

const creation = analyserPisteIAE({
  situation: 'Sans emploi, activité indépendante créée trop vite et revenus insuffisants.',
  projet: 'Développer sa micro-entreprise avec un accompagnement.',
  freins: ['Finances', 'Confiance en soi'],
})

assert.equal(creation.pertinente, true)
assert.equal(creation.propositions[0].nom, 'Créanoi / CIJE')

const retraite = analyserPisteIAE({
  situation: 'Retraite liquidée, souhaite une orientation IAE.',
  freins: ['Projet professionnel', 'Mobilité'],
})

assert.equal(retraite.pertinente, false)
assert.match(retraite.blocages.join(' '), /retraite/i)

const sansSignal = analyserPisteIAE({
  situation: 'Assistante administrative en recherche active avec un projet validé.',
  freins: [],
})

assert.equal(sansSignal.pertinente, false)

console.log('Diagnostic IAE vérifié : 5 scénarios réussis.')
