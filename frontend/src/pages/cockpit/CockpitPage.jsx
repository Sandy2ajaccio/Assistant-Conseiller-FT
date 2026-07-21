import { Box, Grid, MenuItem, TextField } from '@mui/material'
import CockpitCard from './CockpitCard'

function CockpitPage() {
  const ENTRETIEN_TYPES = [
    { value: 'premier', label: 'Premier entretien (60 min)' },
    { value: 'suivi', label: 'Suivi (30 min)' },
    { value: 'telephone', label: 'Téléphonique (15-20 min)' },
  ]

  const typeEntretien = 'premier'

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <CockpitCard title="Informations entretien">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Identifiant France Travail"
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  label="Type d'entretien"
                  value={typeEntretien}
                  fullWidth
                  size="small"
                >
                  {ENTRETIEN_TYPES.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Conseiller"
                  value="Conseiller FT"
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
  <CockpitCard title="Analyse de la situation">

    <TextField
      label="Situation administrative"
      fullWidth
      multiline
      minRows={3}
      size="small"
      sx={{ mb: 2 }}
    />

    <TextField
      label="Situation personnelle"
      fullWidth
      multiline
      minRows={3}
      size="small"
      sx={{ mb: 2 }}
    />

    <TextField
      label="Parcours professionnel"
      fullWidth
      multiline
      minRows={3}
      size="small"
    />

  </CockpitCard>
</Grid>
                <TextField
                  label="Chronomètre"
                  value="00:00"
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </CockpitCard>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CockpitPage