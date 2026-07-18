import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from '@mui/material'

function CockpitBlockCard({
  title,
  subtitle,
  children,
  defaultExpanded = true,
  allowOverflow = false,
  sx = {},
  summarySx = {},
  titleSx = {},
  detailsSx = {},
}) {
  return (
    <Accordion
      disableGutters
      defaultExpanded={defaultExpanded}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        overflow: allowOverflow ? 'visible' : 'hidden',
        '&:before': { display: 'none' },
        ...sx,
      }}
    >
      <AccordionSummary
        sx={{
          minHeight: 38,
          flexShrink: 0,
          px: 1.25,
          '& .MuiAccordionSummary-content': { my: 0.5 },
          ...summarySx,
        }}
      >
        <Stack spacing={0.25} sx={{ width: '100%' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, ...titleSx }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          px: 1.25,
          pt: 0.5,
          pb: 1,
          flex: 1,
          overflow: allowOverflow ? 'visible' : 'auto',
          ...detailsSx,
        }}
      >
        <Stack spacing={0.75}>{children}</Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export default CockpitBlockCard
