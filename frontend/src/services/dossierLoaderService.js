import { buildVersionnementModel, mapStoredDossierPayload } from '../types/dossierContract'

export const DOSSIER_STORAGE_PREFIX = 'assistant-mission-analyse:'
export const LAST_OPENED_DOSSIER_KEY = 'assistant:last-opened-id'

export const buildDossierStorageKey = (identifiant) => `${DOSSIER_STORAGE_PREFIX}${String(identifiant || '').trim()}`

export const getLastOpenedDossierId = () => localStorage.getItem(LAST_OPENED_DOSSIER_KEY) || ''

export const setLastOpenedDossierId = (identifiant) => {
  const id = String(identifiant || '').trim()
  if (!id) return { ok: false, code: 'missing-id' }
  localStorage.setItem(LAST_OPENED_DOSSIER_KEY, id)
  return { ok: true, identifiant: id }
}

export const hasStoredDossier = (identifiant) => {
  const id = String(identifiant || '').trim()
  if (!id) return false
  return localStorage.getItem(buildDossierStorageKey(id)) !== null
}

const normalizeStoredPayload = (identifiant, payload) =>
  mapStoredDossierPayload({ identifiant, payload })

export const parseStoredPayload = (raw) => {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export const loadStoredDossier = (identifiant) => {
  const id = String(identifiant || '').trim()
  if (!id) {
    return { ok: false, code: 'missing-id', message: "Renseignez l'identifiant du demandeur d'emploi." }
  }

  const raw = localStorage.getItem(buildDossierStorageKey(id))
  if (!raw) {
    return { ok: false, code: 'not-found', message: `Aucune analyse trouvée pour l'identifiant ${id}.` }
  }

  const payload = parseStoredPayload(raw)
  if (!payload) {
    return { ok: false, code: 'parse-error', message: `Impossible de lire l'analyse enregistrée pour ${id}.` }
  }

  const normalized = normalizeStoredPayload(id, payload)
  if (!normalized.ok) {
    return {
      ok: false,
      code: normalized.code || 'invalid-structure',
      message: `${normalized.message} Chargement refusé pour conserver le dossier précédent.`,
    }
  }

  return {
    ok: true,
    identifiant: id,
    payload: normalized.payload,
    dossier: normalized.dossier,
  }
}

export const saveStoredDossier = (identifiant, payload) => {
  const id = String(identifiant || '').trim()
  if (!id) return { ok: false, code: 'missing-id' }

  const normalizedInput = normalizeStoredPayload(id, payload)
  if (!normalizedInput.ok) {
    return {
      ok: false,
      code: normalizedInput.code || 'invalid-structure',
      message: normalizedInput.message || 'Structure de dossier invalide.',
    }
  }

  const key = buildDossierStorageKey(id)
  const existingParsed = parseStoredPayload(localStorage.getItem(key))
  const existingNormalized = existingParsed ? normalizeStoredPayload(id, existingParsed) : null

  const nowIso =
    String(normalizedInput.dossier?.versionnement?.updatedAt || normalizedInput.payload?.updatedAt || '').trim() ||
    new Date().toISOString()

  const previousVersionnement = existingNormalized?.ok ? existingNormalized.dossier?.versionnement : null
  const currentVersionnement = normalizedInput.dossier?.versionnement || {}
  const previousVersion = Number(previousVersionnement?.version || 0)
  const currentVersion = Number(currentVersionnement.version || 1)
  const nextVersion = Math.max(previousVersion + 1, currentVersion > 0 ? Math.floor(currentVersion) : 1)

  const createdAt =
    String(currentVersionnement.createdAt || previousVersionnement?.createdAt || nowIso).trim() || nowIso
  const auteur = String(currentVersionnement.auteur || previousVersionnement?.auteur || 'Conseiller FT').trim() || 'Conseiller FT'
  const source = String(currentVersionnement.source || previousVersionnement?.source || 'local').trim() || 'local'

  const historique = Array.isArray(previousVersionnement?.historique)
    ? [...previousVersionnement.historique]
    : []

  historique.push({
    version: nextVersion,
    createdAt,
    updatedAt: nowIso,
    auteur,
    source,
  })

  const patchedPayload = {
    ...normalizedInput.payload,
    version: nextVersion,
    updatedAt: nowIso,
    data: {
      ...normalizedInput.dossier,
      versionnement: buildVersionnementModel({
        current: {
          ...currentVersionnement,
          version: nextVersion,
          createdAt,
          updatedAt: nowIso,
          auteur,
          source,
          historique,
        },
        fallbackVersion: nextVersion,
        fallbackCreatedAt: createdAt,
        fallbackUpdatedAt: nowIso,
        fallbackAuteur: auteur,
        fallbackSource: source,
      }),
    },
  }

  const normalized = normalizeStoredPayload(id, patchedPayload)
  if (!normalized.ok) {
    return {
      ok: false,
      code: normalized.code || 'invalid-structure',
      message: normalized.message || 'Structure de dossier invalide.',
    }
  }

  localStorage.setItem(key, JSON.stringify(normalized.payload))
  localStorage.setItem(LAST_OPENED_DOSSIER_KEY, id)
  return { ok: true, identifiant: id, payload: normalized.payload, dossier: normalized.dossier }
}

export const deleteStoredDossier = (identifiant) => {
  const id = String(identifiant || '').trim()
  if (!id) return { ok: false, code: 'missing-id' }

  const key = buildDossierStorageKey(id)
  const existing = localStorage.getItem(key)
  if (!existing) return { ok: false, code: 'not-found' }

  localStorage.removeItem(key)
  if (localStorage.getItem(LAST_OPENED_DOSSIER_KEY) === id) {
    localStorage.removeItem(LAST_OPENED_DOSSIER_KEY)
  }

  return { ok: true, identifiant: id }
}

export const listStoredDossiers = () => {
  const items = []

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(DOSSIER_STORAGE_PREFIX)) continue

    const identifiant = key.replace(DOSSIER_STORAGE_PREFIX, '')
    const parsed = parseStoredPayload(localStorage.getItem(key))
    const normalized = parsed ? normalizeStoredPayload(identifiant, parsed) : null
    const payload = normalized?.ok ? normalized.payload : null
    items.push({ identifiant, payload, dossier: normalized?.ok ? normalized.dossier : null })
  }

  return items
}

export const getEntryDossierId = (search) => {
  const params = new URLSearchParams(search || '')
  return (
    params.get('dossier') ||
    params.get('open') ||
    getLastOpenedDossierId() ||
    ''
  )
}

export const buildAssistantDossierUrl = (identifiant) =>
  `/assistant?dossier=${encodeURIComponent(String(identifiant || '').trim())}`
