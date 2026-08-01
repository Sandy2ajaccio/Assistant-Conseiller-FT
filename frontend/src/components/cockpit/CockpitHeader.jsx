import {
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CockpitBlockCard from '../CockpitBlockCard'

function CockpitHeader({
  identifiantDemandeur,
  setIdentifiantDemandeur,
  typeEntretien,
  changerTypeEntretien,
  entretienTypes,
  dureeRendezVous,
  chronoRestantSecondes,
  chronoSecondes,
  chronoActif,
  chronoDureeAtteinte,
  minimumTelephoniqueAtteint,
  decisionConseillerStatut,
  basculerChronometre,
  formatChrono,
  formatDateFr,
  brouillonAutomatiqueStatut,
  nouveauDossier,
}) {
  const entretienActuel = entretienTypes.find(
    (item) => item.value === typeEntretien,
  )

  const dureeTotale = entretienActuel?.secondes || 1

  const progression = Math.min(
    100,
    Math.round((chronoSecondes / dureeTotale) * 100),
  )

  const entretienTermine = decisionConseillerStatut === 'Acceptee'

  const statut = entretienTermine
    ? 'Terminé'
    : chronoActif
      ? 'En cours'
      : chronoSecondes > 0
        ? 'En pause'
        : 'À démarrer'

  const couleurStatut = entretienTermine
    ? 'success'
    : chronoActif
      ? 'primary'
      : chronoSecondes > 0
        ? 'warning'
        : 'default'

  const couleurChrono = chronoDureeAtteinte
    ? 'error.main'
    : minimumTelephoniqueAtteint
      ? 'warning.main'
      : 'primary.main'

  return (
    <CockpitBlockCard
      title="Cockpit Demandeur"
      summarySx={{
        minHeight: 38,
        px: 1.5,
        bgcolor: '#f7faff',
      }}
      titleSx={{
        fontSize: '1rem',
        fontWeight: 900,
        color: '#153b5b',
      }}
      detailsSx={{
        px: { xs: 1, md: 1.5 },
        pt: 1,
        pb: 1.25,
      }}
      sx={{
        border: '1px solid #cddbea',
        borderTop: '4px solid #0b6fb8',
        boxShadow: '0 4px 14px rgba(35, 72, 105, 0.08)',
      }}
    >
      <Grid container spacing={1.25} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box
            sx={{
              height: '100%',
              p: 1.25,
              borderRadius: 2,
              bgcolor: '#f7faff',
              border: '1px solid #d9e5f0',
            }}
          >
            <Stack spacing={1}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  label="Identifiant France Travail"
                  value={identifiantDemandeur}
                  onChange={(event) =>
                    setIdentifiantDemandeur(event.target.value)
                  }
                  fullWidth
                  size="small"
                />

                <TextField
                  select
                  label="Type de rendez-vous"
                  value={typeEntretien}
                  onChange={changerTypeEntretien}
                  fullWidth
                  size="small"
                >
                  {entretienTypes.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  size="small"
                  label={`Durée : ${dureeRendezVous}`}
                  variant="outlined"
                />

                <Chip
                  size="small"
                  label="Conseiller FT"
                  variant="outlined"
                />

                <Chip
                  size="small"
                  color={couleurStatut}
                  label={statut}
                />
              </Stack>
            </Stack>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Box
            sx={{
              height: '100%',
              p: 1.25,
              borderRadius: 2,
              bgcolor: '#ffffff',
              border: '1px solid #d9e5f0',
            }}
          >
            <Stack spacing={0.75}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Temps restant
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: { xs: '1.5rem', md: '1.8rem' },
                      lineHeight: 1,
                      fontWeight: 900,
                      color: couleurChrono,
                    }}
                  >
                    {formatChrono(chronoRestantSecondes)}
                  </Typography>
                </Box>

                <Button
                  size="small"
                  variant={chronoActif ? 'outlined' : 'contained'}
                  disabled={entretienTermine}
                  onClick={basculerChronometre}
                  sx={{
                    minWidth: 96,
                    fontWeight: 800,
                  }}
                >
                  {entretienTermine
                    ? 'Terminé'
                    : chronoActif
                      ? 'Pause'
                      : chronoDureeAtteinte
                        ? 'Recommencer'
                        : chronoSecondes > 0
                          ? 'Reprendre'
                          : 'Démarrer'}
                </Button>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={progression}
                sx={{
                  height: 7,
                  borderRadius: 10,
                  bgcolor: '#e4edf5',
                }}
              />

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  {formatChrono(chronoSecondes)} écoulé
                </Typography>

                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  {progression} %
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <Box
            sx={{
              height: '100%',
              p: 1.25,
              borderRadius: 2,
              bgcolor: '#f4fbf6',
              border: '1px solid #cfe5d4',
            }}
          >
            <Stack
              spacing={0.65}
              sx={{ height: '100%' }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Dernière actualisation
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {formatDateFr(new Date().toISOString())}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: 'success.main',
                  fontWeight: 900,
                }}
              >
                ✓ {brouillonAutomatiqueStatut || 'Sauvegarde active'}
              </Typography>

              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={nouveauDossier}
                sx={{
                  alignSelf: 'flex-start',
                  fontWeight: 700,
                }}
              >
                Effacer l’entretien
              </Button>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </CockpitBlockCard>
  )
}

export default CockpitHeader