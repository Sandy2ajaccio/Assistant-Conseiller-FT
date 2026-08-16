import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyserAdvpAutomatique } from '../src/services/advpAssistantService.js'
import { analyserCoherenceCategorie, CATEGORIES_DEMANDEURS_EMPLOI } from '../src/data/categoriesDemandeursEmploi.js'
import { analyserSuiviAccompagnement } from '../src/services/suiviAccompagnementService.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const sourcePage = fs.readFileSync(path.join(here, '../src/pages/AssistantMissionPage.jsx'), 'utf8')
const sourcePortefeuille = fs.readFileSync(path.join(here, '../src/components/PortefeuilleMutualiseCard.jsx'), 'utf8')

const exploration = analyserAdvpAutomatique({
  demande: '20 ans dans la boulangerie, 56 ans, ne souhaite plus faire ce métier et n’a pas de projet',
  parcoursProfessionnel: 'Projet professionnel à préciser',
})
assert.equal(exploration.phase, 'Explorer')
assert.notEqual(exploration.confiance, 'Prudente')
assert.ok(exploration.questions.length >= 3)
assert.ok(exploration.services.some((item) => item.nom === "Activ'Projet"))

const realisation = analyserAdvpAutomatique({
  demande: 'Recherche active, CV prêt, souhaite postuler à des offres et préparer un entretien',
  projet: 'Employé administratif',
})
assert.equal(realisation.phase, 'Realiser')

assert.equal(CATEGORIES_DEMANDEURS_EMPLOI.length, 10)
const categorie4 = analyserCoherenceCategorie({
  categorieActuelle: '1',
  situationAdministrative: 'Sans emploi',
  situationPersonnelle: 'Non disponible actuellement car formation en cours',
})
assert.ok(categorie4.candidats.some((item) => item.numero === 4))
assert.equal(categorie4.changementAEnvisager, true)

const categorie10 = analyserCoherenceCategorie({
  categorieActuelle: '1',
  situationAdministrative: 'Bénéficiaire du RSA · Primo-inscrit · Contrat d’engagement à signer',
})
assert.ok(categorie10.candidats.some((item) => item.numero === 10))

const suiviGlobal = analyserSuiviAccompagnement({
  demande: 'Besoin de coordination avec le travailleur social, logement instable',
  freins: ['Logement', 'Finances', 'Mobilite'],
  categorie: '9',
})
assert.equal(suiviGlobal.conseille, 'global')

const suiviEssentiel = analyserSuiviAccompagnement({
  demande: 'Recherche active emploi, disponible immédiatement et autonome',
  projet: 'Vendeur en CDI',
  ressources: ['Autonomie', 'Motivation'],
})
assert.equal(suiviEssentiel.conseille, 'essentiel')

const suiviProjetFlou = analyserSuiviAccompagnement({
  demande: 'Personne autonome mais n’a pas encore de projet défini et souhaite se reconvertir',
  ressources: ['Autonomie'],
})
assert.equal(suiviProjetFlou.conseille, 'renforce')

const suiviIa = analyserSuiviAccompagnement({
  demande: 'Inscription administrative à vérifier',
  codeSituationOp2: 'IA',
})
assert.ok(suiviIa.aVerifier.some((item) => /ne pas convoquer/i.test(item)))

assert.ok(sourcePage.includes('+ Ajouter une note conseiller différente (facultatif)'))
assert.ok(!sourcePage.includes('setBesoinIdentifieConseiller(nextValue)'))
assert.ok(sourcePage.includes('Copilote ADVP automatique'))
assert.ok(sourcePage.includes('Contrôle intelligent de la catégorie'))
assert.ok(sourcePage.includes('Conseil sur le portefeuille de suivi'))
assert.ok(sourcePortefeuille.includes('IA — ne pas convoquer'))
assert.ok(sourcePortefeuille.includes('disabled={dossierInscriptionAdministrative}'))

console.log('Copilote ADVP, catégories, suivi conseillé, règle IA et anti-redondance vérifiés.')
