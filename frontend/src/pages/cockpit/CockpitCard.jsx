import { Paper, Typography } from '@mui/material'

function CockpitCard({ title, children }) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 2,
        height: '100%',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          mb: 2,
        }}
      >
        {title}
      </Typography>

      {children}
    </Paper>
  )
}

export default CockpitCard