import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material'

function Analyse360Section({ analyse360Cards, analyse, syntheseAnalyse360 }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          lg: 'minmax(0, 2fr) minmax(0, 1fr)',
        },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
          },
        }}
      >
        {analyse360Cards.map((card) => (
          <Card key={card.titre} variant="outlined">
            <CardContent>
              <Typography variant="h6" component="h4" sx={{ mb: 1.2 }}>
                {card.titre}
              </Typography>
              <Stack spacing={0.7}>
                {card.contenu.map((item) => (
                  <Typography key={`${card.titre}-${item}`} variant="body2" color="text.secondary">
                    {item}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card variant="outlined" sx={{ alignSelf: 'start', position: { lg: 'sticky' }, top: { lg: 12 } }}>
        <CardContent>
          <Typography variant="h6" component="h4" sx={{ mb: 1.2 }}>
            Synthèse dynamique
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.25 }}>
            <Chip size="small" label={`Score ${analyse?.score ?? 0}`} />
            <Chip size="small" label={`Priorité ${analyse?.priorite || 'Normale'}`} color="primary" />
          </Stack>
          <Stack spacing={0.9}>
            {syntheseAnalyse360.map((ligne) => (
              <Typography key={ligne} variant="body2" color="text.secondary">
                {ligne}
              </Typography>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Analyse360Section
