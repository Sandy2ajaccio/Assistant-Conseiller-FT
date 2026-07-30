import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
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
  const [recommendedOnly, setRecommendedOnly] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [retainedIds, setRetainedIds] = useState([])

  const recommended = useMemo(
    () => recommendedNames.map(normalize).filter(Boolean),
    [recommendedNames],
  )

  const isRecommended = (item) => {
    const label = normalize(`${item.code || ''} ${item.nom}`)
    return recommended.some((name) => label.includes(name) || name.includes(normalize(item.nom)))
  }

  const recommendedItems = useMemo(
    () => items.filter(isRecommended).sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
    [items, recommended],
  )

  const filteredItems = useMemo(() => {
    const query = normalize(search)
    return items
      .filter((item) => type === 'Tous' || item.type === type)
      .filter((item) => !recommendedOnly || isRecommended(item))
      .filter((item) => !query || normalize(Object.values(item).join(' ')).includes(query))
      .sort((a, b) => Number(isRecommended(b)) - Number(isRecommended(a)) || a.nom.localeCompare(b.nom, 'fr'))
  }, [items, search, type, recommendedOnly, recommended])

  useEffect(() => {
    if (!filteredItems.some((item) => item.id === selectedId)) {
      setSelectedId(filteredItems[0]?.id || null)
    }
  }, [filteredItems, selectedId])

  const selected = filteredItems.find((item) => item.id === selectedId) || filteredItems[0]
  const selectedRetained = selected ? retainedIds.includes(selected.id) : false

  const showRecommendedDetails = (item) => {
    setType('Tous')
    setRecommendedOnly(false)
    setSearch('')
    setSelectedId(item.id)
    setDetailOpen(true)
  }

  const openDetails = (item) => {
    setSelectedId(item.id)
    setDetailOpen(true)
  }

  const choose = () => {
    if (!selected || selectedRetained) return
    setRetainedIds((current) => [...current, selected.id])
    onSelect?.(selected)
  }

  return (
    <Stack spacing={1.25} sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
      <Paper
        variant="outlined"
        sx={{ p: 1.5, bgcolor: '#eef6ff', border: '2px solid #1976d2' }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#174f86' }}>
          Comment utiliser cet écran ?
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 1 }}>
          {[
            ['1', 'Regardez les solutions proposées pour ce demandeur.'],
            ['2', 'Ouvrez une fiche pour vérifier l’objectif et les conditions.'],
            ['3', 'Ajoutez la solution retenue aux actions de l’entretien.'],
          ].map(([number, label]) => (
            <Box key={number} sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Chip label={number} color="primary" sx={{ fontWeight: 900 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{label}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      {alerts.length > 0 ? (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          {alerts.slice(0, 2).map((alert) => (
            <Alert key={`${alert.severity}-${alert.texte}`} severity={alert.severity} sx={{ flex: 1, py: 0.25 }}>
              {alert.texte}
            </Alert>
          ))}
        </Stack>
      ) : null}

      <Paper variant="outlined" sx={{ p: 1.5, borderLeft: '8px solid #2e7d32', bgcolor: '#f3faf4' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={0.5}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#246b2d' }}>
              1. Solutions adaptées au besoin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ces propositions proviennent des informations renseignées pendant l’entretien. Vérifiez-les avant de les retenir.
            </Typography>
          </Box>
          <Chip
            color={recommendedItems.length ? 'success' : 'warning'}
            label={`${recommendedItems.length} proposition${recommendedItems.length > 1 ? 's' : ''}`}
            sx={{ fontWeight: 900, alignSelf: { xs: 'flex-start', md: 'center' } }}
          />
        </Stack>

        {recommendedItems.length ? (
          <Grid container spacing={1} sx={{ mt: 0.5 }}>
            {recommendedItems.slice(0, 6).map((item) => (
              <Grid key={item.id} size={{ xs: 12, md: 6, xl: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.2,
                    height: '100%',
                    bgcolor: '#fff',
                    borderColor: selectedId === item.id ? '#1976d2' : '#a5d6a7',
                    borderWidth: selectedId === item.id ? 2 : 1,
                  }}
                >
                  <Stack spacing={0.75} sx={{ height: '100%' }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Chip size="small" label={item.type} color={item.type === 'Atelier' ? 'primary' : 'secondary'} />
                      <Typography variant="caption" color="text.secondary">{item.domaine}</Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{item.nom}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {item.objectif}
                    </Typography>
                    <Button size="small" variant="outlined" onClick={() => showRecommendedDetails(item)}>
                      Voir la fiche
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="warning" sx={{ mt: 1 }}>
            Aucune solution n’est encore proposée. Complétez la demande, les freins et les ressources dans la conduite de l’entretien.
          </Alert>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#fff' }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#174f86' }}>
          2. Rechercher une autre solution
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} sx={{ mt: 1 }}>
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            label="Besoin, nom, code ou mot-clé"
            placeholder="Exemple : mobilité, formation, création d’entreprise…"
            sx={{ flex: 1 }}
          />
          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
            {['Tous', 'Atelier', 'Prestation'].map((value) => (
              <Button
                key={value}
                size="small"
                variant={type === value ? 'contained' : 'outlined'}
                onClick={() => setType(value)}
              >
                {value === 'Tous' ? 'Tout le catalogue' : `${value}s`}
              </Button>
            ))}
            <Button
              size="small"
              color="success"
              variant={recommendedOnly ? 'contained' : 'outlined'}
              onClick={() => setRecommendedOnly((current) => !current)}
              disabled={!recommendedItems.length}
            >
              Adaptés au besoin
            </Button>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
          {filteredItems.length} solution(s) affichée(s) sur {items.length}.
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
        <Box sx={{ px: 1.5, py: 1, bgcolor: '#244d78', color: '#fff' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
            3. Choisir une solution
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            Cliquez sur une ligne pour ouvrir sa fiche complète.
          </Typography>
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'grid' },
            gridTemplateColumns: '80px minmax(0, 1.7fr) minmax(110px, 1fr) 90px',
            gap: 1,
            px: 1.25,
            py: 0.7,
            bgcolor: '#eaf0f6',
          }}
        >
          {['Type', 'Solution', 'Besoin', 'Durée'].map((label) => (
            <Typography key={label} variant="caption" sx={{ fontWeight: 900 }}>{label}</Typography>
          ))}
        </Box>
        <Box sx={{ maxHeight: 380, overflowY: 'auto', overflowX: 'hidden' }}>
          {filteredItems.map((item) => {
            const active = selected?.id === item.id
            const suggested = isRecommended(item)
            return (
              <Box
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => openDetails(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') openDetails(item)
                }}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '74px minmax(0, 1fr)',
                    sm: '80px minmax(0, 1.7fr) minmax(110px, 1fr) 90px',
                  },
                  gap: 1,
                  alignItems: 'center',
                  px: 1.25,
                  py: 0.8,
                  cursor: 'pointer',
                  borderBottom: '1px solid #e1e6ed',
                  borderLeft: '5px solid',
                  borderLeftColor: suggested ? 'success.main' : 'transparent',
                  bgcolor: active ? '#d9ecff' : suggested ? '#eef8f0' : '#fff',
                  '&:hover': { bgcolor: '#e6f1fc' },
                  '&:focus-visible': { outline: '3px solid #1976d2', outlineOffset: -3 },
                }}
              >
                <Chip
                  size="small"
                  color={suggested ? 'success' : item.type === 'Atelier' ? 'primary' : 'secondary'}
                  label={suggested ? 'Adapté' : item.type}
                  sx={{ fontSize: '0.68rem', maxWidth: '100%' }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>
                    {item.code ? `${item.code} · ` : ''}{item.nom}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.localisation}
                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                      {` · ${item.domaine} · ${item.duree}`}
                    </Box>
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>{item.domaine}</Typography>
                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>{item.duree}</Typography>
              </Box>
            )
          })}
          {!filteredItems.length ? (
            <Alert severity="info" sx={{ m: 1.5 }}>
              Aucune solution ne correspond à ces critères. Effacez la recherche ou choisissez « Tout le catalogue ».
            </Alert>
          ) : null}
        </Box>
      </Paper>

      <Dialog
        open={detailOpen && Boolean(selected)}
        onClose={() => setDetailOpen(false)}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        {selected ? (
          <>
            <DialogTitle sx={{ pb: 1, borderTop: '7px solid', borderTopColor: isRecommended(selected) ? 'success.main' : '#1976d2' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 900 }}>
                    {selected.type.toUpperCase()} {selected.code ? `· ${selected.code}` : ''}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>{selected.nom}</Typography>
                </Box>
                {isRecommended(selected) ? <Chip color="success" size="small" label="Adapté au besoin" sx={{ alignSelf: 'flex-start' }} /> : null}
              </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: isRecommended(selected) ? '#f3faf4' : '#f7faff' }}>
              <Stack spacing={1.1}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: '#174f86' }}>À QUOI SERT CETTE SOLUTION ?</Typography>
                  <Typography variant="body2">{selected.objectif}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: '#174f86' }}>QUI PEUT EN BÉNÉFICIER ?</Typography>
                  <Typography variant="body2">{selected.public}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: '#174f86' }}>CONDITIONS À VÉRIFIER</Typography>
                  <Typography variant="body2">{selected.conditions}</Typography>
                </Box>
                <Box sx={{ p: 1, bgcolor: '#dcecff', borderRadius: 1, borderLeft: '4px solid #1976d2' }}>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 900 }}>COMMENT LA PRESCRIRE ?</Typography>
                  <Typography variant="body2">{selected.prescription}</Typography>
                </Box>
                {Array.isArray(selected.pointsVigilance) && selected.pointsVigilance.length ? (
                  <Box sx={{ p: 1, bgcolor: '#fff8e8', borderRadius: 1, borderLeft: '4px solid #ed6c02' }}>
                    <Typography variant="caption" sx={{ color: '#8a4b00', fontWeight: 900 }}>POINTS À VÉRIFIER</Typography>
                    {selected.pointsVigilance.map((point) => (
                      <Typography key={point} variant="body2">• {point}</Typography>
                    ))}
                  </Box>
                ) : null}
                {selected.confirmationInterne ? (
                  <Alert severity="warning" sx={{ py: 0.25 }}>
                    <strong>Procédure interne à confirmer :</strong> {selected.confirmationInterne}
                  </Alert>
                ) : null}
                {selected.sourceInterne ? (
                  <Typography variant="caption" color="text.secondary">
                    Source métier interne : {selected.sourceInterne}
                  </Typography>
                ) : null}
                {Array.isArray(selected.sourcesOfficielles) && selected.sourcesOfficielles.length ? (
                  <Stack spacing={0.25}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#174f86' }}>
                      SOURCES OFFICIELLES
                    </Typography>
                    {selected.sourcesOfficielles.map((source) => (
                      <Link
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        variant="caption"
                      >
                        {source.nom}
                      </Link>
                    ))}
                  </Stack>
                ) : null}
                <Typography variant="caption" color="text.secondary">
                  {selected.localisation} · {selected.duree} · {selected.intervenants}
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 2, py: 1.25, justifyContent: 'space-between' }}>
              <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
              <Button
                variant="contained"
                color={selectedRetained ? 'success' : 'primary'}
                onClick={choose}
                disabled={selectedRetained}
              >
                {selectedRetained ? 'Ajoutée aux actions' : 'Ajouter aux actions de l’entretien'}
              </Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>
    </Stack>
  )
}

export default PrescriptionDashboard
