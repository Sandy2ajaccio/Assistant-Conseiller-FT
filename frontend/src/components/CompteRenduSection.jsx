import {
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Paper,
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

function CompteRenduSection({
  verifierCompteRendu,
  versionFinaleCompteRendu,
  compteRenduVerrouille,
  creerNouvelleVersionCompteRendu,
  compteRenduMessage,
  compteRenduVersionCourante,
  COMPTE_RENDU_STRUCTURE,
  compteRenduSections,
  updateCompteRenduSection,
  compteRenduHistorique,
  restaurerVersionCompteRendu,
  analyseCompteRendu,
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          xl: 'minmax(0, 2fr) minmax(320px, 1fr)',
        },
      }}
    >
      <Stack spacing={1.2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
          <Button variant="contained" onClick={verifierCompteRendu}>
            Vérifier le compte rendu
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={versionFinaleCompteRendu}
            disabled={compteRenduVerrouille}
          >
            Version finale
          </Button>
          <Button variant="outlined" onClick={creerNouvelleVersionCompteRendu}>
            Nouvelle version
          </Button>
        </Stack>

        {compteRenduMessage ? (
          <Typography variant="body2" color="primary">
            {compteRenduMessage}
          </Typography>
        ) : null}

        <Typography variant="subtitle2" color={compteRenduVerrouille ? 'error.main' : 'success.main'}>
          {compteRenduVerrouille
            ? `Version ${compteRenduVersionCourante} verrouillée (finale)`
            : `Version ${compteRenduVersionCourante} en cours d'édition`}
        </Typography>

        {COMPTE_RENDU_STRUCTURE.map((section) => (
          <TextField
            key={section.key}
            fullWidth
            multiline
            minRows={3}
            label={section.label}
            value={compteRenduSections[section.key] || ''}
            onChange={(event) => updateCompteRenduSection(section.key, event.target.value)}
            disabled={compteRenduVerrouille}
          />
        ))}

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Version</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Heure</TableCell>
                <TableCell>Auteur</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {compteRenduHistorique.length > 0 ? (
                compteRenduHistorique.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell>{version.version}</TableCell>
                    <TableCell>{version.date}</TableCell>
                    <TableCell>{version.heure}</TableCell>
                    <TableCell>{version.auteur}</TableCell>
                    <TableCell>{version.finale ? 'Finale' : 'Intermédiaire'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => restaurerVersionCompteRendu(version)}>
                        Restaurer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>Aucune version disponible.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <Card variant="outlined" sx={{ alignSelf: 'start', position: { xl: 'sticky' }, top: { xl: 12 } }}>
        <CardContent>
          <Typography variant="h6" component="h4" sx={{ mb: 1 }}>
            Contrôle qualité
          </Typography>

          <Stack spacing={1.1}>
            <Typography variant="body2">Score de complétude : {analyseCompteRendu.score}%</Typography>
            <LinearProgress variant="determinate" value={analyseCompteRendu.score} />

            <Typography variant="subtitle2">Champs manquants</Typography>
            {(analyseCompteRendu.champsManquants.length > 0
              ? analyseCompteRendu.champsManquants
              : ['Aucun champ manquant']).map((item) => (
              <Typography key={`missing-${item}`} variant="body2" color="text.secondary">
                {item}
              </Typography>
            ))}

            <Typography variant="subtitle2">Incohérences détectées</Typography>
            {(analyseCompteRendu.incoherences.length > 0
              ? analyseCompteRendu.incoherences
              : ['Aucune incohérence détectée']).map((item) => (
              <Typography key={`inconsistency-${item}`} variant="body2" color="text.secondary">
                {item}
              </Typography>
            ))}

            <Typography variant="subtitle2">Points à vérifier avant validation</Typography>
            {analyseCompteRendu.pointsAVerifier.map((item) => (
              <Typography key={`check-${item}`} variant="body2" color="text.secondary">
                {item}
              </Typography>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default CompteRenduSection
