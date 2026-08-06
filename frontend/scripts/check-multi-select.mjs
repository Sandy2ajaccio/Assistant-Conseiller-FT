import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { normaliserSuiviRemobilisation } from '../src/data/suiviRemobilisation.js'

const suivi = normaliserSuiviRemobilisation({
  actif: true,
  indicesSelectionnes: ['candidatures', 'contacts-conseiller'],
  actionsCategories: ['candidatures-mer', 'atelier-prestation'],
})
assert.deepEqual(suivi.indicesSelectionnes, ['candidatures', 'contacts-conseiller'])
assert.deepEqual(suivi.actionsCategories, ['candidatures-mer', 'atelier-prestation'])

const pageSource = await readFile(new URL('../src/pages/AssistantMissionPage.jsx', import.meta.url), 'utf8')
assert.match(pageSource, /const SituationMultiSelect/)
assert.match(pageSource, /disableCloseOnSelect/)
assert.match(pageSource, /<Checkbox checked=\{selected\}/)

const badgesSource = await readFile(new URL('../src/components/CockpitBadgeGroup.jsx', import.meta.url), 'utf8')
assert.match(badgesSource, /<Autocomplete/)
assert.match(badgesSource, /multiple/)
assert.match(badgesSource, /disableCloseOnSelect/)
assert.match(badgesSource, /<Checkbox/)

const remobilisationSource = await readFile(new URL('../src/components/SuiviRemobilisationCard.jsx', import.meta.url), 'utf8')
assert.equal((remobilisationSource.match(/<Autocomplete/g) || []).length >= 2, true)
assert.match(remobilisationSource, /Indices à retenir/)
assert.match(remobilisationSource, /Familles d’action/)

const portefeuilleSource = await readFile(new URL('../src/components/PortefeuilleMutualiseCard.jsx', import.meta.url), 'utf8')
assert.match(portefeuilleSource, /Actions réalisées pour cette file/)
assert.match(portefeuilleSource, /disableCloseOnSelect/)

console.log('Menus multisélection vérifiés : diagnostic, faisceau CRE, remobilisation et portefeuille.')
