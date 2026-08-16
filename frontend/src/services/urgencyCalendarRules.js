const PRIORITY_ORDER = {
  urgente: 0,
  haute: 1,
  normale: 2,
}

const pad = (value) => String(value).padStart(2, '0')

export const dateId = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const isDateId = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))

export const tomorrowId = (from = new Date()) => {
  const tomorrow = new Date(from)
  tomorrow.setHours(12, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return dateId(tomorrow)
}

export const normalizeUrgency = (item = {}) => ({
  id: String(item.id || '').trim(),
  title: String(item.title || '').trim(),
  dueDate: isDateId(item.dueDate) ? item.dueDate : '',
  priority: Object.hasOwn(PRIORITY_ORDER, item.priority) ? item.priority : 'normale',
  ftNumber: String(item.ftNumber || '').trim().toUpperCase(),
  notes: String(item.notes || '').trim(),
  completed: item.completed === true,
  completedAt: item.completedAt || null,
  createdAt: item.createdAt || new Date().toISOString(),
  updatedAt: item.updatedAt || new Date().toISOString(),
  rescheduleHistory: Array.isArray(item.rescheduleHistory) ? item.rescheduleHistory : [],
})

export const sortUrgencies = (items = []) => [...items].sort((a, b) => {
  if (a.completed !== b.completed) return a.completed ? 1 : -1
  const dateComparison = String(a.dueDate).localeCompare(String(b.dueDate))
  if (dateComparison) return dateComparison
  return (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
})

export const summarizeUrgencies = (items = [], today = dateId()) => {
  const validItems = sortUrgencies(items.map(normalizeUrgency).filter((item) => item.id && item.title && item.dueDate))
  const active = validItems.filter((item) => !item.completed)
  return {
    overdue: active.filter((item) => item.dueDate < today),
    today: active.filter((item) => item.dueDate === today),
    upcoming: active.filter((item) => item.dueDate > today),
    completed: validItems.filter((item) => item.completed),
  }
}

export const canRescheduleForDailyReview = (newDate, today = dateId()) => (
  isDateId(newDate) && newDate > today
)

export const buildMonthDays = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1, 12)
  const mondayOffset = (firstDay.getDay() + 6) % 7
  const cursor = new Date(year, monthIndex, 1 - mondayOffset, 12)

  return Array.from({ length: 42 }, () => {
    const current = new Date(cursor)
    cursor.setDate(cursor.getDate() + 1)
    return {
      id: dateId(current),
      day: current.getDate(),
      inMonth: current.getMonth() === monthIndex,
    }
  })
}
