import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'

function SyntheseSection({
  genererOuRegenererSynthese,
  copierSyntheseEntretien,
  syntheseEntretien,
  setSyntheseEntretien,
  sauvegarderVersionEditee,
  messageSynthese,
  historiqueSynthese,
  restaurerVersion,
}) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        <Button
          variant="contained"
          onClick={() => genererOuRegenererSynthese('Générée')}
        >
          Générer la synthèse
        </Button>
        <Button
          variant="outlined"
          onClick={() => genererOuRegenererSynthese('Régénérée')}
        >
          Régénérer
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={copierSyntheseEntretien}
        >
          Copier dans le presse-papiers
        </Button>
      </Stack>

      <TextField
        fullWidth
        multiline
        minRows={18}
        label="Synthèse d'entretien"
        value={syntheseEntretien}
        onChange={(event) => setSyntheseEntretien(event.target.value)}
        onBlur={sauvegarderVersionEditee}
        placeholder="La synthèse est générée automatiquement et peut être modifiée librement par le conseiller."
      />

      {messageSynthese ? (
        <Typography variant="body2" color="primary">
          {messageSynthese}
        </Typography>
      ) : null}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Heure</TableCell>
              <TableCell>Auteur</TableCell>
              <TableCell>Version</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historiqueSynthese.length > 0 ? (
              historiqueSynthese.map((version) => (
                <TableRow key={version.id}>
                  <TableCell>{version.date}</TableCell>
                  <TableCell>{version.heure}</TableCell>
                  <TableCell>{version.auteur}</TableCell>
                  <TableCell>{`${version.texte.slice(0, 120)}${version.texte.length > 120 ? '...' : ''}`}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => restaurerVersion(version)}>
                      Restaurer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>Aucune version historisée pour le moment.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default SyntheseSection
