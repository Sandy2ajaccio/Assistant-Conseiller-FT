import { syncTrainingsToCloud } from './cloudPersistenceService'

const TRAINING_STORAGE_KEY = 'cap-decision:formations'

const text = (value) => String(value ?? '').trim()

const readRecords = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(TRAINING_STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const sortRecords = (records) => [...records].sort((a, b) => {
  const dateComparison = String(a.dateDebut || '9999-12-31').localeCompare(String(b.dateDebut || '9999-12-31'))
  return dateComparison || String(a.nom || '').localeCompare(String(b.nom || ''), 'fr')
})

export const listTrainings = () => sortRecords(readRecords())

export const saveTraining = async (input) => {
  const nom = text(input?.nom)
  const organisme = text(input?.organisme)
  const dateDebut = text(input?.dateDebut)
  if (!nom) throw new Error('Le nom de la formation est obligatoire.')
  if (!organisme) throw new Error('L’organisme de formation est obligatoire.')
  if (!dateDebut) throw new Error('La date de début est obligatoire.')
  if (input?.dateFin && input.dateFin < dateDebut) {
    throw new Error('La date de fin ne peut pas précéder la date de début.')
  }

  const records = readRecords()
  const id = text(input.id) || (
    globalThis.crypto?.randomUUID?.()
    || `formation-${Date.now()}-${Math.random().toString(16).slice(2)}`
  )
  const existingIndex = records.findIndex((item) => item.id === id)
  const record = {
    ...(existingIndex >= 0 ? records[existingIndex] : {}),
    ...input,
    id,
    nom,
    organisme,
    dateDebut,
    updatedAt: new Date().toISOString(),
  }
  if (existingIndex >= 0) records[existingIndex] = record
  else records.push(record)

  const sorted = sortRecords(records)
  localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(sorted))
  let cloudSynced = true
  try {
    await syncTrainingsToCloud(sorted)
  } catch {
    cloudSynced = false
  }
  return { record, created: existingIndex < 0, cloudSynced }
}

export const deleteTraining = async (id) => {
  const records = readRecords()
  const filtered = records.filter((item) => item.id !== id)
  if (filtered.length === records.length) return { ok: false }
  localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(filtered))
  let cloudSynced = true
  try {
    await syncTrainingsToCloud(filtered)
  } catch {
    cloudSynced = false
  }
  return { ok: true, cloudSynced }
}
