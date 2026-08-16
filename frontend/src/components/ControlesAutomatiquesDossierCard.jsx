import { Alert, Box, Button, Chip, Grid, Paper, Stack, Typography } from '@mui/material'

function ControleBloc({ titre, resultat, couleur, onOpen }) {
  const aVerifier = resultat.statut === 'a-verifier'
  return (
    <Paper variant="outlined" sx={{ height: '100%', p: 1.25, borderLeft: `5px solid ${aVerifier ? '#d32f2f' : couleur}`, bgcolor: aVerifier ? '#fff7f7' : '#f8fcf9' }}>
      <Stack spacing={0.75} sx={{ height: '100%' }}>
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 950, color: '#173f67' }}>{titre}</Typography>
          <Chip size="small" color={aVerifier ? 'error' : 'success'} label={aVerifier ? 'À vérifier' : 'Contrôlé'} sx={{ fontWeight: 850 }} />
        </Stack>
        <Typography variant="body2" sx={{ fontWeight: 850 }}>{resultat.titre}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{resultat.resume}</Typography>
        <Button size="small" variant={aVerifier ? 'contained' : 'text'} color={aVerifier ? 'error' : 'primary'} onClick={onOpen} sx={{ alignSelf: 'flex-start', fontWeight: 850 }}>
          {aVerifier ? 'Examiner maintenant →' : 'Voir le détail si nécessaire'}
        </Button>
      </Stack>
    </Paper>
  )
}

function ControlesAutomatiquesDossierCard({ identifiant, analyse, onOpenObligations, onOpenCre }) {
  if (!identifiant.trim()) return null

  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2.5, borderColor: '#9fc2df', bgcolor: '#f4f9fd' }}>
      <Stack spacing={1}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={0.75} justifyContent="space-between" alignItems={{ md: 'center' }}>
          <Box>
            <Typography variant="overline" sx={{ fontWeight: 950, color: '#0b6fb8', letterSpacing: 0.8 }}>AUTOMATIQUE À L’OUVERTURE DU DE</Typography>
            <Typography variant="h6" sx={{ fontWeight: 950, color: '#173f67', lineHeight: 1.15 }}>Obligations et faisceau CRE déjà contrôlés</Typography>
          </Box>
          <Chip color="primary" variant="outlined" label={`DE ${identifiant.trim()}`} sx={{ fontWeight: 900 }} />
        </Stack>

        {!analyse.sourceTrouvee ? (
          <Alert severity="info" sx={{ py: 0 }}>
            Identifiant saisi. Le contrôle se complète automatiquement à mesure que les informations du dossier sont renseignées.
          </Alert>
        ) : null}
        {analyse.nePasConvoquer ? (
          <Alert severity="error" sx={{ py: 0 }}><strong>Code IA détecté : ne pas convoquer.</strong> Vérifier l’accompagnement avant toute action.</Alert>
        ) : null}

        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ControleBloc titre="Suivi des obligations" resultat={analyse.obligations} couleur="#2e7d32" onOpen={onOpenObligations} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ControleBloc titre="Faisceau CRE" resultat={analyse.cre} couleur="#2e7d32" onOpen={onOpenCre} />
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary">
          Le logiciel repère et organise les informations. La qualification d’un manquement, la conclusion CRE et toute décision restent humaines et doivent suivre les procédures internes France Travail.
        </Typography>
      </Stack>
    </Paper>
  )
}

export default ControlesAutomatiquesDossierCard
