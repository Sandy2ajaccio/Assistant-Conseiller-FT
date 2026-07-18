import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { normalizeDashboardDossierRecord } from '../types/dossierContract'
import {
  buildAssistantDossierUrl,
  listStoredDossiers,
  setLastOpenedDossierId,
} from '../services/dossierLoaderService'

const formatDate = (value) => {
  if (!value) return '--/--/---- --:--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--/--/---- --:--'
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getTodayPrefix = () => {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = today.getFullYear()
  return `${day}/${month}/${year}`
}

const actionCards = [
  { title: "👤 Nouveau demandeur d'emploi", route: '/assistant' },
  { title: '📂 Reprendre une analyse', route: '/assistant' },
  { title: '📅 Entretiens du jour', route: '/assistant' },
  { title: '⏳ Analyses en brouillon', route: '/assistant' },
  { title: '✅ Analyses terminées', route: '/assistant' },
  { title: '📊 Statistiques', route: '/dashboard' },
]

function DashboardPage() {
  const navigate = useNavigate()
  const [searchIdentifiant, setSearchIdentifiant] = useState('')

  const { stats, derniersDossiers } = useMemo(() => {
    const all = listStoredDossiers().map(({ identifiant, payload }) =>
      normalizeDashboardDossierRecord({ identifiant, parsed: payload || null })
    )

    const sorted = all.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    const todayPrefix = getTodayPrefix()

    const prescriptions = sorted.reduce((acc, item) => {
      let count = acc
      if (item.decisions?.prescriptionPrestation) count += 1
      if (item.decisions?.prescriptionAtelier) count += 1
      return count
    }, 0)

    const entretiensToday = sorted.reduce((acc, item) => {
      const todayCount = item.historique.filter((entry) => String(entry?.date || '').startsWith(todayPrefix)).length
      return acc + todayCount
    }, 0)

    const mapCount = sorted.filter((item) => item.mapTexte.length > 0).length
    const brouillons = sorted.filter((item) => item.statut === 'brouillon').length

    return {
      stats: {
        totalDossiers: sorted.length,
        brouillons,
        entretiensToday,
        prescriptions,
        mapCount,
      },
      derniersDossiers: sorted.slice(0, 10),
    }
  }, [])

  const derniersDossiersFiltres = useMemo(() => {
    const query = searchIdentifiant.trim().toLowerCase()
    if (!query) return derniersDossiers
    return derniersDossiers.filter((item) => item.identifiant.toLowerCase().includes(query))
  }, [derniersDossiers, searchIdentifiant])

  const handleOpenDossier = (identifiant) => {
    setLastOpenedDossierId(identifiant)
    navigate(buildAssistantDossierUrl(identifiant))
  }

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
                  CAP DECISION FT
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Conseillere : Sandrine
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {today}
                </Typography>
                <Divider sx={{ borderStyle: 'dashed' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack spacing={1.25}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Indicateurs
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`Dossiers : ${stats.totalDossiers}`} color="primary" variant="outlined" />
                  <Chip label={`Brouillons : ${stats.brouillons}`} color="warning" variant="outlined" />
                  <Chip label={`Entretiens du jour : ${stats.entretiensToday}`} color="info" variant="outlined" />
                  <Chip label={`Prescriptions : ${stats.prescriptions}`} color="secondary" variant="outlined" />
                  <Chip label={`MAP generees : ${stats.mapCount}`} color="success" variant="outlined" />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Grid container spacing={1.5}>
            {actionCards.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.title}>
                <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                  <CardContent>
                    <Stack spacing={1.2} sx={{ height: '100%' }} justifyContent="space-between">
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {item.title}
                      </Typography>
                      <Button variant="contained" size="small" onClick={() => navigate(item.route)}>
                        Ouvrir
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Stack spacing={1.25}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Historique des 10 derniers dossiers ouverts
                </Typography>

                <TextField
                  label="Recherche par identifiant France Travail"
                  value={searchIdentifiant}
                  onChange={(event) => setSearchIdentifiant(event.target.value)}
                  size="small"
                  fullWidth
                />

                {derniersDossiers.length > 0 ? (
                  <TableContainer sx={{ maxHeight: 460, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Identifiant FT</TableCell>
                          <TableCell>Date dernier entretien</TableCell>
                          <TableCell>Type d'entretien</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Derniere modification</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {derniersDossiersFiltres.map((item) => (
                          <TableRow
                            key={item.identifiant}
                            hover
                            onClick={() => handleOpenDossier(item.identifiant)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{item.identifiant}</TableCell>
                            <TableCell>{item.dateDernierEntretien}</TableCell>
                            <TableCell>{item.typeEntretien}</TableCell>
                            <TableCell>{item.statut === 'termine' ? 'Termine' : 'Brouillon'}</TableCell>
                            <TableCell>{formatDate(item.updatedAt)}</TableCell>
                          </TableRow>
                        ))}
                        {derniersDossiersFiltres.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5}>
                              <Typography variant="body2" color="text.secondary">
                                Aucun dossier correspondant.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucun dossier enregistre pour le moment.
                  </Typography>
                )}

                <Typography variant="caption" color="text.secondary">
                  Confidentialite: seules les informations non nominatives sont affichees (identifiant FT et metadonnees d'entretien).
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage
