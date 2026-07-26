import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const DOMAIN_COLORS = ['#1976d2', '#8e24aa', '#00897b', '#f57c00', '#d32f2f']

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
  const [chartDimension, setChartDimension] = useState('domaine')
  const [chartFilter, setChartFilter] = useState('')

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
      .filter((item) => !chartFilter || item[chartDimension] === chartFilter)
      .filter((item) => !query || normalize(Object.values(item).join(' ')).includes(query))
      .sort((a, b) => Number(isRecommended(b)) - Number(isRecommended(a)) || a.nom.localeCompare(b.nom))
  }, [items, search, type, recommended, chartFilter, chartDimension])

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
  const pivotData = useMemo(() => {
    const groups = items.reduce((acc, item) => {
      const key = item[chartDimension] || 'Non renseigné'
      if (!acc[key]) acc[key] = { label: key, Atelier: 0, Prestation: 0, total: 0, recommended: 0 }
      acc[key][item.type] = (acc[key][item.type] || 0) + 1
      acc[key].total += 1
      if (isRecommended(item)) acc[key].recommended += 1
      return acc
    }, {})
    return Object.values(groups).sort((a, b) => b.total - a.total).slice(0, 8)
  }, [items, chartDimension, recommended])
  const maxPivot = Math.max(...pivotData.map((entry) => entry.total), 1)

  const choose = () => {
    if (!selected) return
    setRetainedId(selected.id)
    onSelect?.(selected)
  }

  return (
    <Stack spacing={1.25}>
      <Grid container spacing={1}>
        {[
          ['Dispositifs', items.length, Math.min(100, (items.length / 40) * 100), '#1565c0'],
          ['Ateliers', atelierCount, items.length ? (atelierCount / items.length) * 100 : 0, '#00897b'],
          ['Prestations', prestationCount, items.length ? (prestationCount / items.length) * 100 : 0, '#7b1fa2'],
          ['Adaptés au besoin', recommendedCount, items.length ? (recommendedCount / items.length) * 100 : 0, recommendedCount ? '#2e7d32' : '#ed6c02'],
        ].map(([label, value, percentage, color], index) => (
          <Grid key={label} size={{ xs: 6, md: 3 }}>
            <Paper
              sx={{
                p: 1.25,
                minHeight: 104,
                borderLeft: `7px solid ${color}`,
                bgcolor: ['#e3f2fd', '#e0f2f1', '#f3e5f5', '#fff3e0'][index],
                boxShadow: '0 2px 8px rgba(15, 35, 65, 0.12)',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="caption" sx={{ color, fontWeight: 800 }}>{label}</Typography>
                  <Typography variant="h4" sx={{ color, fontWeight: 900, lineHeight: 1.1 }}>{value}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {index === 0 ? 'sur un repère de 40' : `${Math.round(percentage)} % du catalogue`}
                  </Typography>
                </Box>
                <Box
                  role="img"
                  aria-label={`${label} : ${Math.round(percentage)} %`}
                  sx={{
                    position: 'relative',
                    width: 84,
                    height: 84,
                    flex: '0 0 84px',
                    borderRadius: '50%',
                    background: `conic-gradient(${color} ${Math.max(2, percentage)}%, rgba(255,255,255,0.72) 0)`,
                    boxShadow: 'inset 0 0 0 1px rgba(20,45,75,0.08)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 11,
                      borderRadius: '50%',
                      bgcolor: ['#e3f2fd', '#e0f2f1', '#f3e5f5', '#fff3e0'][index],
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 1,
                      display: 'grid',
                      placeItems: 'center',
                      color,
                      fontWeight: 900,
                      fontSize: '0.9rem',
                    }}
                  >
                    {Math.round(percentage)} %
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper variant="outlined" sx={{ p: 1.25, bgcolor: '#fff', borderTop: '5px solid #244d78' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#244d78' }}>
                  Graphique croisé dynamique
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cliquez sur une barre pour filtrer la liste.
                </Typography>
              </Box>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="pivot-axis-label">Analyser par</InputLabel>
                <Select
                  labelId="pivot-axis-label"
                  value={chartDimension}
                  label="Analyser par"
                  onChange={(event) => {
                    setChartDimension(event.target.value)
                    setChartFilter('')
                  }}
                >
                  <MenuItem value="domaine">Domaine</MenuItem>
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="localisation">Localisation</MenuItem>
                  <MenuItem value="partenaire">Partenaire</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0.8 }}>
              {pivotData.map((entry) => (
                <Box
                  key={entry.label}
                  onClick={() => setChartFilter((current) => current === entry.label ? '' : entry.label)}
                  sx={{
                    p: 0.7,
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: chartFilter === entry.label ? '#dcecff' : '#f7f9fc',
                    border: '1px solid',
                    borderColor: chartFilter === entry.label ? '#1976d2' : '#e1e6ed',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800 }} noWrap>
                    {entry.label} · <Box component="span" sx={{ fontWeight: 900 }}>{entry.total}</Box>
                  </Typography>
                  <Box sx={{ display: 'flex', height: 10, mt: 0.35, bgcolor: '#e8edf3', borderRadius: 5, overflow: 'hidden' }}>
                    <Box title={`${entry.Atelier} atelier(s)`} sx={{ width: `${(entry.Atelier / maxPivot) * 100}%`, bgcolor: '#00897b' }} />
                    <Box title={`${entry.Prestation} prestation(s)`} sx={{ width: `${(entry.Prestation / maxPivot) * 100}%`, bgcolor: '#8e24aa' }} />
                  </Box>
                  <Box sx={{ height: 3, mt: 0.25, borderRadius: 4, width: `${(entry.recommended / maxPivot) * 100}%`, bgcolor: '#43a047' }} />
                </Box>
              ))}
            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: 0.8 }}>
              <Typography variant="caption"><Box component="span" sx={{ color: '#00897b' }}>●</Box> Ateliers</Typography>
              <Typography variant="caption"><Box component="span" sx={{ color: '#8e24aa' }}>●</Box> Prestations</Typography>
              <Typography variant="caption"><Box component="span" sx={{ color: '#43a047' }}>●</Box> Adaptés au DE</Typography>
              {chartFilter ? <Chip size="small" color="primary" label={`Filtre : ${chartFilter} ×`} onClick={() => setChartFilter('')} /> : null}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper variant="outlined" sx={{ p: 1.25, height: '100%', borderTop: '5px solid #f57c00' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#8a4b00' }}>Répartition de l’offre</Typography>
            <Stack direction="row" alignItems="center" justifyContent="space-around" sx={{ mt: 1 }}>
              <Box
                sx={{
                  width: 132,
                  height: 132,
                  borderRadius: '50%',
                  position: 'relative',
                  background: `conic-gradient(#00897b 0 ${(atelierCount / Math.max(items.length, 1)) * 100}%, #8e24aa 0 100%)`,
                  '&::after': { content: '""', position: 'absolute', inset: 24, borderRadius: '50%', bgcolor: '#fff' },
                }}
              >
                <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{items.length}</Typography>
                    <Typography variant="caption">solutions</Typography>
                  </Box>
                </Box>
              </Box>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">ATELIERS</Typography>
                  <Typography variant="h5" sx={{ color: '#00897b', fontWeight: 900 }}>{atelierCount}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">PRESTATIONS</Typography>
                  <Typography variant="h5" sx={{ color: '#8e24aa', fontWeight: 900 }}>{prestationCount}</Typography>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
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

      <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f4f8fd', borderColor: '#bbdefb' }}>
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
                bgcolor: '#244d78',
                color: '#fff',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              {['État', 'Dispositif', 'Public', 'Durée', 'Domaine'].map((label) => (
                <Typography key={label} variant="caption" sx={{ fontWeight: 800, color: 'inherit' }}>{label}</Typography>
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
                      bgcolor: active ? '#d9ecff' : suggested ? '#e5f6e9' : item.type === 'Atelier' ? '#f3fbfa' : '#fbf5fc',
                      borderLeft: '5px solid',
                      borderLeftColor: suggested ? 'success.main' : item.type === 'Atelier' ? '#26a69a' : '#ab47bc',
                      '&:hover': { bgcolor: '#e6f1fc' },
                    }}
                  >
                    <Chip
                      size="small"
                      color={suggested ? 'success' : item.type === 'Atelier' ? 'primary' : 'secondary'}
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
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                minHeight: 315,
                borderTop: '7px solid',
                borderTopColor: isRecommended(selected || {}) ? 'success.main' : selected?.type === 'Atelier' ? '#00897b' : '#8e24aa',
                bgcolor: isRecommended(selected || {}) ? '#f1faf3' : selected?.type === 'Atelier' ? '#f1fbfa' : '#fbf4fc',
                boxShadow: '0 3px 12px rgba(15, 35, 65, 0.12)',
              }}
            >
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
                  <Box sx={{ p: 1, bgcolor: '#dcecff', borderRadius: 1, borderLeft: '4px solid #1976d2' }}>
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

            <Paper variant="outlined" sx={{ p: 1.25, bgcolor: '#f8f9fc' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.75, color: '#244d78' }}>Répartition par besoin</Typography>
              {domainCounts.map(([domain, count], index) => (
                <Box key={domain} sx={{ mb: 0.65 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption">{domain}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{count}</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(count / maxDomain) * 100}
                    sx={{
                      height: 7,
                      borderRadius: 4,
                      bgcolor: '#e3e8ef',
                      '& .MuiLinearProgress-bar': { bgcolor: DOMAIN_COLORS[index] },
                    }}
                  />
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
