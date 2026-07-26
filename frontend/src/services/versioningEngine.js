export const VERSION_TYPES = {
  SYNTHESE: 'Synthèse',
  COMPTE_RENDU: 'Compte rendu',
}

const asText = (value) => String(value || '')

const stableStringify = (value) => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }

  const keys = Object.keys(value).sort()
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`
}

export const isVersionContentEmpty = (type, content) => {
  if (type === VERSION_TYPES.SYNTHESE) {
    return !asText(content).trim()
  }

  if (type === VERSION_TYPES.COMPTE_RENDU) {
    if (!content || typeof content !== 'object') return true
    return Object.values(content).every((value) => !asText(value).trim())
  }

  return false
}

export const buildVersionContentSignature = (type, content) => {
  if (type === VERSION_TYPES.SYNTHESE) {
    return asText(content)
  }

  return stableStringify(content || {})
}

export const createVersionEntry = ({ type, version, content, auteur = 'Conseiller FT', extra = {} }) => {
  const now = new Date()

  return {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2, 9)}`,
    version,
    date: now.toLocaleDateString('fr-FR'),
    heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    auteur,
    type,
    contenu: content,
    ...extra,
  }
}

export const nextVersionNumber = (counters, type) => (counters[type] || 0) + 1
