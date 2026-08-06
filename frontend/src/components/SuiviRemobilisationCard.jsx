import {
  Alert,
  Autocomplete,
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
  normaliserSuiviRemobilisation,
} from '../data/suiviRemobilisation'

function SuiviRemobilisationCard({ value, onChange }) {
  const suivi = normaliserSuiviRemobilisation(value)
  const alertes = genererAlertesRemobilisation(suivi)
  const nombreAlertes = compterAlertesRemobilisation(suivi)
  const indicesChoisis = INDICES_CRE.filter((item) => suivi.indicesSelectionnes.includes(item.id))
  const actionsChoisies = ACTIONS_REMOBILISATION.filter((item) => suivi.actionsCategories.includes(item.id))

  const update = (field) => (event) => {
    const booleens = ['actif', 'actionRealisee', 'contexteSuspension', 'procedureInterneConfirmee']
    onChange({ ...suivi, [field]: booleens.includes(field) ? event.target.checked : event.target.value })
  }

  const onIndicesChange = (_, nextValues) => {
    const indicesSelectionnes = nextValues.map((item) => item.id)
    const justificatifsParIndice = { ...suivi.justificatifsParIndice }
    Object.keys(justificatifsParIndice).forEach((id) => {
      if (!indicesSelectionnes.includes(id)) delete justificatifsParIndice[id]
    })
    onChange({ ...suivi, indicesSelectionnes, justificatifsParIndice })
  }

  const onActionsChange = (_, nextValues) => {
    const actionsCategories = nextValues.map((item) => item.id)
    onChange({ ...suivi, actionsCategories, actionCategorie: actionsCategories[0] || '' })
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
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={INDICES_CRE}
                  value={indicesChoisis}
                  onChange={onIndicesChange}
                  groupBy={(item) => item.domaineLabel}
                  getOptionLabel={(item) => item.label}
                  isOptionEqualToValue={(option, selected) => option.id === selected.id}
                  limitTags={3}
                  renderOption={(props, indice, { selected }) => (
                    <li {...props} key={indice.id}>
                      <Checkbox checked={selected} sx={{ mr: 1, py: 0.25 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{indice.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {indice.domaineLabel} · importance {indice.importance.toLowerCase()}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Indices à retenir"
                      placeholder={indicesChoisis.length > 0 ? '' : 'Ouvrir puis cocher plusieurs indices…'}
                      helperText={`${indicesChoisis.length} indice(s) · ${domaines.length} domaine(s)`}
                    />
                  )}
                />
                <Grid container spacing={1}>
                  {indicesChoisis.map((indice) => (
                    <Grid key={indice.id} size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        size="small"
                        label={`Preuve · ${indice.label}`}
                        value={suivi.justificatifsParIndice[indice.id] || ''}
                        onChange={updateJustificatif(indice.id)}
                        placeholder="Fait daté, échange, pièce ou trace vérifiable…"
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                  ))}
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
                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={ACTIONS_REMOBILISATION}
                      value={actionsChoisies}
                      onChange={onActionsChange}
                      getOptionLabel={(item) => item.label}
                      isOptionEqualToValue={(option, selected) => option.id === selected.id}
                      limitTags={2}
                      renderOption={(props, item, { selected }) => (
                        <li {...props} key={item.id}>
                          <Checkbox checked={selected} sx={{ mr: 1, py: 0.25 }} />
                          {item.label}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Familles d’action"
                          placeholder={actionsChoisies.length > 0 ? '' : 'Cocher une ou plusieurs familles…'}
                        />
                      )}
                    />
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
                  {actionsChoisies.length > 0 ? (
                    <Grid size={{ xs: 12 }}>
                      <Stack spacing={0.5}>
                        {actionsChoisies.map((action) => (
                          <Alert key={action.id} severity="info" sx={{ py: 0.5 }}>
                            <strong>{action.label}</strong><br />
                            Exemples non exhaustifs : {action.exemples}<br />
                            Traces possibles : {action.preuves}
                          </Alert>
                        ))}
                      </Stack>
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
