import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'

function AssistantExpertSection({
  actualiserAssistantExpertAnalyse,
  assistantExpertMessage,
  ASSISTANT_EXPERT_SECTIONS,
  assistantExpertExpanded,
  setAssistantExpertExpanded,
  assistantExpertAnalyse,
  confidenceColor,
}) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        <Button variant="contained" onClick={actualiserAssistantExpertAnalyse}>
          Actualiser l'analyse
        </Button>
      </Stack>

      <Alert severity="info">
        L'assistant fournit des recommandations explicables et argumentées. La décision finale revient toujours au conseiller.
      </Alert>

      {assistantExpertMessage ? (
        <Typography variant="body2" color="primary">
          {assistantExpertMessage}
        </Typography>
      ) : null}

      <Stack spacing={1.2}>
        {ASSISTANT_EXPERT_SECTIONS.map((section) => (
          <Accordion
            key={section.key}
            expanded={Boolean(assistantExpertExpanded[section.key])}
            onChange={(_, expanded) =>
              setAssistantExpertExpanded((prev) => ({ ...prev, [section.key]: expanded }))
            }
          >
            <AccordionSummary>
              <Typography variant="subtitle1">{section.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {(assistantExpertAnalyse[section.key] || []).map((item, index) => (
                  <Paper key={`${section.key}-${index}`} variant="outlined" sx={{ p: 1.2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                      <Typography variant="subtitle2">{item.recommandation}</Typography>
                      <Chip size="small" label={`Confiance: ${item.confiance}`} color={confidenceColor(item.confiance)} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Justification: {item.justification}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Appui dossier: {item.appuiDossier}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Box>
  )
}

export default AssistantExpertSection
