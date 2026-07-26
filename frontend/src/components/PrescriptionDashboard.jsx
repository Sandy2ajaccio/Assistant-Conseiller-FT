import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const PrescriptionDashboard = ({
  items = [],
  recommendedNames = [],
  alerts = [],
  initialSearch = '',
  initialType = 'Tous',
  onSelect,
}) => {
  const [search, setSearch] = useState(initialSearch)
  const [type, setType] = useState(initialType)
  const [selectedId, setSelectedId] = useState(null)
  const [retainedId, setRetainedId] = useState(null)

  const recommended = useMemo(
    () => recommendedNames.map(normalize).filter(Boolean),
    [recommendedNames],
  )

  const isRecommended = (item) => {
    const label = normalize(`${item.code || ''} ${item.nom}`)
    return recommended.some((name) => label.includes(name) || name.includes(normalize(item.nom)))
  }

  const filteredItems = useMemo(() => {
    const query = normalize(search)
    return items
      .filter((item) => type === 'Tous' || item.type === type)
      .filter((item) => !query || normalize(Object.values(item).join(' ')).includes(query))
      .sort((a, b) => Number(isRecommended(b)) - Number(isRecommended(a)) || a.nom.localeCompare(b.nom))
  }, [items, search, type, recommended])

  useEffect(() => {
    if (!filteredItems.some((item) => item.id === selectedId)) {
      setSelectedId(filteredItems[0]?.id || null)
    }
  }, [filteredItems, selectedId])

  const selected = filteredItems.find((item) => item.id === selectedId) || filteredItems[0]
  const atelierCount = items.filter((item) => item.type === 'Atelier').length
  const prestationCount = items.filter((item) => item.type === 'Prestation').length
  const recommendedCount = items.filter(isRecommended).length
  const domainCounts = Object.entries(items.reduce((acc, item) => {
    acc[item.domaine] = (acc[item.domaine] || 0) + 1
    return acc
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxDomain = Math.max(...domainCounts.map(([, count]) => count), 1)

  const choose = () => {
    if (!selected) return
    setRetainedId(selected.id)
    onSelect?.(selected)
  }

  return (
    <Stack spacing={1.25}>
      <Grid container spacing={1}>
        {[
          ['Dispositifs', items.length, '#1565c0'],
          ['Ateliers', atelierCount, '#00897b'],
          ['Prestations', prestationCount, '#7b1fa2'],
          ['Adaptés au besoin', recommendedCount, recommendedCount ? '#2e7d32' : '#ed6c02'],
        ].map(([label, value, color]) => (
          <Grid key={label} size={{ xs: 6, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 1.25, borderTop: `4px solid ${color}` }}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="h4" sx={{ color, fontWeight: 800, lineHeight: 1.1 }}>{value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {alerts.length > 0 ? (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          {alerts.slice(0, 2).map((alert) => (
            <Alert key={`${alert.severity}-${alert.texte}`} severity={alert.severity} sx={{ flex: 1, py: 0 }}>
              {alert.texte}
            </Alert>
          ))}
        </Stack>
      ) : null}

      <Paper variant="outlined" sx={{ p: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            placeholder="Rechercher un atelier, un besoin, un code..."
            sx={{ flex: 1 }}
          />
          <Stack direction="row" spacing={0.5}>
            {['Tous', 'Atelier', 'Prestation'].map((value) => (
              <Button
                key={value}
                size="small"
                variant={type === value ? 'contained' : 'outlined'}
                onClick={() => setType(value)}
              >
                {value}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={1.25}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '70px minmax(190px, 1.6fr) 1fr 90px 1fr',
                gap: 1,
                px: 1.25,
                py: 0.8,
                bgcolor: '#eef3f8',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              {['État', 'Dispositif', 'Public', 'Durée', 'Domaine'].map((label) => (
                <Typography key={label} variant="caption" sx={{ fontWeight: 800 }}>{label}</Typography>
              ))}
            </Box>
            <Box sx={{ height: 430, overflowY: 'auto' }}>
              {filteredItems.map((item) => {
                const active = selected?.id === item.id
                const suggested = isRecommended(item)
                return (
                  <Box
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '70px minmax(190px, 1.6fr) 1fr 90px 1fr',
                      gap: 1,
                      alignItems: 'center',
                      px: 1.25,
                      py: 0.85,
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: active ? '#e8f2ff' : suggested ? '#f1faf3' : '#fff',
                      borderLeft: '5px solid',
                      borderLeftColor: suggested ? 'success.main' : 'transparent',
                      '&:hover': { bgcolor: '#f4f7fb' },
                    }}
                  >
                    <Chip
                      size="small"
                      color={suggested ? 'success' : 'default'}
                      label={suggested ? 'Conseillé' : item.type}
                      sx={{ fontSize: '0.67rem' }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                        {item.code ? `${item.code} · ` : ''}{item.nom}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {item.intervenants}
                      </Typography>
                    </Box>
                    <Typography variant="body2" noWrap>{item.public}</Typography>
                    <Typography variant="caption" noWrap>{item.duree}</Typography>
                    <Typography variant="body2" noWrap>{item.domaine}</Typography>
                  </Box>
                )
              })}
              {filteredItems.length === 0 ? (
                <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                  Aucun dispositif ne correspond à cette recherche.
                </Typography>
              ) : null}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={1.25}>
            <Paper variant="outlined" sx={{ p: 1.5, minHeight: 315, borderTop: '5px solid', borderTopColor: isRecommended(selected || {}) ? 'success.main' : 'primary.main' }}>
              {selected ? (
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 800 }}>
                        {selected.type.toUpperCase()} · {selected.code}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.15 }}>{selected.nom}</Typography>
                    </Box>
                    {isRecommended(selected) ? <Chip color="success" size="small" label="Adapté au besoin" /> : null}
                  </Stack>
                  <Typography variant="body2"><strong>Objectif :</strong> {selected.objectif}</Typography>
                  <Typography variant="body2"><strong>Accès :</strong> {selected.conditions}</Typography>
                  <Box sx={{ p: 1, bgcolor: '#eef5ff', borderRadius: 1 }}>
                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 800 }}>CHEMIN DE PRESCRIPTION</Typography>
                    <Typography variant="body2">{selected.prescription}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {selected.localisation} · {selected.duree} · {selected.intervenants}
                  </Typography>
                  <Button variant="contained" color={retainedId === selected.id ? 'success' : 'primary'} onClick={choose}>
                    {retainedId === selected.id ? 'Prescription retenue' : 'Retenir cette prescription'}
                  </Button>
                </Stack>
              ) : null}
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.25 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.75 }}>Répartition par besoin</Typography>
              {domainCounts.map(([domain, count]) => (
                <Box key={domain} sx={{ mb: 0.65 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption">{domain}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{count}</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={(count / maxDomain) * 100} sx={{ height: 5, borderRadius: 4 }} />
                </Box>
              ))}
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default PrescriptionDashboard
