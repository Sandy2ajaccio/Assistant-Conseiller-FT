import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
  buildMonthDays,
  canRescheduleForDailyReview,
  summarizeUrgencies,
} from '../src/services/urgencyCalendarRules.js'

const records = [
  { id: 'late', title: 'Relancer le DE', dueDate: '2026-08-15', priority: 'urgente' },
  { id: 'today', title: 'Faire le point', dueDate: '2026-08-16', priority: 'haute' },
  { id: 'future', title: 'Préparer le rendez-vous', dueDate: '2026-08-20', priority: 'normale' },
  { id: 'done', title: 'Action terminée', dueDate: '2026-08-14', completed: true },
]

const summary = summarizeUrgencies(records, '2026-08-16')
assert.equal(summary.overdue.length, 1)
assert.equal(summary.today.length, 1)
assert.equal(summary.upcoming.length, 1)
assert.equal(summary.completed.length, 1)
assert.equal(canRescheduleForDailyReview('2026-08-16', '2026-08-16'), false)
assert.equal(canRescheduleForDailyReview('2026-08-17', '2026-08-16'), true)
assert.equal(buildMonthDays(2026, 7).length, 42)
assert.equal(buildMonthDays(2026, 7)[0].id, '2026-07-27')

const [dialogSource, pageSource, appSource, sidebarSource, cloudSource, assistantSource] = await Promise.all([
  readFile(new URL('../src/components/DailyAgendaDialog.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/UrgencyCalendarPage.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/Sidebar.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/services/cloudPersistenceService.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/AssistantMissionPage.jsx', import.meta.url), 'utf8'),
])

assert.match(dialogSource, /Chaque urgence du jour ou en retard doit être cochée ou reportée/)
assert.match(dialogSource, /disableEscapeKeyDown/)
assert.match(pageSource, /Agenda perpétuel et urgences/)
assert.match(pageSource, /N° France Travail \(facultatif\)/)
assert.match(appSource, /path="\/agenda"/)
assert.match(sidebarSource, /Agenda et urgences/)
assert.match(cloudSource, /configuration', 'agenda'/)
assert.doesNotMatch(assistantSource, /Quel est l’objectif de cet import \?/)

console.log('Agenda perpétuel : règles, alerte quotidienne, report obligatoire, route et synchronisation vérifiés.')
