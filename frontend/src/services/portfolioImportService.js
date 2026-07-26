import * as XLSX from 'xlsx'
import { syncPortfolioToCloud } from './cloudPersistenceService'

const IMPORT_STORAGE_KEY = 'cap-decision:portefeuille-imports'
const portefeuilleInitial = []

const normalizeHeader = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]/g, '')
  .toLowerCase()

const text = (value) => String(value ?? '').trim()
const normalizeIdentifier = (value) => text(value).toUpperCase().replace(/[^A-Z0-9]/g, '')

const readValue = (row, header) => {
  const key = Object.keys(row).find((candidate) => normalizeHeader(candidate) === normalizeHeader(header))
  return key ? text(row[key]) : ''
}

const mapRow = (row) => ({
  priorite: readValue(row, 'Priorité'),
  nom: readValue(row, 'Nom'),
  prenom: readValue(row, 'Prénom'),
  identifiant: normalizeIdentifier(readValue(row, 'Identifiant')),
  telephone: readValue(row, 'Téléphone'),
  aRappeler: readValue(row, 'À rappeler'),
  dateRappel: readValue(row, 'Date rappel'),
  contratEngagement: readValue(row, "Contrat d'engagement"),
  prestation: readValue(row, 'Prestation'),
  atelier: readValue(row, 'Atelier'),
  formation: readValue(row, 'Formation'),
  echeance: readValue(row, 'Échéance'),
  joursRestants: readValue(row, 'Jours restants'),
  alerte: readValue(row, 'Alerte'),
  actionRealisee: readValue(row, 'Action réalisée'),
  historiqueAppels: readValue(row, 'Historique appels'),
  historiqueMails: readValue(row, 'Historique mails'),
  historiqueEntretiens: readValue(row, 'Historique entretiens'),
  historiqueCourriers: readValue(row, 'Historique courriers'),
  dateManquement: readValue(row, 'Date manquement'),
  motif: readValue(row, 'Motif'),
  action: readValue(row, 'Action'),
  statut: readValue(row, 'Statut'),
  decision: readValue(row, 'Décision'),
  commentaires: readValue(row, 'Commentaires'),
})

const mergeNonEmptyFields = (existing = {}, incoming = {}) => {
  const merged = { ...existing }
  Object.entries(incoming).forEach(([key, value]) => {
    if (key === 'identifiant' || text(value)) merged[key] = value
  })
  return merged
}

const hasUsefulChange = (existing = {}, incoming = {}) => Object.entries(incoming)
  .some(([key, value]) => key !== 'identifiant' && text(value) && text(existing[key]) !== text(value))

const deduplicateRecords = (records) => {
  const byId = new Map()
  records.forEach((record) => {
    const identifiant = normalizeIdentifier(record.identifiant)
    if (!identifiant) return
    byId.set(identifiant, mergeNonEmptyFields(byId.get(identifiant), { ...record, identifiant }))
  })
  return [...byId.values()]
}

const readImportedRecords = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(IMPORT_STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const listPortfolioRecords = () => {
  const byId = new Map()
  deduplicateRecords([...portefeuilleInitial, ...readImportedRecords()]).forEach((record) => {
    byId.set(record.identifiant, record)
  })
  return [...byId.values()].sort((a, b) =>
    `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr'),
  )
}

export const importPortfolioWorkbook = async (file) => {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheetName = workbook.SheetNames.includes('Suivi DE') ? 'Suivi DE' : workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) throw new Error('Le classeur ne contient aucune feuille exploitable.')

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })
  const mapped = rows.map(mapRow).filter((record) => record.identifiant && (record.nom || record.prenom))
  if (mapped.length === 0) {
    throw new Error('Aucun demandeur reconnu. Vérifiez les colonnes Nom, Prénom et Identifiant.')
  }

  const previous = deduplicateRecords(readImportedRecords())
  const byId = new Map(previous.map((record) => [record.identifiant, record]))
  const incomingById = new Map()
  let duplicatesMerged = 0
  mapped.forEach((record) => {
    if (incomingById.has(record.identifiant)) duplicatesMerged += 1
    incomingById.set(
      record.identifiant,
      mergeNonEmptyFields(incomingById.get(record.identifiant), record),
    )
  })
  let created = 0
  let updated = 0
  let unchanged = 0
  incomingById.forEach((record) => {
    const existing = byId.get(record.identifiant)
      || portefeuilleInitial.find((item) => normalizeIdentifier(item.identifiant) === record.identifiant)
    if (!existing) created += 1
    else if (hasUsefulChange(existing, record)) updated += 1
    else unchanged += 1

    byId.set(record.identifiant, {
      ...mergeNonEmptyFields(existing, record),
      identifiant: record.identifiant,
      importedAt: new Date().toISOString(),
    })
  })
  const mergedRecords = deduplicateRecords([...byId.values()])
  localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(mergedRecords))
  let cloudSynced = true
  try {
    await syncPortfolioToCloud(mergedRecords)
  } catch {
    cloudSynced = false
  }

  return {
    total: incomingById.size,
    created,
    updated,
    unchanged,
    duplicatesMerged,
    ignored: rows.length - mapped.length,
    sheetName,
    cloudSynced,
  }
}

export const portfolioRecordToDossier = (record) => ({
  ...record,
  dossierStatut: record.statut || 'importé',
  besoinIdentifieConseiller: [record.prestation, record.atelier, record.formation].filter(Boolean).join(' · '),
  ceQueDitLaPersonne: record.commentaires || record.motif || '',
  projet: record.action || record.decision || '',
  freinsSelectionnes: record.alerte ? [record.alerte] : [],
  ressourcesSelectionnees: [],
})
