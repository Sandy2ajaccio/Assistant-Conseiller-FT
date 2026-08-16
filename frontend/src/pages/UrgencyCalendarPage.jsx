import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Link } from 'react-router-dom'

import {
  buildMonthDays,
  dateId,
  summarizeUrgencies,
  tomorrowId,
} from '../services/urgencyCalendarRules.js'
import {
  completeUrgency,
  createUrgency,
  loadUrgencies,
  reopenUrgency,
  rescheduleUrgency,
  subscribeUrgencies,
  updateUrgency,
} from '../services/urgencyCalendarService.js'

const MONTH_FORMATTER = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const emptyForm = (dueDate = dateId()) => ({
  title: '',
  dueDate,
  priority: 'haute',
  ftNumber: '',
  notes: '',
})

const priorityColor = (priority) => ({
  urgente: '#c62828',
  haute: '#ef6c00',
  normale: '#1976d2',
}[priority] || '#1976d2')

const labelPriority = (priority) => ({
  urgente: 'Urgente',
  haute: 'Haute',
  normale: 'Normale',
}[priority] || 'Normale')

function UrgencyCalendarPage() {
  const now = new Date()
  const today = dateId(now)
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1, 12))
  const [selectedDate, setSelectedDate] = useState(today)
  const [items, setItems] = useState(() => loadUrgencies())
  const [form, setForm] = useState(() => emptyForm(today))
  const [editingId, setEditingId] = useState('')
  const [rescheduleDates, setRescheduleDates] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => subscribeUrgencies(setItems), [])

  const summary = useMemo(() => summarizeUrgencies(items, today), [items, today])
  const monthDays = useMemo(
    () => buildMonthDays(month.getFullYear(), month.getMonth()),
    [month],
  )
  const selectedItems = useMemo(
    () => items.filter((item) => item.dueDate === selectedDate),
    [items, selectedDate],
  )

  const changeMonth = (offset) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1, 12))
  }

  const chooseDay = (day) => {
    setSelectedDate(day.id)
    setForm((current) => ({ ...current, dueDate: day.id }))
    const chosen = new Date(`${day.id}T12:00:00`)
    if (!day.inMonth) setMonth(new Date(chosen.getFullYear(), chosen.getMonth(), 1, 12))
  }

  const resetForm = (dueDate = selectedDate) => {
    setEditingId('')
    setForm(emptyForm(dueDate))
  }

  const saveForm = async (event) => {
    event.preventDefault()
    setMessage('')
    if (!form.title.trim() || !form.dueDate) {
      setMessage('Indiquez au minimum l’urgence et sa date.')
      return
    }
    const action = editingId
      ? updateUrgency(editingId, form)
      : createUrgency(form)
    const result = await action
    setItems(result.items)
    setSelectedDate(form.dueDate)
    setMonth(new Date(`${form.dueDate}T12:00:00`))
    resetForm(form.dueDate)
    setMessage(result.cloudSynced
      ? 'Urgence enregistrée et synchronisée.'
      : 'Urgence enregistrée sur cet appareil. La synchronisation sera reprise automatiquement.')
  }

  const editItem = (item) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      dueDate: item.dueDate,
      priority: item.priority,
      ftNumber: item.ftNumber,
      notes: item.notes,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleComplete = async (item) => {
    if (item.completed && item.dueDate < today) {
      setMessage('Choisissez d’abord une nouvelle date avant de rouvrir cette urgence ancienne.')
      return
    }
    const result = item.completed
      ? await reopenUrgency(item.id)
      : await completeUrgency(item.id)
    setItems(result.items)
  }

  const reportItem = async (item) => {
    const chosenDate = rescheduleDates[item.id]
    if (!chosenDate || chosenDate <= today) {
      setMessage('Pour reporter, choisissez une date future.')
      return
    }
    const result = await rescheduleUrgency(item.id, chosenDate)
    setItems(result.items)
    setRescheduleDates((current) => ({ ...current, [item.id]: '' }))
    setMessage('Urgence reportée à la date choisie.')
  }

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderColor: '#86a8c5' }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#123d64' }}>
          Agenda perpétuel et urgences
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          À chaque ouverture quotidienne, les actions du jour et en retard doivent être réalisées ou reportées à une date choisie.
        </Typography>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1 }}>
        {[
          ['En retard', summary.overdue.length, '#c62828'],
          ["Aujourd’hui", summary.today.length, '#ef6c00'],
          ['À venir', summary.upcoming.length, '#1976d2'],
          ['Réalisées', summary.completed.length, '#2e7d32'],
        ].map(([label, count, color]) => (
          <Paper key={label} variant="outlined" sx={{ p: 1.5, borderTop: `5px solid ${color}` }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color }}>{count}</Typography>
            <Typography sx={{ fontWeight: 800 }}>{label}</Typography>
          </Paper>
        ))}
      </Box>

      <Paper component="form" onSubmit={saveForm} variant="outlined" sx={{ p: 2, borderColor: '#1976d2' }}>
        <Typography sx={{ fontWeight: 900, mb: 1.5 }}>
          {editingId ? 'Modifier cette urgence' : 'Ajouter une urgence'}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 180px 170px 190px' }, gap: 1.25 }}>
          <TextField
            label="Action ou urgence"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            required
            autoFocus
          />
          <TextField
            label="Date"
            type="date"
            value={form.dueDate}
            onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
            required
          />
          <FormControl>
            <InputLabel id="agenda-priority-label">Priorité</InputLabel>
            <Select
              labelId="agenda-priority-label"
              label="Priorité"
              value={form.priority}
              onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
            >
              <MenuItem value="urgente">Urgente</MenuItem>
              <MenuItem value="haute">Haute</MenuItem>
              <MenuItem value="normale">Normale</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="N° France Travail (facultatif)"
            value={form.ftNumber}
            onChange={(event) => setForm((current) => ({ ...current, ftNumber: event.target.value.toUpperCase() }))}
          />
        </Box>
        <TextField
          label="Notes utiles (facultatif)"
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          multiline
          minRows={2}
          fullWidth
          sx={{ mt: 1.25 }}
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
          <Button type="submit" variant="contained">{editingId ? 'Enregistrer les modifications' : 'Ajouter au calendrier'}</Button>
          {editingId ? <Button onClick={() => resetForm()}>Annuler</Button> : null}
        </Stack>
        {message ? <Alert severity={message.includes('synchronisée') || message.includes('reportée') ? 'success' : 'info'} sx={{ mt: 1.25 }}>{message}</Alert> : null}
      </Paper>

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', bgcolor: '#eaf2f8' }}>
          <Stack direction="row" spacing={1}>
            <Button onClick={() => changeMonth(-1)} aria-label="Mois précédent">←</Button>
            <Button onClick={() => changeMonth(1)} aria-label="Mois suivant">→</Button>
            <Button onClick={() => { setMonth(new Date(now.getFullYear(), now.getMonth(), 1, 12)); chooseDay({ id: today, inMonth: true }) }}>Aujourd’hui</Button>
          </Stack>
          <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'capitalize' }}>
            {MONTH_FORMATTER.format(month)}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', bgcolor: '#123d64', color: 'white' }}>
          {WEEK_DAYS.map((day) => <Typography key={day} align="center" sx={{ py: 0.75, fontWeight: 900 }}>{day}</Typography>)}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          {monthDays.map((day) => {
            const dayItems = items.filter((item) => item.dueDate === day.id && !item.completed)
            const isToday = day.id === today
            const isSelected = day.id === selectedDate
            return (
              <Box
                component="button"
                type="button"
                key={day.id}
                onClick={() => chooseDay(day)}
                sx={{
                  minHeight: { xs: 70, md: 112 },
                  p: 0.75,
                  textAlign: 'left',
                  border: '1px solid #d7e0e8',
                  bgcolor: isSelected ? '#e3f2fd' : 'white',
                  opacity: day.inMonth ? 1 : 0.48,
                  cursor: 'pointer',
                  outline: isSelected ? '3px solid #1976d2' : 'none',
                  outlineOffset: -3,
                }}
              >
                <Typography sx={{ fontWeight: 900, color: isToday ? '#d32f2f' : '#123d64' }}>{day.day}</Typography>
                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                  {dayItems.slice(0, 2).map((item) => (
                    <Box key={item.id} sx={{ px: 0.5, py: 0.25, bgcolor: priorityColor(item.priority), color: 'white', borderRadius: 0.5, overflow: 'hidden' }}>
                      <Typography variant="caption" noWrap sx={{ display: 'block', fontWeight: 800 }}>{item.title}</Typography>
                    </Box>
                  ))}
                  {dayItems.length > 2 ? <Typography variant="caption">+ {dayItems.length - 2} autre(s)</Typography> : null}
                </Stack>
              </Box>
            )
          })}
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
          {SHORT_DATE_FORMATTER.format(new Date(`${selectedDate}T12:00:00`))}
        </Typography>
        {!selectedItems.length ? <Alert severity="info">Aucune action enregistrée à cette date.</Alert> : null}
        <Stack spacing={1}>
          {selectedItems.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 1.25, borderLeft: `6px solid ${item.completed ? '#2e7d32' : priorityColor(item.priority)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                <Checkbox checked={item.completed} onChange={() => toggleComplete(item)} aria-label={`Marquer ${item.title} comme réalisée`} />
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography sx={{ fontWeight: 900, textDecoration: item.completed ? 'line-through' : 'none' }}>{item.title}</Typography>
                  <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                    <Chip size="small" label={item.completed ? 'Réalisée' : labelPriority(item.priority)} color={item.completed ? 'success' : 'default'} />
                    {item.ftNumber ? <Chip size="small" label={`N° FT ${item.ftNumber}`} /> : null}
                  </Stack>
                  {item.notes ? <Typography variant="body2" sx={{ mt: 0.75 }}>{item.notes}</Typography> : null}
                </Box>
                <Button size="small" onClick={() => editItem(item)}>Modifier</Button>
                {item.ftNumber ? <Button component={Link} to={`/assistant?dossier=${encodeURIComponent(item.ftNumber)}`} size="small">Ouvrir le dossier</Button> : null}
              </Box>
              {!item.completed ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1, ml: { sm: 6 } }}>
                  <TextField
                    type="date"
                    size="small"
                    label="Reporter au"
                    value={rescheduleDates[item.id] || ''}
                    onChange={(event) => setRescheduleDates((current) => ({ ...current, [item.id]: event.target.value }))}
                    slotProps={{
                      htmlInput: { min: tomorrowId() },
                      inputLabel: { shrink: true },
                    }}
                  />
                  <Button variant="outlined" onClick={() => reportItem(item)}>Reporter</Button>
                </Stack>
              ) : null}
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Stack>
  )
}

export default UrgencyCalendarPage
