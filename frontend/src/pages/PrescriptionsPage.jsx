import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CockpitBlockCard from '../components/CockpitBlockCard'
import PrescriptionResultCard from '../components/PrescriptionResultCard'
import { offreServiceCorse } from '../data/offreServiceCorse'

const TYPES_PRESCRIPTION = [
  'Atelier',
  'Prestation',
  'Formation',
  'Partenaire',
  'PMSMP',
  'IAE',
  'Immersion',
  'Aide a la mobilite',
  'Aide financiere',
  'Autre',
]

const DOMAINES = ['Tous', ...new Set(offreServiceCorse.map((item) => item.domaine))]
const PUBLICS = ['Tous', ...new Set(offreServiceCorse.map((item) => item.public))]
const LOCALISATIONS = ['Tous', ...new Set(offreServiceCorse.map((item) => item.localisation))]
const DISTANCES = ['Tous', '0-5 km', '5-15 km', '15-30 km', '30+ km']
const PARTENAIRES = ['Tous', ...new Set(offreServiceCorse.map((item) => item.partenaire))]
const TYPES = ['Tous', ...TYPES_PRESCRIPTION]

const PRESCRIPTIONS_DATA = offreServiceCorse.map((item) => ({
  ...item,
  organisme: item.intervenants || item.partenaire,
}))

const normalizeSearch = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const matchesSearch = (item, query) => {
  if (!query) return true
  const corpus = normalizeSearch(`${item.code || ''} ${item.nom} ${item.organisme} ${item.objectif} ${item.conditions}`)
  const normalizedQuery = normalizeSearch(query)
  if (corpus.includes(normalizedQuery)) return true

  const usefulTokens = normalizedQuery
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !['atelier', 'prestation', 'pour', 'avec', 'dans'].includes(token))

  return usefulTokens.some((token) => corpus.includes(token))
}

const JUSTIFICATION_BASE =
  "Cette prescription est adaptee au regard des besoins identifies lors de l'entretien, du projet professionnel et des freins observes."

const INITIAL_CHECKLIST = {
  convocation: false,
  information: false,
  consentement: false,
  coordonnees: false,
  autre: false,
}

const DEFAULT_RAISON_METIER = [
  'La recommandation cible un besoin immediat identifie pendant l entretien.',
  'Le format retenu est coherent avec le niveau de mobilisation observe.',
  'La prescription permet d engager une action concrete rapidement.',
]

const DEFAULT_VIGILANCES = [
  'Verifier l adequation avec le besoin prioritaire exprime.',
  'Confirmer la disponibilite de la personne sur la duree prevue.',
  'S assurer que les conditions d acces sont bien remplies.',
]

const SELECT_MENU_PROPS = {
  disablePortal: false,
  container: () => document.body,
  PaperProps: {
    sx: {
      zIndex: 2000,
    },
  },
}

function PrescriptionsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [typeSelectionne, setTypeSelectionne] = useState(() => {
    const requestedType = searchParams.get('type')
    return TYPES_PRESCRIPTION.includes(requestedType) ? requestedType : 'Atelier'
  })
  const [recherche, setRecherche] = useState(() => searchParams.get('q') || '')
  const [filtres, setFiltres] = useState({
    domaine: 'Tous',
    public: 'Tous',
    localisation: 'Tous',
    distance: 'Tous',
    partenaire: 'Tous',
    type: 'Tous',
  })
  const [selection, setSelection] = useState(null)
  const [justification, setJustification] = useState(JUSTIFICATION_BASE)
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST)
  const [status, setStatus] = useState('')

  const resultats = useMemo(() => {
    const query = recherche.trim()
    return PRESCRIPTIONS_DATA.filter((item) => {
      if (typeSelectionne && item.type !== typeSelectionne && filtres.type === 'Tous') return false
      if (filtres.type !== 'Tous' && item.type !== filtres.type) return false
      if (filtres.domaine !== 'Tous' && item.domaine !== filtres.domaine) return false
      if (filtres.public !== 'Tous' && item.public !== filtres.public) return false
      if (filtres.localisation !== 'Tous' && item.localisation !== filtres.localisation) return false
      if (filtres.distance !== 'Tous' && item.distance !== filtres.distance) return false
      if (filtres.partenaire !== 'Tous' && item.partenaire !== filtres.partenaire) return false
      return matchesSearch(item, query)
    })
  }, [typeSelectionne, recherche, filtres])

  const prescriptionActive = selection || resultats[0] || null

  const raisonsMetier = useMemo(() => {
    if (!prescriptionActive) return DEFAULT_RAISON_METIER

    return [
      `Le public cible (${prescriptionActive.public}) correspond au besoin traite.`,
      `L objectif de la prescription (${prescriptionActive.objectif}) soutient directement la dynamique d accompagnement.`,
      `La localisation a ${prescriptionActive.localisation} et le format ${prescriptionActive.type.toLowerCase()} favorisent une mise en oeuvre realiste.`,
    ]
  }, [prescriptionActive])

  const pointsVigilance = useMemo(() => {
    if (!prescriptionActive) return DEFAULT_VIGILANCES

    return [
      `Verifier les conditions d acces: ${prescriptionActive.conditions}`,
      `Confirmer la disponibilite necessaire sur la duree annoncee: ${prescriptionActive.duree}.`,
      `S assurer que l organisme ${prescriptionActive.organisme} est pertinent pour la situation du demandeur.`,
    ]
  }, [prescriptionActive])

  const alternatives = useMemo(() => {
    if (!prescriptionActive) return []

    const similaires = PRESCRIPTIONS_DATA.filter((item) => item.id !== prescriptionActive.id)
      .filter((item) => (
        item.type === prescriptionActive.type
        || item.domaine === prescriptionActive.domaine
        || item.public === prescriptionActive.public
      ))

    if (similaires.length > 0) return similaires.slice(0, 3)

    return PRESCRIPTIONS_DATA.filter((item) => item.id !== prescriptionActive.id).slice(0, 3)
  }, [prescriptionActive])

  const onSelectPrescription = (item) => {
    setSelection(item)
    setJustification(`${JUSTIFICATION_BASE} La proposition retenue est ${item.nom} (${item.organisme}).`)
    setStatus(`Prescription selectionnee: ${item.nom}`)
  }

  const onChangeFiltre = (key, value) => {
    setFiltres((prev) => ({ ...prev, [key]: value }))
  }

  const onToggleChecklist = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const onEnregistrer = () => {
    setStatus(selection ? `Brouillon enregistre pour ${selection.nom}.` : 'Brouillon enregistre sans selection.')
  }

  const onImprimer = () => {
    window.print()
  }

  const onExporterPdf = () => {
    window.print()
    setStatus('Export PDF: utilisez la destination Imprimer en PDF.')
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1.5 }, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Stack spacing={1}>
        <CockpitBlockCard title="Prescriptions" subtitle="Cap Decision FT - module de prescription conseiller">
          <Typography variant="body2" color="text.secondary">
            Selectionnez un type, filtrez les resultats et validez la prescription adaptee.
          </Typography>
        </CockpitBlockCard>

        <Grid container spacing={1}>
          <Grid size={12}>
            <CockpitBlockCard title="1. Type de prescription" sx={{ minHeight: 176, maxHeight: 176 }}>
              <Grid container spacing={0.75}>
                {TYPES_PRESCRIPTION.map((item) => {
                  const selected = item === typeSelectionne
                  return (
                    <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={item}>
                      <Card
                        sx={{
                          border: '1px solid',
                          borderColor: selected ? 'primary.main' : 'divider',
                          bgcolor: selected ? '#eef4ff' : '#fff',
                          borderRadius: 2,
                        }}
                      >
                        <CardActionArea onClick={() => setTypeSelectionne(item)}>
                          <CardContent sx={{ py: 1, px: 1.25 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
                              {item}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            </CockpitBlockCard>
          </Grid>

          <Grid size={12} sx={{ overflow: 'visible', position: 'relative', zIndex: 3 }}>
            <CockpitBlockCard
              title="2. Recherche"
              allowOverflow
              sx={{ minHeight: 200, maxHeight: 200, overflow: 'visible', position: 'relative', zIndex: 3 }}
              detailsSx={{ overflow: 'visible', position: 'relative', zIndex: 3 }}
            >
              <TextField
                label="Rechercher"
                value={recherche}
                onChange={(event) => setRecherche(event.target.value)}
                placeholder="Nom, organisme, objectif..."
                fullWidth
                size="small"
              />
              <Grid container spacing={0.75}>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="prescriptions-domaine-label">Domaine</InputLabel>
                    <Select
                      labelId="prescriptions-domaine-label"
                      label="Domaine"
                      value={filtres.domaine}
                      onChange={(event) => onChangeFiltre('domaine', event.target.value)}
                      MenuProps={SELECT_MENU_PROPS}
                    >
                      {DOMAINES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="prescriptions-public-label">Public</InputLabel>
                    <Select
                      labelId="prescriptions-public-label"
                      label="Public"
                      value={filtres.public}
                      onChange={(event) => onChangeFiltre('public', event.target.value)}
                      MenuProps={SELECT_MENU_PROPS}
                    >
                      {PUBLICS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="prescriptions-localisation-label">Localisation</InputLabel>
                    <Select
                      labelId="prescriptions-localisation-label"
                      label="Localisation"
                      value={filtres.localisation}
                      onChange={(event) => onChangeFiltre('localisation', event.target.value)}
                      MenuProps={SELECT_MENU_PROPS}
                    >
                      {LOCALISATIONS.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="prescriptions-distance-label">Distance</InputLabel>
                    <Select
                      labelId="prescriptions-distance-label"
                      label="Distance"
                      value={filtres.distance}
                      onChange={(event) => onChangeFiltre('distance', event.target.value)}
                      MenuProps={SELECT_MENU_PROPS}
                    >
                      {DISTANCES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="prescriptions-partenaire-label">Partenaire</InputLabel>
                    <Select
                      labelId="prescriptions-partenaire-label"
                      label="Partenaire"
                      value={filtres.partenaire}
                      onChange={(event) => onChangeFiltre('partenaire', event.target.value)}
                      MenuProps={SELECT_MENU_PROPS}
                    >
                      {PARTENAIRES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="prescriptions-type-label">Type</InputLabel>
                    <Select
                      labelId="prescriptions-type-label"
                      label="Type"
                      value={filtres.type}
                      onChange={(event) => onChangeFiltre('type', event.target.value)}
                      MenuProps={SELECT_MENU_PROPS}
                    >
                      {TYPES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CockpitBlockCard>
          </Grid>

          <Grid size={12}>
            <CockpitBlockCard title="3. Resultats" sx={{ minHeight: 320, maxHeight: 320 }}>
              <Grid container spacing={0.75}>
                {resultats.length > 0 ? (
                  resultats.map((item) => (
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item.id}>
                      <PrescriptionResultCard item={item} selected={selection?.id === item.id} onSelect={onSelectPrescription} />
                    </Grid>
                  ))
                ) : (
                  <Grid size={12}>
                    <Typography variant="body2" color="text.secondary">
                      Aucun resultat avec les criteres actuels.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CockpitBlockCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CockpitBlockCard title="Pourquoi cette prescription ?" sx={{ minHeight: 186, maxHeight: 186 }}>
              <Stack spacing={0.4}>
                {raisonsMetier.map((item) => (
                  <Typography key={item} variant="body2">- {item}</Typography>
                ))}
              </Stack>
            </CockpitBlockCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CockpitBlockCard title="Points de vigilance" sx={{ minHeight: 186, maxHeight: 186 }}>
              <Stack spacing={0.4}>
                {pointsVigilance.map((item) => (
                  <Typography key={item} variant="body2">- {item}</Typography>
                ))}
              </Stack>
            </CockpitBlockCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CockpitBlockCard title="Alternatives" sx={{ minHeight: 186, maxHeight: 186 }}>
              <Stack spacing={0.5}>
                {alternatives.length > 0 ? (
                  alternatives.map((item) => (
                    <Button
                      key={item.id}
                      variant="outlined"
                      size="small"
                      onClick={() => onSelectPrescription(item)}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      {item.nom} - {item.organisme}
                    </Button>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucune alternative disponible.
                  </Typography>
                )}
              </Stack>
            </CockpitBlockCard>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <CockpitBlockCard title="4. Justification conseiller" sx={{ minHeight: 186, maxHeight: 186 }}>
              <TextField
                label="Justification"
                value={justification}
                onChange={(event) => setJustification(event.target.value)}
                multiline
                minRows={5}
                fullWidth
                size="small"
              />
            </CockpitBlockCard>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <CockpitBlockCard title="5. Pieces a remettre" sx={{ minHeight: 186, maxHeight: 186 }}>
              <Stack spacing={0.25}>
                <Button variant={checklist.convocation ? 'contained' : 'outlined'} size="small" onClick={() => onToggleChecklist('convocation')} sx={{ justifyContent: 'flex-start' }}>
                  {checklist.convocation ? '☑' : '☐'} Convocation
                </Button>
                <Button variant={checklist.information ? 'contained' : 'outlined'} size="small" onClick={() => onToggleChecklist('information')} sx={{ justifyContent: 'flex-start' }}>
                  {checklist.information ? '☑' : '☐'} Document d information
                </Button>
                <Button variant={checklist.consentement ? 'contained' : 'outlined'} size="small" onClick={() => onToggleChecklist('consentement')} sx={{ justifyContent: 'flex-start' }}>
                  {checklist.consentement ? '☑' : '☐'} Consentement
                </Button>
                <Button variant={checklist.coordonnees ? 'contained' : 'outlined'} size="small" onClick={() => onToggleChecklist('coordonnees')} sx={{ justifyContent: 'flex-start' }}>
                  {checklist.coordonnees ? '☑' : '☐'} Coordonnees du partenaire
                </Button>
                <Button variant={checklist.autre ? 'contained' : 'outlined'} size="small" onClick={() => onToggleChecklist('autre')} sx={{ justifyContent: 'flex-start' }}>
                  {checklist.autre ? '☑' : '☐'} Autre
                </Button>
              </Stack>
            </CockpitBlockCard>
          </Grid>

          <Grid size={12}>
            <CockpitBlockCard title="6. Validation" sx={{ minHeight: 110, maxHeight: 110 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button variant="contained" onClick={onEnregistrer}>Enregistrer</Button>
                <Button variant="outlined" onClick={onImprimer}>Imprimer</Button>
                <Button variant="outlined" onClick={onExporterPdf}>Exporter PDF</Button>
                <Button variant="text" onClick={() => navigate('/assistant')}>Retour Cockpit</Button>
              </Stack>
              {status ? <Typography variant="caption" color="text.secondary">{status}</Typography> : null}
            </CockpitBlockCard>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  )
}

export default PrescriptionsPage
