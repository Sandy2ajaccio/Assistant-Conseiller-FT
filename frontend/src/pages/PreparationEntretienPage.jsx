import { useMemo, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material'
import PreparationEntretienFiche from '../components/PreparationEntretienFiche'
import {
  buildPreparationEntretienFiche,
  listPreparationEntretienDossiers,
} from '../services/preparationEntretienService'
import { loadStoredDossier } from '../services/dossierLoaderService'

function PreparationEntretienPage() {
  const dossiers = useMemo(() => listPreparationEntretienDossiers(), [])
  const [identifiant, setIdentifiant] = useState(dossiers[0]?.identifiant || '')
  const [fiche, setFiche] = useState(null)
  const [message, setMessage] = useState('')

  const onPreparerEntretien = () => {
    if (!identifiant) {
      setMessage("Sélectionnez un identifiant FT pour préparer l'entretien.")
      setFiche(null)
      return
    }

    const resultat = loadStoredDossier(identifiant)
    if (!resultat.ok) {
      setMessage(resultat.message)
      setFiche(null)
      return
    }

    setFiche(buildPreparationEntretienFiche(resultat.dossier))
    setMessage('Fiche générée automatiquement à partir des données du dossier.')
  }

  const onImprimer = () => {
    window.print()
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Stack spacing={2}>
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                V1.1 - Préparation entretien
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Module de préparation pré-entretien basé uniquement sur les données existantes du dossier.
              </Typography>

              <TextField
                select
                label="Identifiant FT"
                value={identifiant}
                onChange={(event) => setIdentifiant(event.target.value)}
                size="small"
                fullWidth
              >
                {dossiers.map((item) => (
                  <MenuItem key={item.identifiant} value={item.identifiant}>
                    {item.identifiant}
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={onPreparerEntretien}>
                  Préparer l'entretien
                </Button>
                <Button variant="outlined" onClick={onImprimer} disabled={!fiche}>
                  Imprimer la fiche
                </Button>
              </Stack>

              {message ? <Alert severity="info">{message}</Alert> : null}
            </Stack>
          </CardContent>
        </Card>

        {fiche ? <PreparationEntretienFiche fiche={fiche} /> : null}
      </Stack>
    </Box>
  )
}

export default PreparationEntretienPage
