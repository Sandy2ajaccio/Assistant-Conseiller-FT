import {
  Alert,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import {
  ACTIONS_REMOBILISATION,
  CONCLUSIONS_CRE,
  INDICES_CRE,
  VERSION_GRILLE_FAISCEAU,
  VERSION_GRILLE_REMOBILISATION,
  compterAlertesRemobilisation,
  genererAlertesRemobilisation,
  getActionRemobilisation,
  normaliserSuiviRemobilisation,
} from '../data/suiviRemobilisation'

function SuiviRemobilisationCard({ value, onChange }) {
  const suivi = normaliserSuiviRemobilisation(value)
  const alertes = genererAlertesRemobilisation(suivi)
  const nombreAlertes = compterAlertesRemobilisation(suivi)
  const action = getActionRemobilisation(suivi.actionCategorie)

  const update = (field) => (event) => {
    const booleens = ['actif', 'actionRealisee', 'contexteSuspension', 'procedureInterneConfirmee']
    onChange({ ...suivi, [field]: booleens.includes(field) ? event.target.checked : event.target.value })
  }

  const toggleIndice = (id) => (event) => {
    const indicesSelectionnes = event.target.checked
      ? [...suivi.indicesSelectionnes, id]
      : suivi.indicesSelectionnes.filter((item) => item !== id)
    const justificatifsParIndice = { ...suivi.justificatifsParIndice }
    if (!event.target.checked) delete justificatifsParIndice[id]
    onChange({ ...suivi, indicesSelectionnes, justificatifsParIndice })
  }

  const updateJustificatif = (id) => (event) => {
    onChange({
      ...suivi,
      justificatifsParIndice: {
        ...suivi.justificatifsParIndice,
        [id]: event.target.value,
      },
    })
  }

  const domaines = Array.from(new Set(
    suivi.indicesSelectionnes
      .map((id) => INDICES_CRE.find((item) => item.id === id)?.domaine)
      .filter(Boolean),
  ))

  return (
    <Stack spacing={1.5}>
      <Alert severity="warning">
        Cette grille aide à mettre des indices en regard. Elle ne qualifie aucun manquement, ne remplace pas le contradictoire et ne déclenche ni sanction ni levée de suspension.
      </Alert>

      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderLeft: '6px solid #7650a3' }}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Faisceau CRE et remobilisation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Référentiels internes : faisceau d’indices {VERSION_GRILLE_FAISCEAU} · actions de remobilisation {VERSION_GRILLE_REMOBILISATION}.
              </Typography>
            </Box>
            <Chip
              color={!suivi.actif ? 'default' : nombreAlertes > 0 ? 'error' : 'success'}
              label={!suivi.actif ? 'Aucun examen CRE ouvert' : nombreAlertes > 0 ? `${nombreAlertes} alerte(s) à traiter` : 'Analyse documentée'}
              sx={{ fontWeight: 900, alignSelf: { md: 'flex-start' } }}
            />
          </Stack>

          <FormControlLabel
            control={<Switch checked={suivi.actif} onChange={update('actif')} />}
            label="Ouvrir une analyse par faisceau d’indices pour ce dossier"
          />

          {suivi.actif ? (
            <>
              <Alert severity={domaines.length >= 2 ? 'info' : 'error'} sx={{ py: 0.5 }}>
                {suivi.indicesSelectionnes.length} indice(s) sélectionné(s) dans {domaines.length} domaine(s). Au moins deux domaines distincts sont nécessaires ; aucun indice isolé ne suffit.
              </Alert>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.75 }}>
                  1. Indices observés et éléments probants
                </Typography>
                <Grid container spacing={1}>
                  {INDICES_CRE.map((indice) => {
                    const selected = suivi.indicesSelectionnes.includes(indice.id)
                    return (
                      <Grid key={indice.id} size={{ xs: 12, md: 6 }}>
                        <Paper variant="outlined" sx={{ p: 1, bgcolor: selected ? '#f7f2fb' : '#fff' }}>
                          <FormControlLabel
                            control={<Checkbox checked={selected} onChange={toggleIndice(indice.id)} />}
                            label={(
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{indice.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {indice.domaineLabel} · importance {indice.importance.toLowerCase()}
                                </Typography>
                              </Box>
                            )}
                          />
                          {selected ? (
                            <TextField
                              fullWidth
                              multiline
                              minRows={2}
                              size="small"
                              label="Constat factuel et pièce associée"
                              value={suivi.justificatifsParIndice[indice.id] || ''}
                              onChange={updateJustificatif(indice.id)}
                              placeholder="Fait daté, échange, pièce ou trace vérifiable…"
                              sx={{ mt: 0.75 }}
                            />
                          ) : null}
                        </Paper>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.75 }}>
                  2. Mise en regard et conclusion du conseiller
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      size="small"
                      label="Analyse globale du faisceau"
                      value={suivi.analyseGlobale}
                      onChange={update('analyseGlobale')}
                      placeholder="Convergences, contradictions, contexte, éléments favorables et défavorables…"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Conclusion humaine"
                      value={suivi.conclusionHumaine}
                      onChange={update('conclusionHumaine')}
                    >
                      {CONCLUSIONS_CRE.map((item) => (
                        <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.75 }}>
                  3. Action de remobilisation et preuve attendue
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Famille d’action"
                      value={suivi.actionCategorie}
                      onChange={update('actionCategorie')}
                    >
                      <MenuItem value="">À définir si nécessaire</MenuItem>
                      {ACTIONS_REMOBILISATION.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Action individualisée retenue"
                      value={suivi.actionRetenue}
                      onChange={update('actionRetenue')}
                    />
                  </Grid>
                  {action ? (
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="info" sx={{ py: 0.5 }}>
                        <strong>Exemples non exhaustifs :</strong> {action.exemples}<br />
                        <strong>Traces possibles :</strong> {action.preuves}
                      </Alert>
                    </Grid>
                  ) : null}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Échéance convenue"
                      value={suivi.dateEcheance}
                      onChange={update('dateEcheance')}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Modalité de constatation / preuve attendue"
                      value={suivi.preuveAttendue}
                      onChange={update('preuveAttendue')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={<Checkbox checked={suivi.actionRealisee} onChange={update('actionRealisee')} />}
                      label="L’action est réalisée"
                    />
                  </Grid>
                  {suivi.actionRealisee ? (
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        size="small"
                        label="Preuve ou constat de réalisation"
                        value={suivi.preuveRealisation}
                        onChange={update('preuveRealisation')}
                      />
                    </Grid>
                  ) : null}
                </Grid>
              </Box>

              <Paper variant="outlined" sx={{ p: 1.25, bgcolor: '#fff8e8' }}>
                <FormControlLabel
                  control={<Checkbox checked={suivi.contexteSuspension} onChange={update('contexteSuspension')} />}
                  label="Ce suivi intervient dans un contexte de suspension"
                />
                {suivi.contexteSuspension ? (
                  <FormControlLabel
                    control={<Checkbox checked={suivi.procedureInterneConfirmee} onChange={update('procedureInterneConfirmee')} />}
                    label="J’ai vérifié la procédure interne France Travail en vigueur et l’autorité compétente"
                  />
                ) : null}
              </Paper>

              {alertes.length > 0 ? (
                <Stack spacing={0.75}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Alertes lors de l’enregistrement</Typography>
                  {alertes.map((alerte) => (
                    <Alert key={alerte.id} severity={alerte.niveau} sx={{ py: 0.25 }}>
                      <strong>{alerte.titre}</strong><br />{alerte.message}
                    </Alert>
                  ))}
                </Stack>
              ) : null}
            </>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  )
}

export default SuiviRemobilisationCard
