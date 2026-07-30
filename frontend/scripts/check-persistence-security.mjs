import assert from 'node:assert/strict'

class MemoryStorage {
  constructor() {
    this.values = new Map()
  }

  get length() {
    return this.values.size
  }

  key(index) {
    return [...this.values.keys()][index] ?? null
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null
  }

  setItem(key, value) {
    this.values.set(key, String(value))
  }

  removeItem(key) {
    this.values.delete(key)
  }
}

globalThis.localStorage = new MemoryStorage()

const {
  clearSensitiveLocalData,
  markDossierDeletionPending,
} = await import('../src/services/cloudPersistenceService.js')

localStorage.setItem('cap-decision:portefeuille-imports', '[{"identifiant":"TEST"}]')
localStorage.setItem('cap-decision:formations', '[{"id":"formation-test"}]')
localStorage.setItem('assistant-mission-analyse:TEST', '{"data":{"identifiant":"TEST"}}')
localStorage.setItem('assistant:last-opened-id', 'TEST')
localStorage.setItem('cap-decision-ft-entretien-en-cours', '{"identifiant":"TEST"}')
localStorage.setItem('preference-theme', 'clair')

markDossierDeletionPending('TEST')
const pending = JSON.parse(localStorage.getItem('cap-decision:pending-dossier-deletions'))
assert.deepEqual(pending, ['TEST'])

clearSensitiveLocalData()

assert.equal(localStorage.getItem('cap-decision:portefeuille-imports'), null)
assert.equal(localStorage.getItem('cap-decision:formations'), null)
assert.equal(localStorage.getItem('assistant-mission-analyse:TEST'), null)
assert.equal(localStorage.getItem('assistant:last-opened-id'), null)
assert.equal(localStorage.getItem('cap-decision-ft-entretien-en-cours'), null)
assert.equal(localStorage.getItem('cap-decision:pending-dossier-deletions'), null)
assert.equal(localStorage.getItem('preference-theme'), 'clair')

console.log('Sécurité de la persistance vérifiée : données sensibles effacées, préférences conservées.')
