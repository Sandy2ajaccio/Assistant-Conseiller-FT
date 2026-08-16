import { syncAgendaToCloud } from './cloudPersistenceService.js'
import {
  dateId,
  normalizeUrgency,
  sortUrgencies,
} from './urgencyCalendarRules.js'

export const AGENDA_STORAGE_KEY = 'cap-decision:agenda-urgences'
export const AGENDA_REVIEW_KEY = 'cap-decision:agenda-derniere-revue'
export const AGENDA_EVENT = 'cap-decision:agenda-updated'

const makeId = () => (
  globalThis.crypto?.randomUUID?.()
  || `urgence-${Date.now()}-${Math.random().toString(16).slice(2)}`
)

export const loadUrgencies = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(AGENDA_STORAGE_KEY) || '[]')
    return sortUrgencies(Array.isArray(parsed) ? parsed.map(normalizeUrgency) : [])
  } catch {
    return []
  }
}

const announceUpdate = (items) => {
  window.dispatchEvent(new CustomEvent(AGENDA_EVENT, { detail: { items } }))
}

export const saveUrgencies = async (items) => {
  const normalized = sortUrgencies(items.map(normalizeUrgency))
  localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(normalized))
  announceUpdate(normalized)

  try {
    await syncAgendaToCloud(normalized)
    return { items: normalized, cloudSynced: true }
  } catch {
    return { items: normalized, cloudSynced: false }
  }
}

export const createUrgency = async (payload) => {
  const now = new Date().toISOString()
  const record = normalizeUrgency({
    ...payload,
    id: makeId(),
    createdAt: now,
    updatedAt: now,
  })
  if (!record.title || !record.dueDate) throw new Error('Le libellé et la date sont obligatoires.')
  const result = await saveUrgencies([...loadUrgencies(), record])
  return { ...result, record }
}

export const updateUrgency = async (id, patch) => {
  const now = new Date().toISOString()
  const current = loadUrgencies()
  const target = current.find((item) => item.id === id)
  if (!target) throw new Error('Cette urgence est introuvable.')
  return saveUrgencies(current.map((item) => (
    item.id === id ? normalizeUrgency({ ...item, ...patch, id, updatedAt: now }) : item
  )))
}

export const completeUrgency = (id) => updateUrgency(id, {
  completed: true,
  completedAt: new Date().toISOString(),
})

export const reopenUrgency = (id) => updateUrgency(id, {
  completed: false,
  completedAt: null,
})

export const rescheduleUrgency = async (id, newDate) => {
  const current = loadUrgencies()
  const target = current.find((item) => item.id === id)
  if (!target) throw new Error('Cette urgence est introuvable.')
  return updateUrgency(id, {
    dueDate: newDate,
    completed: false,
    completedAt: null,
    rescheduleHistory: [
      ...(target.rescheduleHistory || []),
      { from: target.dueDate, to: newDate, changedAt: new Date().toISOString() },
    ],
  })
}

export const subscribeUrgencies = (callback) => {
  const handler = (event) => callback(event.detail?.items || loadUrgencies())
  const storageHandler = (event) => {
    if (event.key === AGENDA_STORAGE_KEY) callback(loadUrgencies())
  }
  window.addEventListener(AGENDA_EVENT, handler)
  window.addEventListener('storage', storageHandler)
  return () => {
    window.removeEventListener(AGENDA_EVENT, handler)
    window.removeEventListener('storage', storageHandler)
  }
}

export const dailyReviewWasSeen = (today = dateId()) => (
  localStorage.getItem(AGENDA_REVIEW_KEY) === today
)

export const markDailyReviewSeen = (today = dateId()) => {
  localStorage.setItem(AGENDA_REVIEW_KEY, today)
}
