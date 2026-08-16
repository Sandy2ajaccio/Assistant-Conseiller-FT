import { useMemo, useState } from 'react'
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'

const normalize = (value) => String(value || '').trim()
const genericValue = (value) => /^(autres?|cat\.\s*\d+)$/i.test(normalize(value))

const FILTERS = [
  { id: 'attention', label: 'À traiter', color: 'error' },
  { id: 'pending', label: 'À prescrire', color: 'warning' },
  { id: 'ongoing', label: 'En cours', color: 'info' },
  { id: 'done', label: 'Réalisées', color: 'success' },
  { id: 'deadlines', label: 'Échéances', color: 'secondary' },
  { id: 'all', label: 'Toutes', color: 'primary' },
]

const categoryFor = (status, deadline) => {
  if (['Abandonné', 'Résultat à analyser'].includes(status)) return 'attention'
  if (!status || status === 'À prescrire') return 'pending'
  if (['Prescrit', 'Convoqué', 'Commencé'].includes(status)) return 'ongoing'
  if (status === 'Réalisé') return 'done'
  if (deadline) return 'deadlines'
  return 'pending'
}

const buildItems = (dossiers) => dossiers.flatMap((entry) => {
  const dossier = entry.dossier || {}
  const record = entry.portfolioRecord || {}
  const identity = entry.identifiant
  const deadline = normalize(record.echeance || record.dateRappel)
  const selected = Array.isArray(dossier.actionsRetenues) ? dossier.actionsRetenues : []
  const actions = selected.map((action) => {
    const status = action.suiviStatut || 'À prescrire'
    return {
      id: `${entry.identifiant}-${action.categorieDecision || action.type}-${action.nom}`,
      identifiant: entry.identifiant,
      identity,
      action: action.nom,
      type: action.interne ? 'Interne' : action.categorieDecision || action.type || 'Action',
      status,
      deadline,
      category: categoryFor(status, deadline),
    }
  })

  if (actions.length === 0) {
    const importedActions = [
      ['Atelier', record.atelier],
      ['Prestation', record.prestation],
      ['Formation', record.formation],
    ].filter(([, value]) => normalize(value) && !genericValue(value))
    importedActions.forEach(([type, action]) => {
      const status = normalize(record.actionRealisee) ? 'Réalisé' : 'À prescrire'
      actions.push({
        id: `${entry.identifiant}-${type}-${action}`,
        identifiant: entry.identifiant,
        identity,
        action,
        type,
        status,
        deadline,
        category: categoryFor(status, deadline),
      })
    })
  }

  if (actions.length === 0 && deadline) {
    actions.push({
      id: `${entry.identifiant}-echeance`,
      identifiant: entry.identifiant,
      identity,
      action: normalize(record.action || record.decision) || 'Action à définir',
      type: 'Échéance',
      status: 'À traiter',
      deadline,
      category: 'deadlines',
    })
  }
  return actions
})

export default function PrescriptionFollowUp({ dossiers, onOpen }) {
  const [activeFilter, setActiveFilter] = useState('pending')
  const items = useMemo(() => buildItems(dossiers), [dossiers])
  const counts = useMemo(() => Object.fromEntries(
    FILTERS.map((filter) => [
      filter.id,
      filter.id === 'all'
        ? items.length
        : filter.id === 'deadlines'
          ? items.filter((item) => item.deadline).length
          : items.filter((item) => item.category === filter.id).length,
    ]),
  ), [items])
  const displayed = useMemo(() => items
    .filter((item) => (
      activeFilter === 'all'
        || (activeFilter === 'deadlines' ? item.deadline : item.category === activeFilter)
    ))
    .slice(0, 6), [activeFilter, items])

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', borderColor: '#8fb2cf' }}>
      <Box sx={{ px: 1.5, py: 1, color: '#fff', background: 'linear-gradient(90deg, #17466f, #0b7c72)' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ lg: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>Suivi des prescriptions et échéances</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,.88)' }}>
              Repérez immédiatement les actions sans suite et les résultats restant à analyser.
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap">
            {FILTERS.map((filter) => (
              <Button
                key={filter.id}
                size="small"
                color={filter.color}
                variant={activeFilter === filter.id ? 'contained' : 'outlined'}
                onClick={() => setActiveFilter(filter.id)}
                sx={{
                  bgcolor: activeFilter === filter.id ? undefined : 'rgba(255,255,255,.96)',
                  fontWeight: 900,
                  boxShadow: activeFilter === filter.id ? 3 : 0,
                }}
              >
                {activeFilter === filter.id ? '✓ ' : ''}{filter.label} · {counts[filter.id]}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          display: { xs: 'none', lg: 'grid' },
          gridTemplateColumns: 'minmax(170px,1fr) minmax(220px,1.6fr) 110px 130px 110px',
          gap: 1,
          px: 1.25,
          py: .6,
          bgcolor: '#e9f1f7',
        }}
      >
        {['DE', 'Prescription / action', 'Type', 'État', 'Échéance'].map((label) => (
          <Typography key={label} variant="caption" sx={{ fontWeight: 900 }}>{label}</Typography>
        ))}
      </Box>

      {displayed.length ? displayed.map((item) => (
        <Box
          key={item.id}
          onClick={() => onOpen(item.identifiant)}
          sx={{
            display: { xs: 'flex', lg: 'grid' },
            flexDirection: { xs: 'column' },
            gridTemplateColumns: { lg: 'minmax(170px,1fr) minmax(220px,1.6fr) 110px 130px 110px' },
            gap: 1,
            alignItems: { xs: 'flex-start', lg: 'center' },
            px: 1.25,
            py: .7,
            borderBottom: '1px solid #e0e7ee',
            cursor: 'pointer',
            '&:hover': { bgcolor: '#eef7ff' },
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 900 }}>{item.identity}</Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.action}</Typography>
          <Chip size="small" variant="outlined" label={item.type} />
          <Chip
            size="small"
            color={item.category === 'attention' ? 'error' : item.category === 'done' ? 'success' : item.category === 'ongoing' ? 'info' : 'warning'}
            label={item.status}
          />
          <Typography variant="body2" color={item.deadline ? 'secondary.main' : 'text.secondary'} sx={{ fontWeight: 800 }}>
            <Box component="span" sx={{ display: { xs: 'inline', lg: 'none' }, fontWeight: 900 }}>
              Échéance :{' '}
            </Box>
            {item.deadline || 'Non datée'}
          </Typography>
        </Box>
      )) : (
        <Box sx={{ p: 1.5 }}>
          <Typography color="text.secondary">Aucune prescription ne correspond à cette vue.</Typography>
        </Box>
      )}
    </Paper>
  )
}
