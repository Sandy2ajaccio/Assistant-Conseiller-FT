import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'
import {
  anonymiserPortfolioRecord,
  buildPortfolioPatchFromDossier,
  inferImportMotifFromFilename,
  mapPortfolioRow,
  PORTFOLIO_TRACKING_STATUS_OPTIONS,
  portfolioRecordToDossier,
  trackingStatusFromCellStyle,
} from '../src/services/portfolioImportService.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const sourcePortfolioPanel = fs.readFileSync(path.join(here, '../src/components/PortfolioManagementPanel.jsx'), 'utf8')

const workbook = XLSX.utils.book_new()
const worksheet = XLSX.utils.json_to_sheet([
  {
    Identifiant: 'TEST123',
    Nom: 'EXEMPLE',
    Prénom: 'Camille',
    Âge: 42,
    'Ancienneté dans la modalité en cours (DE) (mois)': 18,
    'Date dernier contact': '01/08/2026',
    'Prochain jalon perso.': '20/08/2026',
    'Motif prochain jalon': 'ENTRETIEN DE SUIVI',
    'Date convoc.': '20/08/2026',
    'Nb actions conseillées': 4,
    'Nb actions en cours ou terminées': 2,
    'Statut du profil': 'Non visible par les recruteurs',
    'Date dernière modification': '02/08/2026',
    'Acteur dernière modification': 'Conseiller',
    'ORE à contractualiser': 'OUI',
    'Consentement promotion de profil': 'Non renseigné',
    Commune: 'AJACCIO',
    Canton: 'AJACCIO-1',
    'Cat.': 2,
    'Indispo. en cours': 'NON',
    'DELD / DETLD': 'DELD, DETLD',
  },
])
XLSX.utils.book_append_sheet(workbook, worksheet, 'Suivi DE')

const binary = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
const parsedWorkbook = XLSX.read(binary, { type: 'buffer', cellDates: true })
const parsedRows = XLSX.utils.sheet_to_json(parsedWorkbook.Sheets['Suivi DE'], { defval: '' })

assert.equal(parsedRows.length, 1)
assert.equal(parsedRows[0].Identifiant, 'TEST123')
assert.equal(parsedRows[0].Nom, 'EXEMPLE')
assert.equal(parsedRows[0].Prénom, 'Camille')
assert.equal(parsedRows[0].Âge, 42)
assert.equal(parsedRows[0]['Nb actions conseillées'], 4)

const mapped = mapPortfolioRow(parsedRows[0])
assert.equal(mapped.identifiant, 'TEST123')
assert.equal(mapped.nom, undefined)
assert.equal(mapped.prenom, undefined)
assert.equal(mapped.appartientMonPortefeuille, true)
assert.equal(mapped.portefeuilleRattachement, 'Mon portefeuille')
assert.equal(mapped.ancienneteModaliteMois, 18)
assert.equal(mapped.dateDernierContact, '2026-08-01')
assert.equal(mapped.dateProchainJalon, '2026-08-20')
assert.equal(mapped.motifProchainJalon, 'ENTRETIEN DE SUIVI')
assert.equal(mapped.dateConvocation, '2026-08-20')
assert.equal(mapped.nombreActionsConseillees, 4)
assert.equal(mapped.nombreActionsEnCoursOuTerminees, 2)
assert.equal(mapped.statutProfil, 'Non visible par les recruteurs')
assert.equal(mapped.oreAContractualiser, 'OUI')
assert.equal(mapped.consentementPromotionProfil, 'Non renseigné')
assert.equal(mapped.commune, 'AJACCIO')
assert.equal(mapped.canton, 'AJACCIO-1')
assert.equal(mapped.categorieActuelle, '2')
assert.equal(mapped.indisponibiliteEnCours, 'NON')
assert.equal(mapped.deldDetld, 'DELD, DETLD')
assert.ok(mapped.profils.includes('categorie_2'))
assert.equal(trackingStatusFromCellStyle({ patternType: 'solid', fgColor: { rgb: 'FFFF00' } }), 'en_cours')
assert.equal(trackingStatusFromCellStyle({ patternType: 'solid', fgColor: { rgb: '00B050' } }), 'realise')
assert.equal(trackingStatusFromCellStyle({ patternType: 'solid', fgColor: { rgb: 'FF0000' } }), 'action_requise')
assert.equal(trackingStatusFromCellStyle({ patternType: 'solid', fgColor: { rgb: 'CAEEFB' } }), 'a_recontacter')
assert.equal(trackingStatusFromCellStyle({ patternType: 'solid', fgColor: {} }), 'a_qualifier')
assert.equal(inferImportMotifFromFilename('Convo atelier CPF senior.xlsx'), 'atelier CPF senior')
assert.equal(inferImportMotifFromFilename('atelier mobilité.xlsx'), 'atelier mobilité')
assert.equal(inferImportMotifFromFilename('Portefeuille.xlsx'), '')

const dossierModifie = {
  situationAdministrative: 'Sans emploi',
  situationPersonnelle: 'Difficulté de mobilité',
  parcoursProfessionnel: 'Projet de reconversion',
  ceQueDitLaPersonne: 'Souhaite changer de métier',
  projet: 'Explorer deux pistes métier',
  formation: 'À vérifier',
  freinsSelectionnes: ['Mobilite'],
  ressourcesSelectionnees: ['Experience'],
}
const patchPortefeuille = buildPortfolioPatchFromDossier(dossierModifie)
assert.equal(patchPortefeuille.parcoursProfessionnel, 'Projet de reconversion')
assert.deepEqual(patchPortefeuille.freinsSelectionnes, ['Mobilite'])

const dossierRecharge = portfolioRecordToDossier({ ...mapped, ...patchPortefeuille })
assert.equal(dossierRecharge.ceQueDitLaPersonne, 'Souhaite changer de métier')
assert.equal(dossierRecharge.projet, 'Explorer deux pistes métier')
assert.deepEqual(dossierRecharge.ressourcesSelectionnees, ['Experience'])
assert.ok(sourcePortfolioPanel.includes('Ouvrir le dossier'))
assert.ok(sourcePortfolioPanel.includes('Enregistrer les modifications'))
assert.ok(sourcePortfolioPanel.includes('Demande exprimée ou évolution du dossier'))
assert.ok(sourcePortfolioPanel.includes('À traiter en priorité'))
assert.ok(sourcePortfolioPanel.includes('Dossiers urgents'))
assert.ok(sourcePortfolioPanel.includes('Voir les ${alerts.length} alertes'))
assert.ok(sourcePortfolioPanel.includes('Informations importées et suivi du portefeuille'))
assert.ok(sourcePortfolioPanel.includes('Motif du prochain jalon'))
assert.ok(sourcePortfolioPanel.includes('Suivi immédiat des imports'))
assert.ok(sourcePortfolioPanel.includes('Motif particulier (facultatif)'))
assert.ok(sourcePortfolioPanel.includes('Le motif est repris automatiquement lorsque le nom du fichier est explicite'))
assert.ok(sourcePortfolioPanel.includes('Laissez vide pour un portefeuille général.'))
assert.ok(PORTFOLIO_TRACKING_STATUS_OPTIONS.some((option) => option.label === 'À signaler au CRE'))
assert.ok(PORTFOLIO_TRACKING_STATUS_OPTIONS.some((option) => option.label === 'À avertir · procédure à confirmer'))

const anonymised = anonymiserPortfolioRecord({ identifiant: 'TEST123', nom: 'EXEMPLE', prenom: 'Camille', age: 42 })
assert.deepEqual(anonymised, { identifiant: 'TEST123', age: 42 })

console.log('Import/export Excel vérifié : anonymisation, rattachement au portefeuille et modifications du parcours persistantes.')
