import {
  Alert,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  DATE_ENTREE_VIGUEUR_SANCTIONS,
  FAITS_SUIVI,
  MOTIFS_LEGITIMES,
  RECURRENCES,
  SITUATIONS_DROITS,
  SOURCES_SANCTIONS,
  compterAlertesActionnables,
  genererAlertesSuivi,
  getFaitSuivi,
  normaliserSuiviObligations,
} from '../data/suiviObligations'

function SuiviObligationsCard({ value, onChange }) {
  const suivi = normaliserSuiviObligations(value)
  const fait = getFaitSuivi(suivi.fait)
  const alertes = genererAlertesSuivi(suivi)
  const alertesActionnables = compterAlertesActionnables(suivi)
  const update = (field) => (event) => {
    const nextValue = field === 'procedureInterneConfirmee'
      ? event.target.checked
      : event.target.value
    onChange({ ...suivi, [field]: nextValue })
  }

  return (
    <Stack spacing={1.5}>
      <Alert severity="warning">
        Cet outil signale des points à vérifier. Il ne qualifie pas un manquement, ne calcule pas une sanction et ne remplace ni le contradictoire ni la décision de l’autorité compétente.
      </Alert>

      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderLeft: '6px solid #b26a00' }}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Suivi des obligations et alertes M6
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Régime national applicable depuis le {new Date(`${DATE_ENTREE_VIGUEUR_SANCTIONS}T12:00:00`).toLocaleDateString('fr-FR')} ; barème Corse fourni daté du 1er juin 2025.
              </Typography>
            </Box>
            <Chip
              color={alertesActionnables > 0 ? 'error' : suivi.fait === 'aucun' ? 'success' : 'info'}
              label={alertesActionnables > 0
                ? `${alertesActionnables} alerte(s) à traiter`
                : suivi.fait === 'aucun'
                  ? 'Aucun fait signalé'
                  : 'Repère documenté'}
              sx={{ fontWeight: 900, alignSelf: { md: 'flex-start' } }}
            />
          </Stack>

          <Grid container spacing={1.25}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Fait observé ou signalé"
                value={suivi.fait}
                onChange={update('fait')}
              >
                {FAITS_SUIVI.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.codeInterne ? `${item.codeInterne} — ` : ''}{item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Situation de droits"
                value={suivi.situationDroits}
                onChange={update('situationDroits')}
                disabled={suivi.fait === 'aucun'}
              >
                {SITUATIONS_DROITS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Premier fait ou réitération"
                value={suivi.recurrence}
                onChange={update('recurrence')}
                disabled={suivi.fait === 'aucun'}
              >
                {RECURRENCES.map((item) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Motif légitime"
                value={suivi.motifLegitime}
                onChange={update('motifLegitime')}
                disabled={suivi.fait === 'aucun'}
              >
                {MOTIFS_LEGITIMES.map((item) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date du fait"
                value={suivi.dateConstat}
                onChange={update('dateConstat')}
                disabled={suivi.fait === 'aucun'}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                size="small"
                label="Éléments factuels et pièces à vérifier"
                placeholder="Faits constatés, convocations, réponses, échanges, justificatifs et décisions antérieures…"
                value={suivi.elementsFactuels}
                onChange={update('elementsFactuels')}
                disabled={suivi.fait === 'aucun'}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                disabled={suivi.fait === 'aucun'}
                control={(
                  <Checkbox
                    checked={suivi.procedureInterneConfirmee}
                    onChange={update('procedureInterneConfirmee')}
                  />
                )}
                label="J’ai vérifié la procédure M6 et le barème Corse actuellement en vigueur"
              />
            </Grid>
          </Grid>

          {suivi.fait !== 'aucun' ? (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Repère interne sélectionné : <strong>{fait.codeInterne || 'sans code'}</strong>. La correspondance doit être confirmée dans l’outil et la procédure France Travail.
            </Alert>
          ) : null}

          {alertes.length > 0 ? (
            <Stack spacing={0.75}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                Alertes lors de l’enregistrement
              </Typography>
              {alertes.map((alerte) => (
                <Alert key={alerte.id} severity={alerte.niveau} sx={{ py: 0.25 }}>
                  <strong>{alerte.titre}</strong><br />
                  {alerte.message}
                </Alert>
              ))}
            </Stack>
          ) : null}

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {SOURCES_SANCTIONS.map((source) => (
              <Link key={source.url} href={source.url} target="_blank" rel="noreferrer" variant="caption">
                {source.label}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  )
}

export default SuiviObligationsCard
