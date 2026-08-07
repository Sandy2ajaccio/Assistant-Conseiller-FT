import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  DEFAULT_SUIVI_OBLIGATIONS,
  SOURCES_SANCTIONS,
  compterAlertesActionnables,
  genererAlertesSuivi,
  normaliserSuiviObligations,
} from '../src/data/suiviObligations.js'
import {
  REGION_NON_DEFINIE,
  REGISTRE_BAREMES_REGIONAUX,
  getRegionBareme,
  listerRegionsDisponibles,
  regionBaremeExiste,
} from '../src/data/regionsBareme.js'

assert.equal(compterAlertesActionnables(DEFAULT_SUIVI_OBLIGATIONS), 0)
assert.deepEqual(genererAlertesSuivi(DEFAULT_SUIVI_OBLIGATIONS), [])

const suiviIncomplet = normaliserSuiviObligations({ fait: 'obligations-contrat' })
const alertesIncompletes = genererAlertesSuivi(suiviIncomplet, 'corse')
assert.equal(alertesIncompletes.some((item) => item.id === 'repere-juridique'), true)
assert.equal(alertesIncompletes.some((item) => item.id === 'motif-legitime'), true)
assert.equal(alertesIncompletes.some((item) => item.id === 'procedure-interne'), true)
assert.equal(compterAlertesActionnables(suiviIncomplet, 'corse') >= 5, true)

const suiviDocumente = {
  fait: 'obligations-contrat',
  situationDroits: 'droit-ouvert',
  recurrence: 'premier',
  motifLegitime: 'non-signale',
  dateConstat: '2026-08-06',
  elementsFactuels: 'Convocation et échanges à vérifier dans le dossier.',
  procedureInterneConfirmee: true,
}
assert.equal(compterAlertesActionnables(suiviDocumente, 'corse'), 0)
assert.equal(genererAlertesSuivi(suiviDocumente, 'corse').length, 1)

const rsaHorsDroits = {
  ...suiviDocumente,
  situationDroits: 'rsa-hors-droits-devoirs',
}
assert.equal(
  genererAlertesSuivi(rsaHorsDroits, 'corse').some((item) => item.id === 'rsa-hors-droits-devoirs'),
  true,
)
assert.equal(compterAlertesActionnables(rsaHorsDroits, 'corse'), 1)

assert.equal(SOURCES_SANCTIONS.every((source) => source.url.startsWith('https://www.legifrance.gouv.fr/')), true)

// Barème Corse : distinction RSA isolé / RSA plus d'un enfant, DE sans droit
// ouvert et second refus d'ORE pour un BRSA. Aucun de ces cas ne doit produire
// de taux ou de durée calculés — uniquement des repères vers la bonne colonne.
const rsaIsole = { ...suiviDocumente, situationDroits: 'rsa-isole-droits-devoirs' }
assert.equal(
  genererAlertesSuivi(rsaIsole, 'corse').some((item) => item.id === 'rsa-colonne-bareme' && /isol/i.test(item.titre)),
  true,
)
assert.equal(
  genererAlertesSuivi(rsaIsole, 'corse').some((item) => item.id === 'rsa-colonne-bareme' && /corse/i.test(item.titre)),
  true,
  'Le titre doit citer la région active (Corse) plutôt qu\'un texte figé.',
)

const rsaPlusUn = { ...suiviDocumente, situationDroits: 'rsa-plus-un-droits-devoirs' }
assert.equal(
  genererAlertesSuivi(rsaPlusUn, 'corse').some((item) => item.id === 'rsa-colonne-bareme' && /plus d.un enfant/i.test(item.titre)),
  true,
)

const rsaHerite = { ...suiviDocumente, situationDroits: 'rsa-droits-devoirs' }
assert.equal(
  genererAlertesSuivi(rsaHerite, 'corse').some((item) => item.id === 'rsa-composition-a-preciser'),
  true,
)

const deSansDroit = { ...suiviDocumente, situationDroits: 'sans-droit' }
assert.equal(
  genererAlertesSuivi(deSansDroit, 'corse').some((item) => item.id === 'de-sans-droit-ouvert'),
  true,
)

const secondRefusOreBrsa = {
  ...suiviDocumente,
  fait: 'second-refus-ore',
  situationDroits: 'rsa-isole-droits-devoirs',
}
assert.equal(
  genererAlertesSuivi(secondRefusOreBrsa, 'corse').some((item) => item.id === 'second-refus-ore-brsa'),
  true,
)

assert.equal(
  genererAlertesSuivi(suiviDocumente, 'corse').every((item) => !/\d+\s*%|\d+\s*mois/.test(item.message)),
  true,
  'Aucune alerte ne doit afficher un taux ou une durée chiffrée calculée automatiquement.',
)

// Sélection régionale des barèmes ------------------------------------------

assert.equal(REGION_NON_DEFINIE, 'a-definir')
assert.equal(regionBaremeExiste('corse'), true)
assert.equal(regionBaremeExiste('paca'), false, 'La PACA ne doit pas être proposée tant que son barème n\'est pas fourni.')
assert.equal(listerRegionsDisponibles().some((item) => item.value === 'corse'), true)
assert.equal(listerRegionsDisponibles().some((item) => item.value === REGION_NON_DEFINIE), false)
assert.equal(REGISTRE_BAREMES_REGIONAUX.filter((item) => item.disponible).length, 1, 'Seule la Corse doit être disponible pour le moment.')

const regionCorse = getRegionBareme('corse')
assert.equal(regionCorse.disponible, true)
assert.equal(regionCorse.referentiel.chemin, 'docs/referentiels/Bareme_sanctions_Corse_2025-06-01.jpg')

const regionInconnueOuNonDefinie = getRegionBareme('inexistante')
assert.equal(regionInconnueOuNonDefinie.value, REGION_NON_DEFINIE)

// Sans région sélectionnée : une alerte dédiée doit inviter à configurer
// Paramètres, et aucune alerte ne doit mentionner une région au hasard.
const alertesSansRegion = genererAlertesSuivi(suiviDocumente, REGION_NON_DEFINIE)
assert.equal(
  alertesSansRegion.some((item) => item.id === 'region-bareme-non-definie'),
  true,
)
assert.equal(
  alertesSansRegion.every((item) => !/corse/i.test(item.titre) && !/corse/i.test(item.message)),
  true,
  'Sans région choisie, aucune alerte ne doit citer une région en particulier.',
)

// Avec la Corse sélectionnée : les messages doivent citer la région choisie
// et jamais une autre région du registre.
const alertesAvecCorse = genererAlertesSuivi(rsaIsole, 'corse')
const autresRegions = REGISTRE_BAREMES_REGIONAUX.filter((item) => item.disponible && item.value !== 'corse')
assert.equal(
  alertesAvecCorse.every((item) => autresRegions.every((autre) => !item.titre.includes(autre.label) && !item.message.includes(autre.label))),
  true,
)

// Le compteur d'alertes actionnables doit rester cohérent : l'alerte de
// région non définie doit être comptée (niveau warning), pas ignorée.
assert.equal(
  compterAlertesActionnables(suiviDocumente, REGION_NON_DEFINIE) > compterAlertesActionnables(suiviDocumente, 'corse'),
  true,
  'L\'absence de région sélectionnée doit ajouter une alerte actionnable par rapport à une région configurée.',
)

const pageSource = await readFile(new URL('../src/pages/AssistantMissionPage.jsx', import.meta.url), 'utf8')
assert.match(pageSource, /<SuiviObligationsCard/)
assert.match(pageSource, /Alertes M6/)
assert.match(pageSource, /alertesSuiviObligations/)
assert.match(pageSource, /nombreAlertesSuivi > 0/)

const componentSource = await readFile(new URL('../src/components/SuiviObligationsCard.jsx', import.meta.url), 'utf8')
assert.match(componentSource, /ne calcule pas une sanction/i)
assert.match(componentSource, /procédure M6/i)
assert.match(componentSource, /Région du barème applicable/)

const parametresSource = await readFile(new URL('../src/pages/ParametresPage.jsx', import.meta.url), 'utf8')
assert.match(parametresSource, /Région du barème de sanctions/)
assert.match(parametresSource, /REGISTRE_BAREMES_REGIONAUX/)
assert.match(parametresSource, /ecrireRegionBaremePreferee/)

console.log('Suivi sanctions vérifié : alertes M6, sources officielles, sélection régionale et absence de décision automatique.')
