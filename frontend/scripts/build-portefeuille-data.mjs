import fs from 'node:fs'
import path from 'node:path'
import XLSX from 'xlsx'

const [sourcePath, outputPath] = process.argv.slice(2)
if (!sourcePath || !outputPath) {
  throw new Error('Usage: node build-portefeuille-data.mjs source.xlsx output.json')
}

const workbook = XLSX.readFile(sourcePath, { cellDates: true })
const sheet = workbook.Sheets['Suivi DE'] || workbook.Sheets[workbook.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })

const normalizeHeader = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]/g, '')
  .toLowerCase()

const get = (row, expected) => {
  const key = Object.keys(row).find((candidate) => normalizeHeader(candidate) === normalizeHeader(expected))
  return key ? String(row[key] ?? '').trim() : ''
}

const records = rows
  .map((row) => ({
    priorite: get(row, 'Priorité'),
    nom: get(row, 'Nom'),
    prenom: get(row, 'Prénom'),
    identifiant: get(row, 'Identifiant'),
    telephone: get(row, 'Téléphone'),
    aRappeler: get(row, 'À rappeler'),
    dateRappel: get(row, 'Date rappel'),
    contratEngagement: get(row, "Contrat d'engagement"),
    prestation: get(row, 'Prestation'),
    atelier: get(row, 'Atelier'),
    formation: get(row, 'Formation'),
    echeance: get(row, 'Échéance'),
    joursRestants: get(row, 'Jours restants'),
    alerte: get(row, 'Alerte'),
    actionRealisee: get(row, 'Action réalisée'),
    historiqueAppels: get(row, 'Historique appels'),
    historiqueMails: get(row, 'Historique mails'),
    historiqueEntretiens: get(row, 'Historique entretiens'),
    historiqueCourriers: get(row, 'Historique courriers'),
    dateManquement: get(row, 'Date manquement'),
    motif: get(row, 'Motif'),
    action: get(row, 'Action'),
    statut: get(row, 'Statut'),
    decision: get(row, 'Décision'),
    commentaires: get(row, 'Commentaires'),
  }))
  .filter((record) => record.identifiant && (record.nom || record.prenom))

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(records)}\n`, 'utf8')
console.log(`${records.length} demandeurs exportés vers ${outputPath}`)
