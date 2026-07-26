import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Stack,
  Typography,
} from '@mui/material'

function CockpitRecommendationCard({ title, justification, preconisation, onAction }) {
  return (
    <Accordion
      disableGutters
      defaultExpanded
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 1 } }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          <Typography variant="body2">Justification: {justification}</Typography>
          <Typography variant="body2">Preconisation: {preconisation}</Typography>
          <Button size="small" variant="outlined" onClick={onAction}>
            Action
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export default CockpitRecommendationCard
