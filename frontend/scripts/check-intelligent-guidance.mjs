import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyserAdvpAutomatique } from '../src/services/advpAssistantService.js'
import { analyserCoherenceCategorie, CATEGORIES_DEMANDEURS_EMPLOI } from '../src/data/categoriesDemandeursEmploi.js'
import { analyserSuiviAccompagnement } from '../src/services/suiviAccompagnementService.js'
import { analyserControlesAutomatiquesDossier } from '../src/services/controlesAutomatiquesDossierService.js'

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
assert.ok(suiviGlobal.pistesSpecialisees.some((item) => item.id === 'glo'))
assert.ok(suiviGlobal.aVerifier.some((item) => /Marie-Jeanne/.test(item)))

const suiviEssentiel = analyserSuiviAccompagnement({
  demande: 'Recherche active emploi, disponible immédiatement et autonome',
  projet: 'Vendeur en CDI',
  ressources: ['Autonomie', 'Motivation'],
})
assert.equal(suiviEssentiel.conseille, 'essentiel')
assert.ok(suiviEssentiel.aVerifier.some((item) => /portefeuille d’attente/.test(item)))

const suiviProjetFlou = analyserSuiviAccompagnement({
  demande: 'Personne autonome mais n’a pas encore de projet défini et souhaite se reconvertir',
  ressources: ['Autonomie'],
})
assert.equal(suiviProjetFlou.conseille, 'renforce')

const suiviRegardCroise = analyserSuiviAccompagnement({
  demande: 'Reconversion bloquée, perte de confiance et difficulté à choisir une nouvelle orientation professionnelle',
  freins: ['Confiance en soi'],
})
assert.equal(suiviRegardCroise.regardCroiseConseille, true)
assert.ok(suiviRegardCroise.pistesSpecialisees.some((item) => item.id === 'regards-croises'))

const suiviIa = analyserSuiviAccompagnement({
  demande: 'Inscription administrative à vérifier',
  codeSituationOp2: 'IA',
})
assert.ok(suiviIa.aVerifier.some((item) => /ne (?:pas|jamais) convoquer/i.test(item)))

const suiviRe = analyserSuiviAccompagnement({
  demande: 'Recherche active et autonome',
  projet: 'Employé administratif',
  codeSituationOp2: 'RE',
})
assert.equal(suiviRe.conseille, 'essentiel')
assert.ok(suiviRe.aVerifier.some((item) => /techniques de recherche d’emploi/.test(item)))

const suiviPp = analyserSuiviAccompagnement({
  demande: 'Projet professionnel à construire',
  codeSituationOp2: 'PP',
})
assert.equal(suiviPp.conseille, 'renforce')

const suiviDs = analyserSuiviAccompagnement({
  demande: 'Suivi délégué à confirmer',
  codeSituationOp2: 'DS',
})
assert.equal(suiviDs.conseille, 'renforce')
assert.ok(suiviDs.aVerifier.some((item) => /AIJ, CEJ ou intensif FSE/.test(item)))

const controlesSansSignal = analyserControlesAutomatiquesDossier({
  record: { identifiant: 'TEST001', profils: ['are'] },
})
assert.equal(controlesSansSignal.obligations.statut, 'ok')
assert.equal(controlesSansSignal.obligations.situationDroitsSuggeree, 'droit-ouvert')
assert.equal(controlesSansSignal.cre.faisceauAExaminer, false)

const controlesAvertissement = analyserControlesAutomatiquesDossier({
  record: {
    identifiant: 'TEST002',
    profils: ['mobilite', 'projet_a_confirmer'],
    alerte: 'Avertissement après absence à un rendez-vous',
    dateInscription: '2024-01-10',
  },
})
assert.equal(controlesAvertissement.obligations.faitSuggere, 'obligations-contrat')
assert.equal(controlesAvertissement.obligations.statut, 'a-verifier')
assert.equal(controlesAvertissement.cre.faisceauAExaminer, true)
assert.ok(controlesAvertissement.cre.indices.length >= 2)

const controlesIa = analyserControlesAutomatiquesDossier({
  record: { identifiant: 'TEST003' },
  dossier: { codeSituationOp2: 'IA' },
})
assert.equal(controlesIa.nePasConvoquer, true)

assert.ok(sourcePage.includes('+ Ajouter une note conseiller différente (facultatif)'))
assert.ok(!sourcePage.includes('setBesoinIdentifieConseiller(nextValue)'))
assert.ok(sourcePage.includes('Copilote ADVP automatique'))
assert.ok(sourcePage.includes('Contrôle intelligent de la catégorie'))
assert.ok(sourcePage.includes('Conseil sur le portefeuille de suivi'))
assert.ok(sourcePage.includes('ControlesAutomatiquesDossierCard'))
assert.ok(sourcePage.includes('Suivi obligations · détail à confirmer'))
assert.ok(sourcePage.includes('Je demande votre transfert vers le mode d’accompagnement Global, adapté à votre situation.'))
assert.ok(sourcePage.includes('Je vous oriente vers la prestation Regards croisés avec un psychologue du travail de France Travail afin d’approfondir votre situation et de préciser votre projet professionnel.'))
assert.ok(sourcePortefeuille.includes('IA — ne pas convoquer'))
assert.ok(sourcePortefeuille.includes('disabled={dossierInscriptionAdministrative}'))
assert.ok(!sourcePage.includes('Suivi et prochaine action convenus : ${suiviPortefeuilleMutualise.commentaire.trim()}'))
assert.ok(sourcePage.includes('Vous avez besoin de travailler votre CV ainsi que votre projet professionnel.'))
assert.ok(sourcePage.includes('Demander cette catégorie'))
assert.ok(sourcePage.includes('Je demande également votre passage en catégorie'))
assert.ok(sourcePage.includes('suiviAccompagnementChoisi || conseilSuiviAccompagnement.conseille'))
assert.ok(sourcePage.includes("o[uù] il en (?:ai|est)"))
assert.ok(sourcePage.includes("^[aà]\\s+"))

console.log('Copilote ADVP, catégories, suivi conseillé, contrôles automatiques M6/CRE, règle IA et anti-redondance vérifiés.')
