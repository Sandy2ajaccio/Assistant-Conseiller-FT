import assert from 'node:assert/strict'
import { analyseDiagnostic } from '../src/services/diagnosticService.js'

const dossierReference = {
  age: 42,
  projet: 'Recherche un poste de comptable correspondant à son expérience.',
  cvVisible: true,
  rechercheEmploi: 'active',
  dpaRealisee: true,
  premierEntretienRealise: true,
  contratEngagement: 'Oui',
  experience: '10 ans en comptabilité',
  formation: 'BTS comptabilité',
  freins: [],
  ateliers: [],
  prestations: [],
  formations: [],
}

const indicateursComparables = (resultat) => ({
  autonomie: resultat.autonomie,
  distanceEmploi: resultat.distanceEmploi,
  maturiteProjet: resultat.maturiteProjet,
  employabilite: resultat.employabilite,
  urgence: resultat.urgence,
  scoreGlobal: resultat.scoreGlobal,
})

const reference = analyseDiagnostic(dossierReference)

for (const [statut, dossier] of Object.entries({
  ARE: { ...dossierReference, are: true },
  RSA: { ...dossierReference, rsa: true },
  RQTH: { ...dossierReference, reconnaissanceTH: true },
})) {
  const resultat = analyseDiagnostic(dossier)
  assert.deepEqual(
    indicateursComparables(resultat),
    indicateursComparables(reference),
    `${statut} ne doit pas modifier seul les indicateurs métier.`,
  )
  assert.equal(
    resultat.freinsDetectes.some((frein) => new RegExp(statut, 'i').test(frein)),
    false,
    `${statut} ne doit pas être transformé automatiquement en frein.`,
  )
}

const rqthAvecRestriction = analyseDiagnostic({
  ...dossierReference,
  reconnaissanceTH: true,
  freins: ['Handicap avec restriction fonctionnelle confirmée'],
})
assert.ok(rqthAvecRestriction.freinsDetectes.some((frein) => /restriction fonctionnelle/i.test(frein)))
assert.ok(rqthAvecRestriction.scoreGlobal < reference.scoreGlobal)

const projetNonValide = analyseDiagnostic({
  ...dossierReference,
  dpaRealisee: false,
  premierEntretienRealise: false,
  projet: 'Description longue d’une possibilité professionnelle qui reste entièrement à confirmer.',
})
const projetValide = analyseDiagnostic({
  ...dossierReference,
  dpaRealisee: false,
  premierEntretienRealise: false,
  projet: 'Description longue d’une possibilité professionnelle qui reste entièrement à confirmer.',
  projetValide: true,
})
assert.ok(projetValide.maturiteProjet > projetNonValide.maturiteProjet)
assert.ok(projetValide.scoreGlobal > projetNonValide.scoreGlobal)

const unFrein = analyseDiagnostic({
  ...dossierReference,
  freins: ['Mobilité'],
  nombreFreins: 1,
})
assert.equal(unFrein.freinsDetectes.includes('Freins multiples'), false)

const deuxFreins = analyseDiagnostic({
  ...dossierReference,
  freins: ['Mobilité', 'Logement'],
  nombreFreins: 2,
})
assert.equal(deuxFreins.freinsDetectes.includes('Freins multiples'), true)

console.log('Équité du diagnostic vérifiée : 7 scénarios réussis.')
