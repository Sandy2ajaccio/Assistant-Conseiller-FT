import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { auth, db } from './firebaseClient.js'

const PORTFOLIO_STORAGE_KEY = 'cap-decision:portefeuille-imports'
const TRAINING_STORAGE_KEY = 'cap-decision:formations'
const DOSSIER_STORAGE_PREFIX = 'assistant-mission-analyse:'
const LAST_OPENED_DOSSIER_KEY = 'assistant:last-opened-id'
const ENTRETIEN_DRAFT_KEY = 'cap-decision-ft-entretien-en-cours'
const PENDING_DELETIONS_KEY = 'cap-decision:pending-dossier-deletions'
const CHUNK_SIZE = 150

const currentUser = () => auth.currentUser

const readPendingDeletions = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(PENDING_DELETIONS_KEY) || '[]')
    return new Set(Array.isArray(parsed) ? parsed.filter(Boolean) : [])
  } catch {
    return new Set()
  }
}

const writePendingDeletions = (items) => {
  const values = [...items].filter(Boolean)
  if (values.length) localStorage.setItem(PENDING_DELETIONS_KEY, JSON.stringify(values))
  else localStorage.removeItem(PENDING_DELETIONS_KEY)
}

export const markDossierDeletionPending = (identifiant) => {
  const id = String(identifiant || '').trim()
  if (!id) return
  const pending = readPendingDeletions()
  pending.add(id)
  writePendingDeletions(pending)
}

const clearDossierDeletionPending = (identifiant) => {
  const pending = readPendingDeletions()
  pending.delete(String(identifiant || '').trim())
  writePendingDeletions(pending)
}

export const syncDossierToCloud = async (identifiant, payload) => {
  const user = currentUser()
  if (!user || !identifiant) return
  await setDoc(doc(db, 'private', user.uid, 'dossiers', identifiant), {
    identifiant,
    payload,
    updatedAt: serverTimestamp(),
  })
}

export const deleteDossierFromCloud = async (identifiant) => {
  const user = currentUser()
  if (!user) throw new Error('Connexion requise pour supprimer le dossier en ligne.')
  if (!identifiant) return
  await deleteDoc(doc(db, 'private', user.uid, 'dossiers', identifiant))
  clearDossierDeletionPending(identifiant)
}

export const retryPendingDossierDeletions = async () => {
  const pending = [...readPendingDeletions()]
  if (!pending.length) return { deleted: 0 }
  const user = currentUser()
  if (!user) throw new Error('Connexion requise pour terminer les suppressions en attente.')
  await Promise.all(pending.map((identifiant) => deleteDossierFromCloud(identifiant)))
  return { deleted: pending.length }
}

export const syncPortfolioToCloud = async (records) => {
  const user = currentUser()
  if (!user) return
  const existingChunks = await getDocs(collection(db, 'private', user.uid, 'portfolioChunks'))
  const chunks = []
  for (let index = 0; index < records.length; index += CHUNK_SIZE) {
    chunks.push(records.slice(index, index + CHUNK_SIZE))
  }

  const batch = writeBatch(db)
  const retainedChunkIds = new Set(chunks.map((_, index) => String(index).padStart(4, '0')))
  existingChunks.forEach((existingChunk) => {
    if (!retainedChunkIds.has(existingChunk.id)) batch.delete(existingChunk.ref)
  })
  chunks.forEach((items, index) => {
    batch.set(doc(db, 'private', user.uid, 'portfolioChunks', String(index).padStart(4, '0')), {
      items,
      updatedAt: serverTimestamp(),
    })
  })
  batch.set(doc(db, 'private', user.uid), {
    portfolioChunkCount: chunks.length,
    updatedAt: serverTimestamp(),
  }, { merge: true })
  await batch.commit()
}

export const syncTrainingsToCloud = async (records) => {
  const user = currentUser()
  if (!user) return
  await setDoc(doc(db, 'private', user.uid, 'configuration', 'formations'), {
    items: records,
    updatedAt: serverTimestamp(),
  })
}

export const hydrateLocalDataFromCloud = async () => {
  const user = currentUser()
  if (!user) return { dossiers: 0, portfolio: 0 }

  const [dossierSnapshot, portfolioSnapshot, trainingSnapshot] = await Promise.all([
    getDocs(collection(db, 'private', user.uid, 'dossiers')),
    getDocs(collection(db, 'private', user.uid, 'portfolioChunks')),
    getDoc(doc(db, 'private', user.uid, 'configuration', 'formations')),
  ])

  const pendingDeletions = readPendingDeletions()
  dossierSnapshot.forEach((item) => {
    const data = item.data()
    if (data?.identifiant && data?.payload && !pendingDeletions.has(data.identifiant)) {
      localStorage.setItem(`${DOSSIER_STORAGE_PREFIX}${data.identifiant}`, JSON.stringify(data.payload))
    }
  })

  const portfolio = portfolioSnapshot.docs
    .sort((a, b) => a.id.localeCompare(b.id))
    .flatMap((item) => item.data()?.items || [])
  if (portfolio.length) localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolio))
  const trainings = trainingSnapshot.data()?.items
  if (Array.isArray(trainings)) localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(trainings))

  return { dossiers: dossierSnapshot.size, portfolio: portfolio.length, trainings: Array.isArray(trainings) ? trainings.length : 0 }
}

export const backupAllLocalData = async () => {
  const user = currentUser()
  if (!user) return

  await retryPendingDossierDeletions()
  const portfolio = JSON.parse(localStorage.getItem(PORTFOLIO_STORAGE_KEY) || '[]')
  await syncPortfolioToCloud(Array.isArray(portfolio) ? portfolio : [])
  const trainings = JSON.parse(localStorage.getItem(TRAINING_STORAGE_KEY) || '[]')
  await syncTrainingsToCloud(Array.isArray(trainings) ? trainings : [])

  const saves = []
  const pendingDeletions = readPendingDeletions()
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key?.startsWith(DOSSIER_STORAGE_PREFIX)) continue
    const identifiant = key.slice(DOSSIER_STORAGE_PREFIX.length)
    if (pendingDeletions.has(identifiant)) continue
    const payload = JSON.parse(localStorage.getItem(key) || 'null')
    if (payload) saves.push(syncDossierToCloud(identifiant, payload))
  }
  await Promise.all(saves)
}

export const clearSensitiveLocalData = () => {
  const keysToRemove = [
    PORTFOLIO_STORAGE_KEY,
    TRAINING_STORAGE_KEY,
    LAST_OPENED_DOSSIER_KEY,
    ENTRETIEN_DRAFT_KEY,
    PENDING_DELETIONS_KEY,
  ]
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(DOSSIER_STORAGE_PREFIX)) keysToRemove.push(key)
  }
  ;[...new Set(keysToRemove)].forEach((key) => localStorage.removeItem(key))
}
