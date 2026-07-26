import { Box, Paper, Stack, Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import PrescriptionDashboard from '../components/PrescriptionDashboard'
import { offreServiceCorse } from '../data/offreServiceCorse'

const PrescriptionsPage = () => {
  const [searchParams] = useSearchParams()

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
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Tableau de bord de l’offre de services</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
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
