import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import PrescriptionDashboard from '../components/PrescriptionDashboard'
import { offreServiceCorse } from '../data/offreServiceCorse'
import {
  getLastOpenedDossierId,
  listStoredDossiers,
} from '../services/dossierLoaderService'
import getRecommandations from '../services/recommandationService'

const PrescriptionsPage = () => {
  const [searchParams] = useSearchParams()
  const dossiers = useMemo(() => listStoredDossiers(), [])
  const initialDossier = searchParams.get('dossier') || getLastOpenedDossierId() || dossiers[0]?.identifiant || ''
  const [selectedDossierId, setSelectedDossierId] = useState(initialDossier)

  const selectedEntry = dossiers.find((item) => item.identifiant === selectedDossierId)
  const dossier = selectedEntry?.dossier || null
  const recommandations = useMemo(() => dossier ? getRecommandations(dossier) : null, [dossier])
  const recommendedNames = [
    ...(recommandations?.ateliers || []),
    ...(recommandations?.prestations || []),
  ]

  const situationAlerts = useMemo(() => {
    if (!dossier) {
      return [{
        severity: 'error',
        texte: 'Aucun demandeur sélectionné : choisissez un dossier pour afficher les alertes liées à sa situation.',
      }]
    }

    const result = []
    const demande = String(dossier.ceQueDitLaPersonne || dossier.besoinIdentifieConseiller || '').trim()
    const projet = String(dossier.projet || '').trim()
    const freins = Array.isArray(dossier.freinsSelectionnes) ? dossier.freinsSelectionnes : []
    const ressources = Array.isArray(dossier.ressourcesSelectionnees) ? dossier.ressourcesSelectionnees : []
    const urgence = recommandations?.diagnostic?.urgence

    if (!demande) result.push({ severity: 'error', texte: 'Demande non renseignée : aucune orientation ne doit être validée.' })
    if (!projet) result.push({ severity: 'warning', texte: 'Projet professionnel à préciser : les solutions proposées restent provisoires.' })
    if (freins.length >= 3) {
      result.push({ severity: 'error', texte: `Vigilance forte : ${freins.length} freins actifs — ${freins.join(', ')}.` })
    } else if (freins.length > 0) {
      result.push({ severity: 'warning', texte: `Frein à sécuriser avant orientation : ${freins.join(', ')}.` })
    }
    if (urgence === 'critique' || urgence === 'haute') {
      result.push({ severity: 'error', texte: `Situation prioritaire : niveau d’urgence ${urgence}. Vérifier la capacité à agir avant toute prescription.` })
    }
    if (ressources.length === 0) {
      result.push({ severity: 'warning', texte: 'Aucune ressource ou point d’appui identifié dans le dossier.' })
    }
    if (result.length === 0) {
      result.push({ severity: 'success', texte: 'Situation sécurisée : aucun point de blocage majeur détecté pour cette orientation.' })
    }
    return result
  }, [dossier, recommandations])

  const alertCounts = situationAlerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1
    return acc
  }, {})

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, py: 1.5 }}>
      <Stack spacing={1.25}>
        <Paper
          sx={{
            px: 2,
            py: 1.25,
            color: '#fff',
            background: 'linear-gradient(100deg, #173f67 0%, #1976d2 60%, #00897b 100%)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={1.5}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Tableau de bord de l’offre de services</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                Sélectionnez le demandeur pour actualiser automatiquement les propositions et les alertes.
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 300, bgcolor: '#fff', borderRadius: 1 }}>
              <InputLabel id="dossier-dashboard-label">Demandeur d’emploi</InputLabel>
              <Select
                labelId="dossier-dashboard-label"
                value={selectedDossierId}
                label="Demandeur d’emploi"
                onChange={(event) => setSelectedDossierId(event.target.value)}
              >
                <MenuItem value=""><em>Sélectionner un dossier</em></MenuItem>
                {dossiers.map((item) => (
                  <MenuItem key={item.identifiant} value={item.identifiant}>
                    {item.identifiant} — {item.dossier?.dossierStatut || 'brouillon'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: 1.25,
            border: '2px solid',
            borderColor: alertCounts.error ? '#d32f2f' : alertCounts.warning ? '#ed6c02' : '#2e7d32',
            bgcolor: alertCounts.error ? '#fff1f1' : alertCounts.warning ? '#fff8e8' : '#edf8ef',
          }}
        >
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.25} alignItems={{ lg: 'center' }}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 250 }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {alertCounts.error ? '🚨 ALERTE DOSSIER' : alertCounts.warning ? '⚠ VIGILANCE' : '✅ SITUATION SÉCURISÉE'}
              </Typography>
              {selectedDossierId ? <Chip label={`DE ${selectedDossierId}`} color="primary" /> : null}
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={0.75} sx={{ flex: 1 }}>
              {situationAlerts.slice(0, 3).map((alert) => (
                <Alert key={alert.texte} severity={alert.severity} variant="filled" sx={{ flex: 1, py: 0.25, fontWeight: 700 }}>
                  {alert.texte}
                </Alert>
              ))}
            </Stack>
          </Stack>
        </Paper>

        <PrescriptionDashboard
          items={offreServiceCorse}
          recommendedNames={recommendedNames}
          alerts={[]}
          initialSearch={searchParams.get('q') || ''}
          initialType={searchParams.get('type') || 'Tous'}
        />
      </Stack>
    </Box>
  )
}

export default PrescriptionsPage
