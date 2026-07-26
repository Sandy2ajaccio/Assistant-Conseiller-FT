import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { auth, db } from './firebaseClient'

const PORTFOLIO_STORAGE_KEY = 'cap-decision:portefeuille-imports'
const DOSSIER_STORAGE_PREFIX = 'assistant-mission-analyse:'
const CHUNK_SIZE = 150

const currentUser = () => auth.currentUser

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
  if (!user || !identifiant) return
  await deleteDoc(doc(db, 'private', user.uid, 'dossiers', identifiant))
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

export const hydrateLocalDataFromCloud = async () => {
  const user = currentUser()
  if (!user) return { dossiers: 0, portfolio: 0 }

  const [dossierSnapshot, portfolioSnapshot] = await Promise.all([
    getDocs(collection(db, 'private', user.uid, 'dossiers')),
    getDocs(collection(db, 'private', user.uid, 'portfolioChunks')),
  ])

  dossierSnapshot.forEach((item) => {
    const data = item.data()
    if (data?.identifiant && data?.payload) {
      localStorage.setItem(`${DOSSIER_STORAGE_PREFIX}${data.identifiant}`, JSON.stringify(data.payload))
    }
  })

  const portfolio = portfolioSnapshot.docs
    .sort((a, b) => a.id.localeCompare(b.id))
    .flatMap((item) => item.data()?.items || [])
  if (portfolio.length) localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolio))

  return { dossiers: dossierSnapshot.size, portfolio: portfolio.length }
}

export const backupAllLocalData = async () => {
  const user = currentUser()
  if (!user) return

  const portfolio = JSON.parse(localStorage.getItem(PORTFOLIO_STORAGE_KEY) || '[]')
  if (portfolio.length) await syncPortfolioToCloud(portfolio)

  const saves = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key?.startsWith(DOSSIER_STORAGE_PREFIX)) continue
    const identifiant = key.slice(DOSSIER_STORAGE_PREFIX.length)
    const payload = JSON.parse(localStorage.getItem(key) || 'null')
    if (payload) saves.push(syncDossierToCloud(identifiant, payload))
  }
  await Promise.all(saves)
}
