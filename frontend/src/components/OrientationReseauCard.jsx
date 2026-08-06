import {
  Alert,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  DECISIONS_ORIENTATION,
  MOTIFS_REFUS_ORIENTATION,
  ORGANISMES_ORIENTATION,
  PARCOURS_ORIENTATION,
  normaliserOrientationReseau,
  orientationReseauComplete,
} from '../data/contratOrientation'

function OrientationReseauCard({ value, onChange, obligatoire = false }) {
  const orientation = normaliserOrientationReseau(value)
  const complete = orientationReseauComplete(orientation)
  const update = (field) => (event) => {
    const nextValue = field === 'validationHumaine'
      ? event.target.checked
      : event.target.value
    onChange({ ...orientation, [field]: nextValue })
  }

  return (
    <Paper
      variant="outlined"
      sx={{ p: 1.5, borderLeft: '6px solid #315aa8', bgcolor: '#f7f9ff' }}
    >
      <Stack spacing={1.25}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Orientation réseau pour l’emploi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Distinguez l’organisme, le parcours et la structure. Le portefeuille interne France Travail reste une décision séparée.
            </Typography>
          </div>
          <Alert severity={complete ? 'success' : obligatoire ? 'warning' : 'info'} sx={{ py: 0 }}>
            {complete
              ? 'Orientation validée par le conseiller.'
              : obligatoire
                ? 'Une décision humaine documentée est attendue pour cet EDO.'
                : 'À renseigner lorsqu’une orientation réseau est décidée.'}
          </Alert>
        </Stack>

        <Grid container spacing={1.25}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Décision du conseiller"
              value={orientation.decision}
              onChange={update('decision')}
            >
              {DECISIONS_ORIENTATION.map((item) => (
                <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Organisme d’accompagnement"
              value={orientation.organisme}
              onChange={update('organisme')}
            >
              <MenuItem value="">À définir</MenuItem>
              {ORGANISMES_ORIENTATION.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Parcours d’accompagnement"
              value={orientation.parcours}
              onChange={update('parcours')}
            >
              <MenuItem value="">À définir</MenuItem>
              {PARCOURS_ORIENTATION.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Structure ou service d’accueil"
              value={orientation.structure}
              onChange={update('structure')}
              placeholder="Agence, service, Mission locale, Cap emploi…"
            />
          </Grid>
          {orientation.decision === 'refusee-remplacee' ? (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Motif du refus de la proposition initiale"
                value={orientation.motifRefus}
                onChange={update('motifRefus')}
              >
                <MenuItem value="">À renseigner</MenuItem>
                {MOTIFS_REFUS_ORIENTATION.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </TextField>
            </Grid>
          ) : null}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              size="small"
              label="Éléments justifiant la décision"
              value={orientation.commentaire}
              onChange={update('commentaire')}
              placeholder="Éléments du diagnostic, besoins exprimés et raison du choix…"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={(
                <Checkbox
                  checked={orientation.validationHumaine}
                  onChange={update('validationHumaine')}
                />
              )}
              label="Je confirme avoir vérifié cette orientation avec la situation réelle et les procédures internes en vigueur"
            />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  )
}

export default OrientationReseauCard
