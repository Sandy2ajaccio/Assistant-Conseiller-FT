import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

function SimulateurSection({
  addScenario,
  scenarios,
  setShowComparison,
  appliquerScenarioFinal,
  selectedScenarioId,
  decisionFinaleMessage,
  setSelectedScenarioId,
  calculerResultatScenario,
  removeScenario,
  updateScenario,
  TYPES_ACCOMPAGNEMENT,
  prestationsCorse,
  partenairesCorse,
  FORMATIONS_OPTIONS,
  MAP_OPTIONS,
  FREQUENCES_SUIVI,
  normalizePrestation,
  normalizePartenaire,
  showComparison,
  scenarioComparaisonRows,
}) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        <Button
          variant="contained"
          onClick={addScenario}
          disabled={scenarios.length >= 3}
        >
          Ajouter un scénario
        </Button>
        <Button
          variant="outlined"
          onClick={() => setShowComparison((prev) => !prev)}
        >
          Comparer les scénarios
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={appliquerScenarioFinal}
          disabled={!selectedScenarioId}
        >
          Appliquer la décision finale
        </Button>
      </Stack>

      {decisionFinaleMessage ? (
        <Typography variant="body2" color="success.main">
          {decisionFinaleMessage}
        </Typography>
      ) : null}

      <RadioGroup
        value={selectedScenarioId}
        onChange={(event) => setSelectedScenarioId(event.target.value)}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              md: scenarios.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
              lg: `repeat(${Math.min(scenarios.length, 3)}, minmax(0, 1fr))`,
            },
          }}
        >
          {scenarios.map((scenario) => {
            const resultat = calculerResultatScenario(scenario)
            return (
              <Card key={scenario.id} variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1.25}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" component="h4">
                        {scenario.nom}
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeScenario(scenario.id)}
                        disabled={scenarios.length <= 1}
                      >
                        Supprimer
                      </Button>
                    </Stack>

                    <FormControlLabel
                      value={scenario.id}
                      control={<Radio size="small" />}
                      label="Sélectionner comme décision finale"
                    />

                    <FormControl fullWidth size="small">
                      <InputLabel>Type d'accompagnement</InputLabel>
                      <Select
                        value={scenario.typeAccompagnement}
                        label="Type d'accompagnement"
                        onChange={(event) =>
                          updateScenario(scenario.id, 'typeAccompagnement', event.target.value)
                        }
                      >
                        {TYPES_ACCOMPAGNEMENT.map((item) => (
                          <MenuItem key={item} value={item}>{item}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel>Prestations</InputLabel>
                      <Select
                        multiple
                        value={scenario.prestations}
                        label="Prestations"
                        onChange={(event) =>
                          updateScenario(scenario.id, 'prestations', event.target.value)
                        }
                        renderValue={(selected) =>
                          selected
                            .map((item, index) => normalizePrestation(item, index, 'scenario-select').libelle)
                            .join(', ')
                        }
                      >
                        {prestationsCorse.map((item) => (
                          <MenuItem key={item} value={item}>{item}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel>Partenaires</InputLabel>
                      <Select
                        multiple
                        value={scenario.partenaires}
                        label="Partenaires"
                        onChange={(event) =>
                          updateScenario(scenario.id, 'partenaires', event.target.value)
                        }
                        renderValue={(selected) =>
                          selected
                            .map((item, index) => normalizePartenaire(item, index, 'scenario-select').nom)
                            .join(', ')
                        }
                      >
                        {partenairesCorse.map((item) => (
                          <MenuItem key={item} value={item}>{item}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel>Formation</InputLabel>
                      <Select
                        value={scenario.formation}
                        label="Formation"
                        onChange={(event) =>
                          updateScenario(scenario.id, 'formation', event.target.value)
                        }
                      >
                        <MenuItem value="">
                          <em>Non définie</em>
                        </MenuItem>
                        {FORMATIONS_OPTIONS.map((item) => (
                          <MenuItem key={item} value={item}>{item}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel>MAP</InputLabel>
                      <Select
                        value={scenario.map}
                        label="MAP"
                        onChange={(event) => updateScenario(scenario.id, 'map', event.target.value)}
                      >
                        <MenuItem value="">
                          <em>Non définie</em>
                        </MenuItem>
                        {MAP_OPTIONS.map((item) => (
                          <MenuItem key={item} value={item}>{item}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel>Fréquence de suivi</InputLabel>
                      <Select
                        value={scenario.frequenceSuivi}
                        label="Fréquence de suivi"
                        onChange={(event) =>
                          updateScenario(scenario.id, 'frequenceSuivi', event.target.value)
                        }
                      >
                        {FREQUENCES_SUIVI.map((item) => (
                          <MenuItem key={item} value={item}>{item}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label="Échéance"
                      value={scenario.echeance}
                      onChange={(event) => updateScenario(scenario.id, 'echeance', event.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />

                    <Paper variant="outlined" sx={{ p: 1.2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.6 }}>Avantages</Typography>
                      {resultat.avantages.map((item) => (
                        <Typography key={`${scenario.id}-a-${item}`} variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      ))}
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 1.2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.6 }}>Points de vigilance</Typography>
                      {resultat.pointsVigilance.map((item) => (
                        <Typography key={`${scenario.id}-v-${item}`} variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      ))}
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 1.2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.6 }}>Freins restant à lever</Typography>
                      {(resultat.freinsRestants.length > 0
                        ? resultat.freinsRestants
                        : ['Aucun frein résiduel critique.']).map((item) => (
                        <Typography key={`${scenario.id}-f-${item}`} variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      ))}
                    </Paper>

                    <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
                      {(resultat.partenairesMobilises.length > 0
                        ? resultat.partenairesMobilises
                        : ['Aucun partenaire']).map((item) => (
                        <Chip
                          key={`${scenario.id}-p-${typeof item === 'string' ? item : item.id}`}
                          size="small"
                          label={typeof item === 'string' ? item : item.nom}
                        />
                      ))}
                    </Stack>

                    <Paper variant="outlined" sx={{ p: 1.2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.6 }}>Prochaines actions</Typography>
                      {resultat.prochainesActions.map((item) => (
                        <Typography key={`${scenario.id}-n-${item}`} variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      ))}
                    </Paper>
                  </Stack>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      </RadioGroup>

      {showComparison ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Critère</TableCell>
                {scenarios.map((scenario) => (
                  <TableCell key={`head-${scenario.id}`}>{scenario.nom}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {scenarioComparaisonRows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell sx={{ fontWeight: 600 }}>{row.label}</TableCell>
                  {scenarios.map((scenario) => {
                    const resultat = calculerResultatScenario(scenario)
                    return (
                      <TableCell key={`${row.label}-${scenario.id}`}>
                        {row.getter(resultat)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </Box>
  )
}

export default SimulateurSection
