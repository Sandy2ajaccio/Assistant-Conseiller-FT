import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import {
  DATE_CONSIGNES_PORTEFEUILLE,
  FILES_PORTEFEUILLE_MUTUALISE,
} from '../data/portefeuilleMutualise'

const PRIORITES = [
  {
    titre: 'Rendez-vous et PRDVL',
    texte: 'Prévoir les RDVL en visio, informer sur la prise de rendez-vous en ligne et rappeler le contact Ajaccio EM / site.',
    couleur: '#1565c0',
  },
  {
    titre: 'Premiers entretiens',
    texte: 'Programmer la GPF collective, présenter accompagnement, CVM, droits et engagements, puis saisir EDP et contrat.',
    couleur: '#2e7d32',
  },
  {
    titre: 'Dossiers sans action',
    texte: 'Vérifier PRDVL, parcours, contrat, action utile, point téléphonique et situation d’inscription.',
    couleur: '#ed6c02',
  },
  {
    titre: 'Absence ou avertissement',
    texte: 'Documenter les faits, rechercher l’excuse, remobiliser et confirmer la procédure M6. Aucune sanction automatique.',
    couleur: '#c62828',
  },
]

function PortefeuilleMissionStart({ onOpenPortfolio, onOpenSaves }) {
  const files = FILES_PORTEFEUILLE_MUTUALISE.filter((item) => !['a-examiner', 'termine'].includes(item.value))

  return (
    <Accordion
      defaultExpanded
      disableGutters
      sx={{
        border: '2px solid #efb0b0',
        borderRadius: '12px !important',
        overflow: 'hidden',
        boxShadow: '0 6px 20px rgba(126,20,20,0.08)',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary sx={{ bgcolor: '#fff6f6', px: { xs: 1.5, md: 2 }, minHeight: 58 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} justifyContent="space-between" sx={{ width: '100%', pr: 1 }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#b71c1c', fontWeight: 950, letterSpacing: 1 }}>
              À L’OUVERTURE · MON PORTEFEUILLE MUTUALISÉ
            </Typography>
            <Typography variant="h6" sx={{ color: '#5d1717', fontWeight: 950, lineHeight: 1.15 }}>
              Mes priorités pour ne rien oublier
            </Typography>
          </Box>
          <Chip color="error" variant="outlined" label="Support interne à confirmer" sx={{ fontWeight: 900, flexShrink: 0 }} />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: { xs: 1.25, md: 2 }, bgcolor: '#fff' }}>
        <Stack spacing={1.5}>
          <Alert severity="info" sx={{ py: 0 }}>
            Consignes datées du {new Date(`${DATE_CONSIGNES_PORTEFEUILLE}T12:00:00`).toLocaleDateString('fr-FR')} : elles organisent votre travail et doivent être actualisées si une nouvelle consigne interne est diffusée.
          </Alert>
          <Alert severity="error" sx={{ py: 0 }}>
            <strong>Code OP2 IA — inscription administrative : ne jamais convoquer.</strong> Vérifier les informations dans l’accompagnement de la personne avant toute action.
          </Alert>

          <Grid container spacing={1}>
            {PRIORITES.map((item) => (
              <Grid key={item.titre} size={{ xs: 12, sm: 6, xl: 3 }}>
                <Paper variant="outlined" sx={{ height: '100%', p: 1.25, borderTop: `4px solid ${item.couleur}`, bgcolor: '#fbfcfe' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 950, color: item.couleur }}>{item.titre}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.texte}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.6, fontWeight: 900, color: '#5f6f80' }}>
              Files à surveiller
            </Typography>
            <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap">
              {files.map((item) => <Chip key={item.value} size="small" variant="outlined" label={item.label} />)}
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" color="error" onClick={onOpenPortfolio} sx={{ fontWeight: 900 }}>
              Ouvrir le suivi du portefeuille →
            </Button>
            <Button variant="outlined" onClick={onOpenSaves} sx={{ fontWeight: 800 }}>
              Voir mes dossiers sauvegardés
            </Button>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

export default PortefeuilleMissionStart
