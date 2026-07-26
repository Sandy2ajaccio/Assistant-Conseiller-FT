import { Card, CardContent, Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material'

const renderList = (items, emptyText) => {
  if (!items || items.length === 0) {
    return (
      <List dense>
        <ListItem>
          <ListItemText primary={emptyText} />
        </ListItem>
      </List>
    )
  }

  return (
    <List dense>
      {items.map((item, index) => (
        <ListItem key={`${item}-${index}`}>
          <ListItemText primary={item} />
        </ListItem>
      ))}
    </List>
  )
}

function PreparationEntretienFiche({ fiche }) {
  if (!fiche) return null

  return (
    <Stack spacing={2}>
      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Fiche de préparation entretien
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fiche consultable uniquement (impression autorisée)
          </Typography>

          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">Identifiant FT</Typography>
              <Typography>{fiche.identifiantFt}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">Type d'entretien</Typography>
              <Typography>{fiche.typeEntretien}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">Date du dernier entretien</Typography>
              <Typography>{fiche.dateDernierEntretien}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Dernière synthèse</Typography>
          <Typography variant="body2">{fiche.derniereSynthese}</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Dernière MAP</Typography>
              <Typography variant="body2">{fiche.derniereMap}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Prestations en cours</Typography>
              {renderList(fiche.prestationsEnCours, 'Aucune prestation en cours.')}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Dernières actions du conseiller</Typography>
              {renderList(fiche.dernieresActionsConseiller, 'Aucune action conseiller identifiée.')}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Dernières actions du demandeur</Typography>
              {renderList(fiche.dernieresActionsDemandeur, 'Aucune action demandeur identifiée.')}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Partenaires mobilisés</Typography>
              {renderList(fiche.partenairesMobilises, 'Aucun partenaire mobilisé.')}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Freins encore ouverts</Typography>
              {renderList(fiche.freinsOuverts, 'Aucun frein ouvert identifié.')}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Atouts principaux</Typography>
              {renderList(fiche.atoutsPrincipaux, 'Aucun atout principal identifié.')}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Points de vigilance</Typography>
              {renderList(fiche.pointsVigilance, 'Aucun point de vigilance spécifique.')}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Questions suggérées pour l'entretien</Typography>
          {renderList(fiche.questionsSuggerees, 'Aucune question suggérée.')}
        </CardContent>
      </Card>
    </Stack>
  )
}

export default PreparationEntretienFiche
