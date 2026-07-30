import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { deleteTraining, listTrainings, saveTraining } from '../services/trainingService'

const emptyTraining = {
  id: '',
  nom: '',
  organisme: '',
  domaine: '',
  dateDebut: '',
  dateFin: '',
  dateLimite: '',
  modalite: 'Présentiel',
  lieu: '',
  places: '',
  publicCible: '',
  prerequis: '',
  objectifs: '',
  contenu: '',
  financement: '',
  contact: '',
  lien: '',
  notes: '',
  statut: 'Inscriptions ouvertes',
}

const todayIso = () => new Date().toISOString().slice(0, 10)

const temporalStatus = (training) => {
  if (training.statut === 'Annulée') return 'Annulée'
  const today = todayIso()
  if (training.dateFin && training.dateFin < today) return 'Terminée'
  if (!training.dateFin && training.dateDebut < today) return 'Terminée'
  if (training.dateDebut <= today && (!training.dateFin || training.dateFin >= today)) return 'En cours'
  return 'À venir'
}

const statusColor = (status) => ({
  'À venir': 'primary',
  'En cours': 'success',
  Terminée: 'default',
  Annulée: 'error',
}[status] || 'default')

const formatDate = (value) => {
  if (!value) return 'Non renseignée'
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR')
}

const FormationsPage = () => {
  const [version, setVersion] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyTraining)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('À venir')
  const [modalityFilter, setModalityFilter] = useState('Toutes')

  const trainings = useMemo(() => listTrainings(), [version])
  const displayedTrainings = useMemo(() => {
    const query = search.trim().toLowerCase()
    return trainings.filter((training) => {
      const status = temporalStatus(training)
      if (statusFilter !== 'Toutes' && status !== statusFilter) return false
      if (modalityFilter !== 'Toutes' && training.modalite !== modalityFilter) return false
      if (query && !Object.values(training).join(' ').toLowerCase().includes(query)) return false
      return true
    })
  }, [trainings, search, statusFilter, modalityFilter])

  const summary = useMemo(() => {
    const now = new Date()
    const inThirtyDays = new Date()
    inThirtyDays.setDate(inThirtyDays.getDate() + 30)
    return {
      upcoming: trainings.filter((item) => temporalStatus(item) === 'À venir').length,
      soon: trainings.filter((item) => {
        const start = new Date(`${item.dateDebut}T12:00:00`)
        return start >= now && start <= inThirtyDays
      }).length,
      open: trainings.filter((item) => item.statut === 'Inscriptions ouvertes' && temporalStatus(item) === 'À venir').length,
      remote: trainings.filter((item) => /distance|hybride/i.test(item.modalite)).length,
    }
  }, [trainings])

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const openCreate = () => {
    setForm(emptyTraining)
    setError('')
    setMessage('')
    setFormOpen(true)
  }

  const openEdit = (training) => {
    setForm({ ...emptyTraining, ...training })
    setError('')
    setMessage('')
    setFormOpen(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const result = await saveTraining(form)
      setVersion((current) => current + 1)
      setFormOpen(false)
      setForm(emptyTraining)
      setMessage(
        `${result.created ? 'Formation ajoutée' : 'Formation modifiée'}.`
        + (result.cloudSynced ? ' Sauvegarde en ligne effectuée.' : ' Sauvegarde locale effectuée ; synchronisation en ligne à reprendre.'),
      )
    } catch (saveError) {
      setError(saveError.message || 'Enregistrement impossible.')
    }
  }

  const handleDelete = async (training) => {
    if (!window.confirm(`Supprimer définitivement la formation « ${training.nom} » ?`)) return
    const result = await deleteTraining(training.id)
    if (result.ok) {
      setVersion((current) => current + 1)
      setMessage(
        `Formation supprimée.`
        + (result.cloudSynced ? ' Sauvegarde en ligne actualisée.' : ' Suppression locale effectuée ; synchronisation en ligne à reprendre.'),
      )
    }
  }

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, py: 1.5 }}>
      <Stack spacing={1.5}>
        <Paper sx={{ p: 2, color: '#fff', background: 'linear-gradient(100deg, #173f67 0%, #1976d2 65%, #00897b 100%)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={1}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>Formations à venir</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                Centralisez le calendrier, les conditions, le programme et les modalités d’inscription.
              </Typography>
            </Box>
            <Button variant="contained" color="warning" onClick={openCreate} sx={{ fontWeight: 900 }}>
              Ajouter une formation
            </Button>
          </Stack>
        </Paper>

        {message ? <Alert severity="success">{message}</Alert> : null}

        <Grid container spacing={1}>
          {[
            ['À venir', summary.upcoming, '#1976d2'],
            ['Dans les 30 jours', summary.soon, '#ed6c02'],
            ['Inscriptions ouvertes', summary.open, '#2e7d32'],
            ['À distance ou hybrides', summary.remote, '#7b1fa2'],
          ].map(([label, value, color]) => (
            <Grid key={label} size={{ xs: 6, md: 3 }}>
              <Paper variant="outlined" sx={{ p: 1.25, borderLeft: `7px solid ${color}` }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color }}>{value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {formOpen ? (
          <Paper component="form" onSubmit={handleSave} variant="outlined" sx={{ p: 2, border: '2px solid #1976d2' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#173f67' }}>
                {form.id ? 'Modifier la formation' : 'Nouvelle formation'}
              </Typography>
              <Button color="inherit" onClick={() => setFormOpen(false)}>Fermer</Button>
            </Stack>
            <Grid container spacing={1.25}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField required fullWidth size="small" label="Nom de la formation" value={form.nom} onChange={updateField('nom')} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField required fullWidth size="small" label="Organisme" value={form.organisme} onChange={updateField('organisme')} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth size="small" label="Domaine ou métier" value={form.domaine} onChange={updateField('domaine')} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField required fullWidth size="small" type="date" label="Début" value={form.dateDebut} onChange={updateField('dateDebut')} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField fullWidth size="small" type="date" label="Fin" value={form.dateFin} onChange={updateField('dateFin')} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField fullWidth size="small" type="date" label="Date limite" value={form.dateLimite} onChange={updateField('dateLimite')} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField select fullWidth size="small" label="Modalité" value={form.modalite} onChange={updateField('modalite')}>
                  {['Présentiel', 'À distance', 'Hybride'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 8, md: 3 }}>
                <TextField fullWidth size="small" label="Lieu" value={form.lieu} onChange={updateField('lieu')} />
              </Grid>
              <Grid size={{ xs: 4, md: 1 }}>
                <TextField fullWidth size="small" type="number" label="Places" value={form.places} onChange={updateField('places')} inputProps={{ min: 0 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField select fullWidth size="small" label="État des inscriptions" value={form.statut} onChange={updateField('statut')}>
                  {['Inscriptions ouvertes', 'Inscriptions closes', 'Complète', 'Annulée'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth size="small" label="Public cible" value={form.publicCible} onChange={updateField('publicCible')} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth size="small" label="Prérequis" value={form.prerequis} onChange={updateField('prerequis')} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth multiline minRows={3} label="Objectifs" value={form.objectifs} onChange={updateField('objectifs')} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth multiline minRows={3} label="Programme / contenu modifiable" value={form.contenu} onChange={updateField('contenu')} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth size="small" label="Financement / rémunération" value={form.financement} onChange={updateField('financement')} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth size="small" label="Contact d’inscription" value={form.contact} onChange={updateField('contact')} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth size="small" label="Lien d’inscription" value={form.lien} onChange={updateField('lien')} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline minRows={2} label="Notes internes" value={form.notes} onChange={updateField('notes')} />
              </Grid>
            </Grid>
            {error ? <Alert severity="error" sx={{ mt: 1.25 }}>{error}</Alert> : null}
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button type="submit" variant="contained" sx={{ fontWeight: 900 }}>Enregistrer la formation</Button>
              <Button variant="outlined" onClick={() => setFormOpen(false)}>Annuler</Button>
            </Stack>
          </Paper>
        ) : null}

        <Paper variant="outlined" sx={{ p: 1.25 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <TextField
              size="small"
              label="Rechercher une formation"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField select size="small" label="Période" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} sx={{ minWidth: 170 }}>
              {['Toutes', 'À venir', 'En cours', 'Terminée', 'Annulée'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Modalité" value={modalityFilter} onChange={(event) => setModalityFilter(event.target.value)} sx={{ minWidth: 160 }}>
              {['Toutes', 'Présentiel', 'À distance', 'Hybride'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>
          </Stack>
        </Paper>

        {displayedTrainings.length ? (
          <Grid container spacing={1.25}>
            {displayedTrainings.map((training) => {
              const status = temporalStatus(training)
              return (
                <Grid key={training.id} size={{ xs: 12, xl: 6 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, height: '100%', borderLeft: '7px solid #1976d2' }}>
                    <Stack spacing={1}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>{training.nom}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {training.organisme}{training.domaine ? ` · ${training.domaine}` : ''}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5} alignItems="flex-start">
                          <Chip size="small" color={statusColor(status)} label={status} />
                          <Chip size="small" variant="outlined" label={training.statut} />
                        </Stack>
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        Du {formatDate(training.dateDebut)}{training.dateFin ? ` au ${formatDate(training.dateFin)}` : ''} · {training.modalite}
                        {training.lieu ? ` · ${training.lieu}` : ''}
                      </Typography>
                      {training.dateLimite ? (
                        <Alert severity={training.dateLimite < todayIso() ? 'warning' : 'info'} sx={{ py: 0 }}>
                          Date limite d’inscription : {formatDate(training.dateLimite)}
                        </Alert>
                      ) : null}
                      {training.objectifs ? <Typography variant="body2"><strong>Objectifs :</strong> {training.objectifs}</Typography> : null}
                      {training.contenu ? (
                        <Box sx={{ p: 1, bgcolor: '#f3f6f9', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: '#174f86' }}>PROGRAMME</Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{training.contenu}</Typography>
                        </Box>
                      ) : null}
                      <Grid container spacing={0.75}>
                        {training.publicCible ? <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2"><strong>Public :</strong> {training.publicCible}</Typography></Grid> : null}
                        {training.prerequis ? <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2"><strong>Prérequis :</strong> {training.prerequis}</Typography></Grid> : null}
                        {training.financement ? <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2"><strong>Financement :</strong> {training.financement}</Typography></Grid> : null}
                        {training.places ? <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2"><strong>Places :</strong> {training.places}</Typography></Grid> : null}
                        {training.contact ? <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2"><strong>Contact :</strong> {training.contact}</Typography></Grid> : null}
                        {training.lien ? <Grid size={{ xs: 12, md: 6 }}><Typography variant="body2"><strong>Inscription :</strong> {training.lien}</Typography></Grid> : null}
                      </Grid>
                      {training.notes ? <Typography variant="caption" color="text.secondary">Note interne : {training.notes}</Typography> : null}
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" onClick={() => openEdit(training)}>Modifier</Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(training)}>Supprimer</Button>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        ) : (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>Aucune formation dans cette vue</Typography>
            <Typography color="text.secondary">
              Ajoutez une formation à venir ou modifiez les filtres de recherche.
            </Typography>
            <Button variant="contained" onClick={openCreate} sx={{ mt: 1.5 }}>Ajouter une formation</Button>
          </Paper>
        )}
      </Stack>
    </Box>
  )
}

export default FormationsPage
