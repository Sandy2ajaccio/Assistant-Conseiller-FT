import { useState } from 'react'
import { Box, Button, Paper, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import PortfolioManagementPanel from '../components/PortfolioManagementPanel'

function DemandeursPage() {
  const [portfolioVersion, setPortfolioVersion] = useState(0)

  return (
    <section className="demandeur-page">
      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderColor: '#9bb8d3' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
          <Button component={Link} to="/assistant" variant="text" sx={{ fontWeight: 800 }}>
            ← Retour à l’assistant de mission
          </Button>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#244d78' }}>
              Gestion des demandeurs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Ajoutez, mettez à jour, filtrez et exportez les demandeurs enregistrés.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <PortfolioManagementPanel
        portfolioVersion={portfolioVersion}
        onPortfolioChanged={() => setPortfolioVersion((value) => value + 1)}
      />
    </section>
  )
}

export default DemandeursPage
