import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

import {
  canRescheduleForDailyReview,
  dateId,
  summarizeUrgencies,
  tomorrowId,
} from '../services/urgencyCalendarRules.js'
import {
  completeUrgency,
  dailyReviewWasSeen,
  loadUrgencies,
  markDailyReviewSeen,
  rescheduleUrgency,
  subscribeUrgencies,
} from '../services/urgencyCalendarService.js'

const formatDate = (value) => new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date(`${value}T12:00:00`))

function DailyAgendaDialog() {
  const navigate = useNavigate()
  const today = dateId()
  const [items, setItems] = useState(() => loadUrgencies())
  const [open, setOpen] = useState(false)
  const [newDates, setNewDates] = useState({})
  const [message, setMessage] = useState('')

  const summary = useMemo(() => summarizeUrgencies(items, today), [items, today])
  const dueItems = useMemo(
    () => [...summary.overdue, ...summary.today],
    [summary.overdue, summary.today],
  )

  useEffect(() => {
    const initialItems = loadUrgencies()
    const initialSummary = summarizeUrgencies(initialItems, today)
    setItems(initialItems)
    if (
      initialSummary.overdue.length
      || initialSummary.today.length
      || !dailyReviewWasSeen(today)
    ) {
      setOpen(true)
    }
    return subscribeUrgencies(setItems)
  }, [today])

  const handleComplete = async (id) => {
    setMessage('')
    const result = await completeUrgency(id)
    setItems(result.items)
  }

  const handleReschedule = async (id) => {
    const chosenDate = newDates[id] || ''
    if (!canRescheduleForDailyReview(chosenDate, today)) {
      setMessage('Choisissez une date à partir de demain pour reporter cette urgence.')
      return
    }
    setMessage('')
    const result = await rescheduleUrgency(id, chosenDate)
    setItems(result.items)
    setNewDates((current) => ({ ...current, [id]: '' }))
  }

  const closeReview = () => {
    const remaining = summarizeUrgencies(loadUrgencies(), today)
    if (remaining.overdue.length || remaining.today.length) {
      setMessage('Chaque urgence du jour ou en retard doit être cochée ou reportée avant de fermer.')
      return
    }
    markDailyReviewSeen(today)
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      disableEscapeKeyDown={dueItems.length > 0}
      onClose={() => {
        if (!dueItems.length) closeReview()
      }}
      aria-labelledby="daily-agenda-title"
    >
      <DialogTitle id="daily-agenda-title" sx={{ fontWeight: 900, bgcolor: '#123d64', color: 'white' }}>
        Bilan du jour · {formatDate(today)}
      </DialogTitle>

      <DialogContent sx={{ pt: '20px !important' }}>
        <Stack spacing={2}>
          {summary.overdue.length ? (
            <Alert severity="error">
              {summary.overdue.length} urgence(s) en retard. Une décision est obligatoire pour chacune.
            </Alert>
          ) : null}

          {summary.today.length ? (
            <Alert severity="warning">
              {summary.today.length} urgence(s) prévue(s) aujourd’hui.
            </Alert>
          ) : null}

          {!dueItems.length ? (
            <Alert severity="success">
              Aucune urgence en attente pour aujourd’hui. Vous pouvez commencer votre journée.
            </Alert>
          ) : null}

          {dueItems.map((item) => {
            const isOverdue = item.dueDate < today
            return (
              <Paper
                key={item.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderWidth: 2,
                  borderColor: isOverdue ? '#d32f2f' : '#ed6c02',
                }}
              >
                <Stack spacing={1.25}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 900, flex: 1, minWidth: 220 }}>
                      {item.title}
                    </Typography>
                    <Chip
                      size="small"
                      color={isOverdue ? 'error' : 'warning'}
                      label={isOverdue ? `En retard · ${formatDate(item.dueDate)}` : 'Aujourd’hui'}
                    />
                    {item.ftNumber ? <Chip size="small" label={`N° FT ${item.ftNumber}`} /> : null}
                  </Box>

                  {item.notes ? <Typography variant="body2">{item.notes}</Typography> : null}

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'auto minmax(180px, 1fr) auto' },
                      gap: 1,
                      alignItems: 'center',
                    }}
                  >
                    <FormControlLabel
                      control={<Checkbox onChange={() => handleComplete(item.id)} />}
                      label="Réalisée"
                      sx={{ m: 0, fontWeight: 800 }}
                    />
                    <TextField
                      type="date"
                      size="small"
                      value={newDates[item.id] || ''}
                      onChange={(event) => setNewDates((current) => ({
                        ...current,
                        [item.id]: event.target.value,
                      }))}
                      label="Nouvelle date"
                      slotProps={{
                        htmlInput: { min: tomorrowId() },
                        inputLabel: { shrink: true },
                      }}
                    />
                    <Button variant="outlined" onClick={() => handleReschedule(item.id)}>
                      Reporter
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            )
          })}

          {message ? <Alert severity="warning">{message}</Alert> : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap' }}>
        <Button
          onClick={() => {
            setOpen(false)
            navigate('/agenda')
          }}
          disabled={dueItems.length > 0}
        >
          Ouvrir le calendrier
        </Button>
        <Button variant="contained" onClick={closeReview} disabled={dueItems.length > 0}>
          Commencer ma journée
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DailyAgendaDialog
