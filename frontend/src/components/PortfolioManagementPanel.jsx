import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import {
  countPortfolioRecordsForExport,
  exportPortfolioWorkbook,
  getRetirementAlertLevel,
  listPortfolioRecords,
  PORTFOLIO_PROFILE_OPTIONS,
  savePortfolioRecord,
} from '../services/portfolioImportService'

const RETIREMENT_ALERT_STYLES = {
  imminente: { label: 'Retraite < 6 mois', color: 'error' },
  proche: { label: 'Retraite 6-12 mois', color: 'warning' },
  depassee: { label: 'Date dépassée', color: 'default' },
}

const emptyRecord = {
  identifiant: '',
  civilite: '',
  age: '',
  profils: [],
  dateInscription: '',
  dateRetraitePrevisionnelle: '',
  situationAdministrative: '',
  situationPersonnelle: '',
  parcoursProfessionnel: '',
  ceQueDitLaPersonne: '',
  projet: '',
  formation: '',
}

const PortfolioManagementPanel = ({ portfolioVersion, onPortfolioChanged }) => {
  const [record, setRecord] = useState(emptyRecord)
  const [editingIdentifier, setEditingIdentifier] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [saveError, setSaveError] = useState('')
  const [filters, setFilters] = useState({
    ageMin: '',
    ageMax: '',
    dureeInscription: 'all',
    procheRetraite: false,
    profils: [],
    profileMode: 'any',
  })
  const [exportStatus, setExportStatus] = useState('')

  const exportCount = useMemo(
    () => countPortfolioRecordsForExport(filters),
    [filters, portfolioVersion],
  )

  const allRecords = useMemo(
    () => listPortfolioRecords(),
    [portfolioVersion],
  )

  const updateRecord = (field) => (event) => {
    setRecord((current) => ({ ...current, [field]: event.target.value }))
  }

  const updateFilter = (field) => (event) => {
    const value = field === 'procheRetraite' ? event.target.checked : event.target.value
    setFilters((current) => ({ ...current, [field]: value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaveStatus('')
    setSaveError('')
    try {
      const result = await savePortfolioRecord(record)
      setSaveStatus(
        `${result.created ? 'Demandeur ajouté' : 'Demandeur mis à jour'}.`
        + (result.cloudSynced ? ' Sauvegarde en ligne effectuée.' : ' Sauvegarde locale effectuée ; synchronisation en ligne à reprendre.'),
      )
      setRecord(emptyRecord)
      setEditingIdentifier('')
      onPortfolioChanged(result.record.identifiant)
    } catch (error) {
      setSaveError(error.message || 'Enregistrement impossible.')
    }
  }

  const handleEdit = (item) => {
    setSaveStatus('')
    setSaveError('')
    setEditingIdentifier(item.identifiant)
    setRecord({
      ...emptyRecord,
      ...item,
      profils: Array.isArray(item.profils) ? item.profils : [],
    })
    window.setTimeout(() => {
      document.getElementById('portfolio-record-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const cancelEdit = () => {
    setRecord(emptyRecord)
    setEditingIdentifier('')
    setSaveError('')
  }

  const handleExport = () => {
    setExportStatus('')
    try {
      const count = exportPortfolioWorkbook(filters)
      setExportStatus(`${count} demandeur(s) exporté(s) dans le fichier Excel.`)
    } catch (error) {
      setExportStatus(error.message || 'Export impossible.')
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderColor: '#9bb8d3' }}>
      <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2}>
        <Box id="portfolio-record-form" component="form" onSubmit={handleSave} sx={{ flex: 1.15, scrollMarginTop: 24 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#173f67' }}>
            {editingIdentifier ? `Modifier le dossier ${editingIdentifier}` : 'Ajouter ou mettre à jour un demandeur'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Un numéro France Travail déjà présent sera mis à jour sans doublon. Aucun nom ni prénom n’est affiché ou enregistré.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
              gap: 1,
              alignItems: 'start',
            }}
          >
            <TextField fullWidth required size="small" label="Numéro France Travail" value={record.identifiant} onChange={updateRecord('identifiant')} disabled={Boolean(editingIdentifier)} />
            <TextField fullWidth required={!editingIdentifier} select size="small" label="Civilité" value={record.civilite} onChange={updateRecord('civilite')}>
              <MenuItem value="">Non renseignée</MenuItem>
              <MenuItem value="Mr">Mr</MenuItem>
              <MenuItem value="Mme">Mme</MenuItem>
            </TextField>
            <TextField fullWidth required={!editingIdentifier} size="small" type="number" label="Âge" value={record.age} onChange={updateRecord('age')} inputProps={{ min: 16, max: 100 }} />
            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.25, color: 'text.secondary', fontWeight: 700 }}>
                Date d’inscription
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={record.dateInscription}
                onChange={updateRecord('dateInscription')}
                inputProps={{ 'aria-label': 'Date d’inscription' }}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.25, color: 'text.secondary', fontWeight: 700 }}>
                Retraite prévisionnelle
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={record.dateRetraitePrevisionnelle}
                onChange={updateRecord('dateRetraitePrevisionnelle')}
                inputProps={{ 'aria-label': 'Retraite prévisionnelle' }}
              />
            </Box>
            <Autocomplete
              multiple
              size="small"
              options={PORTFOLIO_PROFILE_OPTIONS}
              groupBy={(option) => option.group}
              getOptionLabel={(option) => option.label}
              value={PORTFOLIO_PROFILE_OPTIONS.filter((option) => record.profils.includes(option.id))}
              onChange={(_, values) => setRecord((current) => ({ ...current, profils: values.map((option) => option.id) }))}
              renderInput={(params) => (
                <TextField {...params} label="Profils et situations du DE" placeholder="RQTH, RSA, mobilité…" />
              )}
              sx={{ gridColumn: { sm: '1 / -1', lg: 'span 2' } }}
            />
            <TextField fullWidth size="small" label="Situation administrative" value={record.situationAdministrative || ''} onChange={updateRecord('situationAdministrative')} sx={{ gridColumn: { sm: '1 / -1', lg: 'span 1' } }} />
            <TextField fullWidth size="small" label="Situation personnelle" value={record.situationPersonnelle || ''} onChange={updateRecord('situationPersonnelle')} sx={{ gridColumn: { sm: '1 / -1', lg: 'span 1' } }} />
            <TextField fullWidth size="small" label="Parcours professionnel" value={record.parcoursProfessionnel || ''} onChange={updateRecord('parcoursProfessionnel')} sx={{ gridColumn: { sm: '1 / -1', lg: 'span 1' } }} />
            <TextField fullWidth multiline minRows={2} size="small" label="Demande exprimée ou évolution du dossier" value={record.ceQueDitLaPersonne || ''} onChange={updateRecord('ceQueDitLaPersonne')} sx={{ gridColumn: { sm: '1 / -1', lg: 'span 3' } }} />
            <TextField fullWidth multiline minRows={2} size="small" label="Projet professionnel" value={record.projet || ''} onChange={updateRecord('projet')} sx={{ gridColumn: { sm: '1 / -1', lg: 'span 2' } }} />
            <TextField fullWidth multiline minRows={2} size="small" label="Formation ou besoin à actualiser" value={record.formation || ''} onChange={updateRecord('formation')} sx={{ gridColumn: { sm: '1 / -1', lg: 'span 1' } }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ gridColumn: '1 / -1' }}>
              <Button type="submit" variant="contained" sx={{ fontWeight: 800, minHeight: 40 }}>
                {editingIdentifier ? 'Enregistrer les modifications' : 'Enregistrer le demandeur'}
              </Button>
              {editingIdentifier ? (
                <Button type="button" variant="outlined" onClick={cancelEdit} sx={{ fontWeight: 800 }}>
                  Annuler la modification
                </Button>
              ) : null}
            </Stack>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
            Import Excel anonymisé : tous les DE importés sont rattachés à votre portefeuille. Seules les données de suivi rattachées au numéro FT sont conservées ; les colonnes « Nom » et « Prénom » sont ignorées.
          </Typography>
          {saveError ? <Alert severity="error" sx={{ mt: 1 }}>{saveError}</Alert> : null}
          {saveStatus ? <Alert severity="success" sx={{ mt: 1 }}>{saveStatus}</Alert> : null}
        </Box>

        <Box sx={{ flex: 0.85, pl: { xl: 2 }, borderLeft: { xl: '1px solid #d7e0e8' } }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#173f67' }}>
            Export Excel filtré
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            DELD : 12 à 23 mois d’inscription. DETLD : 24 mois ou plus.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
              gap: 1,
              alignItems: 'start',
            }}
          >
            <TextField fullWidth size="small" type="number" label="Âge minimum" value={filters.ageMin} onChange={updateFilter('ageMin')} inputProps={{ min: 16, max: 100 }} />
            <TextField fullWidth size="small" type="number" label="Âge maximum" value={filters.ageMax} onChange={updateFilter('ageMax')} inputProps={{ min: 16, max: 100 }} />
            <TextField
              fullWidth
              select
              size="small"
              label="Durée d'inscription"
              value={filters.dureeInscription}
              onChange={updateFilter('dureeInscription')}
            >
              <MenuItem value="all">Toutes les durées</MenuItem>
              <MenuItem value="deld">DE longue durée (12–23 mois)</MenuItem>
              <MenuItem value="detld">DE très longue durée (24 mois et +)</MenuItem>
            </TextField>
            <FormControlLabel
              control={<Checkbox checked={filters.procheRetraite} onChange={updateFilter('procheRetraite')} />}
              label="Retraite dans 6 à 12 mois"
              sx={{ m: 0, minHeight: 40 }}
            />
            <Autocomplete
              multiple
              size="small"
              options={PORTFOLIO_PROFILE_OPTIONS}
              groupBy={(option) => option.group}
              getOptionLabel={(option) => option.label}
              value={PORTFOLIO_PROFILE_OPTIONS.filter((option) => filters.profils.includes(option.id))}
              onChange={(_, values) => setFilters((current) => ({ ...current, profils: values.map((option) => option.id) }))}
              renderInput={(params) => (
                <TextField {...params} label="Profils et situations" placeholder="Exemple : RQTH, RSA…" />
              )}
              sx={{ gridColumn: { sm: '1 / -1', lg: 'span 2' } }}
            />
            <TextField
              fullWidth
              select
              size="small"
              label="Combinaison des profils"
              value={filters.profileMode}
              onChange={updateFilter('profileMode')}
              disabled={filters.profils.length < 2}
              sx={{ gridColumn: { sm: '1 / -1', lg: 'span 2' } }}
            >
              <MenuItem value="any">Au moins un profil sélectionné</MenuItem>
              <MenuItem value="all">Tous les profils sélectionnés</MenuItem>
            </TextField>
            <Button variant="contained" color="success" onClick={handleExport} disabled={exportCount === 0} sx={{ fontWeight: 800, minHeight: 40, gridColumn: { sm: '1 / -1', lg: 'auto' } }}>
              Exporter {exportCount} DE
            </Button>
          </Box>
          {exportStatus ? <Alert severity={exportCount ? 'success' : 'warning'} sx={{ mt: 1 }}>{exportStatus}</Alert> : null}
        </Box>
      </Stack>

      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #d7e0e8' }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#173f67' }}>
          Demandeurs enregistrés ({allRecords.length})
        </Typography>
        {allRecords.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Aucun demandeur enregistré pour le moment.
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto', mt: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>N° France Travail</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Rattachement</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Civilité</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Âge</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Retraite prévisionnelle</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Alerte</TableCell>
                  <TableCell sx={{ fontWeight: 800, minWidth: 260 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allRecords.map((item) => {
                  const alertLevel = getRetirementAlertLevel(item)
                  const alertStyle = alertLevel ? RETIREMENT_ALERT_STYLES[alertLevel] : null
                  return (
                    <TableRow key={item.identifiant}>
                      <TableCell>{item.identifiant}</TableCell>
                      <TableCell>
                        {item.appartientMonPortefeuille ? (
                          <Chip size="small" color="success" label="Mon portefeuille" sx={{ fontWeight: 800 }} />
                        ) : '—'}
                      </TableCell>
                      <TableCell>{item.civilite || '—'}</TableCell>
                      <TableCell>{item.age || '—'}</TableCell>
                      <TableCell>{item.dateRetraitePrevisionnelle || '—'}</TableCell>
                      <TableCell>
                        {alertStyle ? (
                          <Chip size="small" label={alertStyle.label} color={alertStyle.color} sx={{ fontWeight: 700 }} />
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.75}>
                          <Button
                            size="small"
                            variant="contained"
                            component={Link}
                            to={`/assistant?dossier=${encodeURIComponent(item.identifiant)}`}
                            sx={{ fontWeight: 850, whiteSpace: 'nowrap' }}
                          >
                            Ouvrir le dossier
                          </Button>
                          <Button size="small" variant="outlined" onClick={() => handleEdit(item)} sx={{ fontWeight: 850 }}>
                            Modifier
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default PortfolioManagementPanel
