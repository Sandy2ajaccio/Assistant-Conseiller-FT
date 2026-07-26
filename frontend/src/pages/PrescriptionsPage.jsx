import { Box, Paper, Stack, Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import PrescriptionDashboard from '../components/PrescriptionDashboard'
import { offreServiceCorse } from '../data/offreServiceCorse'

const PrescriptionsPage = () => {
  const [searchParams] = useSearchParams()

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, py: 1.5 }}>
      <Stack spacing={1.25}>
        <Paper variant="outlined" sx={{ px: 1.5, py: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Tableau de bord des prescriptions</Typography>
          <Typography variant="body2" color="text.secondary">
            Toute l’offre de service, les conditions d’accès et le chemin de prescription sur un seul écran.
          </Typography>
        </Paper>
        <PrescriptionDashboard
          items={offreServiceCorse}
          initialSearch={searchParams.get('q') || ''}
          initialType={searchParams.get('type') || 'Tous'}
        />
      </Stack>
    </Box>
  )
}

export default PrescriptionsPage
