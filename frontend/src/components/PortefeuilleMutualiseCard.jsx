import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  ACTIONS_MUTUALISEES,
  DATE_CONSIGNES_PORTEFEUILLE,
  FILES_PORTEFEUILLE_MUTUALISE,
  MOTIFS_FOCALE,
  STATUTS_ABSENCE,
  compterAlertesPortefeuilleMutualise,
  genererAlertesPortefeuilleMutualise,
  getFilePortefeuilleMutualise,
  normaliserSuiviPortefeuilleMutualise,
} from '../data/portefeuilleMutualise'

const CONSIGNES_COLLECTIVES = [
  'Informer l’ensemble du portefeuille de la possibilité de prendre les RDVL en ligne.',
  'Inviter prioritairement à réaliser le questionnaire PIX ; organiser une session dédiée si un besoin d’accompagnement est identifié.',
  'Faire un point à la mi-septembre pour décider si une demi-journée PIX accompagnée est nécessaire.',
  'Finaliser le planning des ateliers par thématique et fréquence ; maintenir l’atelier du 14/09/2026 avec le partenaire et étudier le suivi sur MEE.',
  'Effectuer le requêtage des ateliers CFP en fonction de l’âge.',
  'Suivre les activités AIF/FCPF, A&P, les escalades et les parcours à mettre à jour.',
  'Pour toute information sur le PRDVL, préciser le contact Ajaccio EM et la possibilité de passer par le site.',
]

function PortefeuilleMutualiseCard({ value, onChange, onOpenSuiviM6 }) {
  const suivi = normaliserSuiviPortefeuilleMutualise(value)
  const file = getFilePortefeuilleMutualise(suivi.file)
  const alertes = genererAlertesPortefeuilleMutualise(suivi)
  const nombreAlertes = compterAlertesPortefeuilleMutualise(suivi)
  const update = (field) => (event) => {
    const nextValue = field === 'procedureInterneConfirmee'
      ? event.target.checked
      : event.target.value
    onChange({ ...suivi, [field]: nextValue })
  }
  const toggleAction = (actionId) => (event) => {
    onChange({
      ...suivi,
      actionsRealisees: {
        ...suivi.actionsRealisees,
        [actionId]: event.target.checked,
      },
    })
  }

  return (
    <Stack spacing={1.5}>
      <Alert severity="info">
        Consignes internes reçues le {new Date(`${DATE_CONSIGNES_PORTEFEUILLE}T12:00:00`).toLocaleDateString('fr-FR')}. Elles organisent le travail du portefeuille mutualisé et doivent être révisées si une nouvelle consigne est diffusée.
      </Alert>

      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderLeft: '6px solid #b71c1c' }}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#9f1010' }}>
                Portefeuille mutualisé
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Classement du dossier, actions attendues et alertes opérationnelles.
              </Typography>
            </Box>
            <Chip
              color={nombreAlertes > 0 ? 'error' : 'success'}
              label={nombreAlertes > 0 ? `${nombreAlertes} action(s) ou alerte(s)` : 'Suivi à jour'}
              sx={{ fontWeight: 900, alignSelf: { md: 'flex-start' } }}
            />
          </Stack>

          <Grid container spacing={1.25}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="File de travail"
                value={suivi.file}
                onChange={update('file')}
              >
                {FILES_PORTEFEUILLE_MUTUALISE.map((item) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Alert severity="info" sx={{ py: 0.25 }}>
                {file.description}
              </Alert>
            </Grid>

            {file.convocation ? (
              <>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Date d’envoi de la convocation"
                    value={suivi.dateConvocation}
                    onChange={update('dateConvocation')}
                    helperText="Consigne : 10 à 15 jours avant le rendez-vous"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Date du rendez-vous"
                    value={suivi.dateRendezVous}
                    onChange={update('dateRendezVous')}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Modalité du rendez-vous"
                    value={suivi.modaliteRendezVous}
                    onChange={update('modaliteRendezVous')}
                  >
                    <MenuItem value="visio">Visioconférence</MenuItem>
                    <MenuItem value="telephone">Téléphone</MenuItem>
                    <MenuItem value="presentiel">Présentiel</MenuItem>
                    <MenuItem value="a-confirmer">À confirmer</MenuItem>
                  </TextField>
                </Grid>
              </>
            ) : null}

            {file.value === 'a-avertir' ? (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Motif de la focale"
                    value={suivi.motifFocale}
                    onChange={update('motifFocale')}
                  >
                    {MOTIFS_FOCALE.map((item) => (
                      <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Situation de l’absence"
                    value={suivi.statutAbsence}
                    onChange={update('statutAbsence')}
                  >
                    {STATUTS_ABSENCE.map((item) => (
                      <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            ) : null}

            {file.value === 'attente-suite-avertissement' ? (
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Date d’envoi de l’avertissement"
                  value={suivi.dateAvertissement}
                  onChange={update('dateAvertissement')}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            ) : null}
          </Grid>

          {file.actions.length > 0 ? (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5 }}>
                Actions à réaliser pour cette file
              </Typography>
              <Grid container spacing={0.5}>
                {file.actions.map((actionId) => (
                  <Grid key={actionId} size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={suivi.actionsRealisees[actionId] === true}
                          onChange={toggleAction(actionId)}
                        />
                      )}
                      label={ACTIONS_MUTUALISEES[actionId]}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : null}

          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            label="Commentaire de suivi et prochaine action"
            value={suivi.commentaire}
            onChange={update('commentaire')}
            placeholder="Faits, décision humaine, destinataire, échéance et prochaine action…"
          />

          {file.suiviM6 ? (
            <Stack spacing={0.75}>
              <Alert severity="warning">
                Une absence ou un avertissement ne déclenche aucune sanction automatiquement. Vérifiez l’excuse, le motif légitime, la remobilisation et le circuit M6.
              </Alert>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={suivi.procedureInterneConfirmee}
                      onChange={update('procedureInterneConfirmee')}
                    />
                  )}
                  label="J’ai vérifié la procédure interne applicable"
                />
                <Button variant="outlined" color="warning" onClick={onOpenSuiviM6}>
                  Ouvrir le suivi M6
                </Button>
              </Stack>
            </Stack>
          ) : null}

          {alertes.length > 0 ? (
            <Stack spacing={0.75}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                Alertes à l’enregistrement
              </Typography>
              {alertes.map((alerte) => (
                <Alert key={alerte.id} severity={alerte.niveau} sx={{ py: 0.25 }}>
                  <strong>{alerte.titre}</strong><br />
                  {alerte.message}
                </Alert>
              ))}
            </Stack>
          ) : null}

          <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&::before': { display: 'none' } }}>
            <AccordionSummary>
              <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Consignes collectives du portefeuille</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack component="ul" spacing={0.5} sx={{ my: 0, pl: 2.5 }}>
                {CONSIGNES_COLLECTIVES.map((item) => (
                  <Typography component="li" variant="body2" key={item}>{item}</Typography>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Paper>
    </Stack>
  )
}

export default PortefeuilleMutualiseCard
