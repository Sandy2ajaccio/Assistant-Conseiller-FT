import assert from 'node:assert/strict'
import * as XLSX from 'xlsx'
import { anonymiserPortfolioRecord, mapPortfolioRow } from '../src/services/portfolioImportService.js'

const workbook = XLSX.utils.book_new()
const worksheet = XLSX.utils.json_to_sheet([
  {
    Identifiant: 'TEST123',
    Nom: 'EXEMPLE',
    Prénom: 'Camille',
    Âge: 42,
    RQTH: 'Oui',
    'Date d’inscription': '2025-01-15',
  },
])
XLSX.utils.book_append_sheet(workbook, worksheet, 'Suivi DE')

const binary = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
const parsedWorkbook = XLSX.read(binary, { type: 'buffer', cellDates: true })
const parsedRows = XLSX.utils.sheet_to_json(parsedWorkbook.Sheets['Suivi DE'], { defval: '' })

assert.equal(parsedRows.length, 1)
assert.equal(parsedRows[0].Identifiant, 'TEST123')
assert.equal(parsedRows[0].Nom, 'EXEMPLE')
assert.equal(parsedRows[0].Prénom, 'Camille')
assert.equal(parsedRows[0].Âge, 42)
assert.equal(parsedRows[0].RQTH, 'Oui')

const mapped = mapPortfolioRow(parsedRows[0])
assert.equal(mapped.identifiant, 'TEST123')
assert.equal(mapped.nom, undefined)
assert.equal(mapped.prenom, undefined)

const anonymised = anonymiserPortfolioRecord({ identifiant: 'TEST123', nom: 'EXEMPLE', prenom: 'Camille', age: 42 })
assert.deepEqual(anonymised, { identifiant: 'TEST123', age: 42 })

console.log('Import/export Excel vérifié avec anonymisation Nom/Prénom et identifiant FT conservé.')
