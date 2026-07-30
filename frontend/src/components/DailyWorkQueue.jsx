import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

const normalize = (value) => String(value || '').trim().toLowerCase()

const buildWorkItem = (entry) => {
  const record = entry.portfolioRecord || {}
  const priorityHigh = normalize(record.priorite) === 'haute'
  const contractPending = normalize(record.contratEngagement).includes('signer')
  const hasIncident = Boolean(record.alerte || record.dateManquement)
  const hasContact = Boolean(
    record.historiqueEntretiens
    || record.historiqueAppels
    || record.historiqueMails
    || record.historiqueCourriers,
  )
  const callbackPending = Boolean(record.aRappeler || record.dateRappel)
  const hasNextAction = Boolean(record.actionRealisee || record.action || record.decision || record.echeance)

  let score = 0
  if (hasIncident) score += 100
  if (priorityHigh) score += 70
  if (callbackPending) score += 60
  if (contractPending) score += 45
  if (!hasContact) score += 25
  if (!hasNextAction) score += 20

  let status = 'À planifier'
  let color = 'warning'
  let reason = 'Définir et dater la prochaine action.'
  if (hasIncident) {
    status = 'Urgent'
    color = 'error'
    reason = `Traiter ${record.alerte || 'le manquement'} et tracer la décision.`
  } else if (priorityHigh) {
    status = 'Prioritaire'
    color = 'error'
    reason = 'Contacter rapidement ce DE prioritaire.'
  } else if (callbackPending) {
    status = 'À rappeler'
    color = 'warning'
    reason = `Effectuer le rappel${record.dateRappel ? ` prévu le ${record.dateRappel}` : ''}.`
  } else if (contractPending) {
    status = 'Contrat'
    color = 'warning'
    reason = 'Expliquer et faire signer le contrat d’engagement.'
  } else if (!hasContact) {
    status = 'Sans contact'
    color = 'info'
    reason = 'Planifier et tracer un premier contact.'
  } else if (!hasNextAction) {
    status = 'Sans suite'
    color = 'info'
    reason = 'Définir une prochaine action datée.'
  }

  return {
    ...entry,
    score,
    status,
    color,
    reason,
    contractPending,
    hasIncident,
    hasContact,
    callbackPending,
    hasNextAction,
    identity: [record.nom, record.prenom].filter(Boolean).join(' ') || entry.identifiant,
    lastContact: record.historiqueEntretiens
      || record.historiqueAppels
      || record.historiqueMails
      || record.historiqueCourriers
      || 'Aucun contact',
  }
}

const filters = [
  { id: 'actions', label: 'À traiter', description: 'Dossiers ayant au moins une action ou vérification à réaliser.' },
  { id: 'urgent', label: 'Urgents', description: 'Alertes, incidents ou priorités hautes à traiter en premier.' },
  { id: 'contracts', label: 'Contrats', description: 'Contrats d’engagement restant à expliquer, formaliser ou signer.' },
  { id: 'withoutContact', label: 'Sans contact', description: 'Dossiers sans entretien, appel, courriel ou courrier tracé.' },
  { id: 'all', label: 'Tous les DE', description: 'Ensemble des demandeurs d’emploi importés.' },
]

const DailyWorkQueue = ({ dossiers, selectedDossierId, onSelect, onOpen }) => {
  const [activeFilter, setActiveFilter] = useState('actions')
  const [search, setSearch] = useState('')

  const allItems = useMemo(
    () => dossiers.map(buildWorkItem).sort((a, b) => b.score - a.score || a.identity.localeCompare(b.identity, 'fr')),
    [dossiers],
  )

  const counts = useMemo(() => ({
    actions: allItems.filter((item) => item.score > 0).length,
    urgent: allItems.filter((item) => item.hasIncident || normalize(item.portfolioRecord?.priorite) === 'haute').length,
    contracts: allItems.filter((item) => item.contractPending).length,
    withoutContact: allItems.filter((item) => !item.hasContact).length,
    all: allItems.length,
  }), [allItems])

  const displayedItems = useMemo(() => {
    const query = normalize(search)
    return allItems
      .filter((item) => {
        if (activeFilter === 'urgent') return item.hasIncident || normalize(item.portfolioRecord?.priorite) === 'haute'
        if (activeFilter === 'contracts') return item.contractPending
        if (activeFilter === 'withoutContact') return !item.hasContact
        if (activeFilter === 'actions') return item.score > 0
        return true
      })
      .filter((item) => !query || normalize(`${item.identity} ${item.identifiant} ${item.reason}`).includes(query))
      .map((item) => {
        if (activeFilter === 'contracts') {
          return { ...item, displayStatus: 'Contrat', displayColor: 'warning', displayReason: 'Expliquer, formaliser ou faire signer le contrat d’engagement.' }
        }
        if (activeFilter === 'withoutContact') {
          return { ...item, displayStatus: 'Sans contact', displayColor: 'info', displayReason: 'Planifier et tracer un premier contact.' }
        }
        if (activeFilter === 'urgent') {
          return { ...item, displayStatus: 'Urgent', displayColor: 'error', displayReason: item.hasIncident ? item.reason : 'Contacter rapidement ce DE prioritaire.' }
        }
        return { ...item, displayStatus: item.status, displayColor: item.color, displayReason: item.reason }
      })
      .slice(0, 6)
  }, [activeFilter, allItems, search])

  const activeFilterConfig = filters.find((filter) => filter.id === activeFilter) || filters[0]

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', borderColor: '#9bb8d3' }}>
      <Box sx={{ px: 1.5, py: 1, bgcolor: '#eef5fb', borderBottom: '1px solid #b8cadc' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} alignItems={{ lg: 'center' }} justifyContent="space-between" spacing={1}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#123d64' }}>
              Ma liste de travail
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Les dossiers sont classés automatiquement selon l’urgence et les actions manquantes.
            </Typography>
          </Box>
          <TextField
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un DE dans la liste…"
            sx={{ width: { xs: '100%', lg: 330 }, bgcolor: '#fff' }}
          />
        </Stack>

        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
          {filters.map((filter) => (
            <Button
              key={filter.id}
              size="small"
              variant={activeFilter === filter.id ? 'contained' : 'outlined'}
              color={filter.id === 'urgent' ? 'error' : filter.id === 'contracts' ? 'warning' : 'primary'}
              onClick={() => {
                setActiveFilter(filter.id)
                setSearch('')
              }}
              aria-pressed={activeFilter === filter.id}
              sx={{
                fontWeight: 800,
                transform: activeFilter === filter.id ? 'translateY(-2px)' : 'none',
                boxShadow: activeFilter === filter.id ? 3 : 0,
              }}
            >
              {activeFilter === filter.id ? '✓ ' : ''}{filter.label} · {counts[filter.id]}
            </Button>
          ))}
        </Stack>
      </Box>

      <Box
        role="status"
        aria-live="polite"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, bgcolor: '#fff8e8', borderBottom: '2px solid #f0a22e' }}
      >
        <Typography variant="body2" sx={{ fontWeight: 900, color: '#8a4b00' }}>
          Vue active : {activeFilterConfig.label} ({counts[activeFilter]})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {activeFilterConfig.description}
        </Typography>
      </Box>

      <Box
        sx={{
          display: { xs: 'none', lg: 'grid' },
          gridTemplateColumns: 'minmax(170px, 1fr) 100px minmax(220px, 1.5fr) 130px 170px',
          bgcolor: '#173f67',
          color: '#fff',
          px: 1.25,
          py: 0.65,
          gap: 1,
        }}
      >
        {['DE', 'Niveau', 'Pourquoi maintenant ?', 'Dernier contact', 'Action directe'].map((label) => (
          <Typography key={label} variant="caption" sx={{ fontWeight: 900 }}>{label}</Typography>
        ))}
      </Box>

      {displayedItems.length ? displayedItems.map((item) => (
        <Box
          key={item.identifiant}
          onClick={() => onSelect(item.identifiant)}
          sx={{
            display: { xs: 'flex', lg: 'grid' },
            flexDirection: { xs: 'column' },
            gridTemplateColumns: { lg: 'minmax(170px, 1fr) 100px minmax(220px, 1.5fr) 130px 170px' },
            alignItems: { xs: 'stretch', lg: 'center' },
            gap: 1,
            px: 1.25,
            py: 0.7,
            cursor: 'pointer',
            bgcolor: selectedDossierId === item.identifiant ? '#e3f2fd' : '#fff',
            borderBottom: '1px solid #e2e8ef',
            borderLeft: selectedDossierId === item.identifiant ? '6px solid #1976d2' : '6px solid transparent',
            '&:hover': { bgcolor: '#f0f7ff' },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 900 }}>{item.identity}</Typography>
            <Typography variant="caption" color="text.secondary">
              {item.identifiant}{item.portfolioRecord?.age ? ` · ${item.portfolioRecord.age} ans` : ''}
            </Typography>
          </Box>
          <Chip
            label={item.displayStatus}
            color={item.displayColor}
            size="small"
            sx={{ fontWeight: 800, alignSelf: { xs: 'flex-start', lg: 'center' }, minWidth: 88 }}
          />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.displayReason}</Typography>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            <Box component="span" sx={{ display: { xs: 'inline', lg: 'none' }, fontWeight: 900 }}>
              Dernier contact :{' '}
            </Box>
            {item.lastContact}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
            <Button size="small" variant="outlined" onClick={(event) => { event.stopPropagation(); onSelect(item.identifiant) }}>
              Analyser
            </Button>
            <Button size="small" variant="contained" onClick={(event) => { event.stopPropagation(); onOpen(item.identifiant) }}>
              Ouvrir
            </Button>
          </Stack>
        </Box>
      )) : (
        <Box sx={{ p: 2 }}>
          <Typography color="text.secondary">Aucun dossier ne correspond à ce filtre.</Typography>
        </Box>
      )}

      {displayedItems.length ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1.5, py: 0.75 }}>
          Les {displayedItems.length} dossiers les plus prioritaires sont affichés. Utilisez les filtres ou la recherche pour accéder aux autres.
        </Typography>
      ) : null}
    </Paper>
  )
}

export default DailyWorkQueue
