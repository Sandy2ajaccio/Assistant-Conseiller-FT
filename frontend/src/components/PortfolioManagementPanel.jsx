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
  listPortfolioRecords,
  PORTFOLIO_PROFILE_OPTIONS,
  PORTFOLIO_TRACKING_STATUS_OPTIONS,
  savePortfolioRecord,
  trackingStatusOption,
} from '../services/portfolioImportService'
import { getPortfolioAlertSummary } from '../services/portfolioAlertsService'

const emptyRecord = {
  identifiant: '',
  civilite: '',
  age: '',
  profils: [],
  dateInscription: '',
  dateRetraitePrevisionnelle: '',
  ancienneteModaliteMois: '',
  dateDernierContact: '',
  prochainJalon: '',
  dateProchainJalon: '',
  motifProchainJalon: '',
  dateConvocation: '',
  nombreActionsConseillees: '',
  nombreActionsEnCoursOuTerminees: '',
  statutProfil: '',
  dateDerniereModification: '',
  acteurDerniereModification: '',
  oreAContractualiser: '',
  consentementPromotionProfil: '',
  commune: '',
  canton: '',
  categorieActuelle: '',
  indisponibiliteEnCours: '',
  deldDetld: '',
  motifImport: '',
  statutSuiviImport: 'a_qualifier',
  actionSuiviImport: '',
  commentaireSuiviImport: '',
  dateSuiviImport: '',
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
  const [portfolioSearch, setPortfolioSearch] = useState('')
  const [alertFilter, setAlertFilter] = useState('all')
  const [trackingFilter, setTrackingFilter] = useState('all')
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [expandedAlertId, setExpandedAlertId] = useState('')

  const exportCount = useMemo(
    () => countPortfolioRecordsForExport(filters),
    [filters, portfolioVersion],
  )

  const allRecords = useMemo(
    () => listPortfolioRecords(),
    [portfolioVersion],
  )

  const alertSummary = useMemo(
    () => getPortfolioAlertSummary(allRecords),
    [allRecords],
  )

  const campaignOptions = useMemo(
    () => [...new Set(allRecords.map((item) => item.motifImport).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')),
    [allRecords],
  )

  const trackingSummary = useMemo(() => {
    const scoped = campaignFilter === 'all'
      ? allRecords
      : allRecords.filter((item) => item.motifImport === campaignFilter)
    const isActionRequired = (status) => ['action_requise', 'a_reconvoquer', 'a_avertir', 'a_signaler_cre'].includes(status)
    return {
      aQualifier: scoped.filter((item) => !item.statutSuiviImport || item.statutSuiviImport === 'a_qualifier').length,
      enCours: scoped.filter((item) => item.statutSuiviImport === 'en_cours').length,
      realises: scoped.filter((item) => item.statutSuiviImport === 'realise').length,
      actionsRequises: scoped.filter((item) => isActionRequired(item.statutSuiviImport)).length,
      aRecontacter: scoped.filter((item) => item.statutSuiviImport === 'a_recontacter').length,
    }
  }, [allRecords, campaignFilter])

  const displayedRecords = useMemo(() => {
    const search = portfolioSearch.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    return alertSummary.details
      .filter(({ record: item, alerts }) => {
        if (search && !String(item.identifiant || '').toUpperCase().includes(search)) return false
        if (campaignFilter !== 'all' && item.motifImport !== campaignFilter) return false
        if (trackingFilter === 'action' && !['action_requise', 'a_reconvoquer', 'a_avertir', 'a_signaler_cre'].includes(item.statutSuiviImport)) return false
        if (trackingFilter !== 'all' && trackingFilter !== 'action' && (item.statutSuiviImport || 'a_qualifier') !== trackingFilter) return false
        if (alertFilter === 'urgent') return alerts.some((alert) => alert.niveau === 'error')
        if (alertFilter === 'alerts') return alerts.length > 0
        if (alertFilter === 'current') return alerts.length === 0
        return true
      })
      .sort((a, b) => {
        const trackingPriority = {
          action_requise: 60, a_reconvoquer: 60, a_avertir: 60, a_signaler_cre: 60,
          a_recontacter: 50, en_cours: 40, a_qualifier: 30, realise: 10,
        }
        const trackingA = trackingPriority[a.record.statutSuiviImport || 'a_qualifier'] || 0
        const trackingB = trackingPriority[b.record.statutSuiviImport || 'a_qualifier'] || 0
        const priorityA = a.alerts[0]?.priorite || 0
        const priorityB = b.alerts[0]?.priorite || 0
        return trackingB - trackingA || priorityB - priorityA || String(a.record.identifiant).localeCompare(String(b.record.identifiant), 'fr')
      })
  }, [alertSummary, alertFilter, portfolioSearch, campaignFilter, trackingFilter])

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

  const handleQuickTrackingChange = async (item, status) => {
    const option = trackingStatusOption(status)
    setSaveError('')
    try {
      const result = await savePortfolioRecord({
        ...item,
        statutSuiviImport: status,
        actionSuiviImport: status === 'a_qualifier' ? '' : option.label,
        dateSuiviImport: new Date().toISOString().slice(0, 10),
      })
      setSaveStatus(`${item.identifiant} : ${option.label}. Suivi enregistré.`)
      onPortfolioChanged(result.record.identifiant)
    } catch (error) {
      setSaveError(error.message || 'Mise à jour rapide impossible.')
    }
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
            <Typography variant="subtitle2" sx={{ gridColumn: '1 / -1', mt: 0.5, fontWeight: 900, color: '#173f67' }}>
              Informations importées et suivi du portefeuille
            </Typography>
            <TextField fullWidth size="small" label="Objectif de l’import" value={record.motifImport || ''} onChange={updateRecord('motifImport')} />
            <TextField fullWidth size="small" select label="Statut du suivi importé" value={record.statutSuiviImport || 'a_qualifier'} onChange={updateRecord('statutSuiviImport')}>
              {PORTFOLIO_TRACKING_STATUS_OPTIONS.map((option) => <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>)}
            </TextField>
            <TextField fullWidth size="small" type="date" label="Date de suivi" value={record.dateSuiviImport || ''} onChange={updateRecord('dateSuiviImport')} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth size="small" label="Suite retenue" value={record.actionSuiviImport || ''} onChange={updateRecord('actionSuiviImport')} />
            <TextField fullWidth size="small" multiline minRows={2} label="Commentaire de suivi" value={record.commentaireSuiviImport || ''} onChange={updateRecord('commentaireSuiviImport')} sx={{ gridColumn: { sm: 'span 2' } }} />
            <TextField fullWidth size="small" type="number" label="Ancienneté dans la modalité (mois)" value={record.ancienneteModaliteMois || ''} onChange={updateRecord('ancienneteModaliteMois')} inputProps={{ min: 0 }} />
            <TextField fullWidth size="small" type="date" label="Dernier contact" value={record.dateDernierContact || ''} onChange={updateRecord('dateDernierContact')} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth size="small" type="date" label="Date du prochain jalon" value={record.dateProchainJalon || ''} onChange={updateRecord('dateProchainJalon')} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth size="small" label="Précision du prochain jalon" value={record.prochainJalon || ''} onChange={updateRecord('prochainJalon')} />
            <TextField fullWidth size="small" label="Motif du prochain jalon" value={record.motifProchainJalon || ''} onChange={updateRecord('motifProchainJalon')} />
            <TextField fullWidth size="small" type="date" label="Date de convocation" value={record.dateConvocation || ''} onChange={updateRecord('dateConvocation')} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth size="small" type="number" label="Actions conseillées" value={record.nombreActionsConseillees ?? ''} onChange={updateRecord('nombreActionsConseillees')} inputProps={{ min: 0 }} />
            <TextField fullWidth size="small" type="number" label="Actions en cours ou terminées" value={record.nombreActionsEnCoursOuTerminees ?? ''} onChange={updateRecord('nombreActionsEnCoursOuTerminees')} inputProps={{ min: 0 }} />
            <TextField fullWidth size="small" select label="Statut du profil" value={record.statutProfil || ''} onChange={updateRecord('statutProfil')}>
              <MenuItem value="">Non renseigné</MenuItem>
              <MenuItem value="Visible par les recruteurs">Visible par les recruteurs</MenuItem>
              <MenuItem value="Non visible par les recruteurs">Non visible par les recruteurs</MenuItem>
            </TextField>
            <TextField fullWidth size="small" type="date" label="Dernière modification" value={record.dateDerniereModification || ''} onChange={updateRecord('dateDerniereModification')} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth size="small" label="Acteur de la dernière modification" value={record.acteurDerniereModification || ''} onChange={updateRecord('acteurDerniereModification')} />
            <TextField fullWidth size="small" select label="ORE à contractualiser" value={record.oreAContractualiser || ''} onChange={updateRecord('oreAContractualiser')}>
              <MenuItem value="">Non renseigné</MenuItem><MenuItem value="OUI">Oui</MenuItem><MenuItem value="NON">Non</MenuItem>
            </TextField>
            <TextField fullWidth size="small" select label="Consentement promotion du profil" value={record.consentementPromotionProfil || ''} onChange={updateRecord('consentementPromotionProfil')}>
              <MenuItem value="">Non renseigné</MenuItem><MenuItem value="OUI">Oui</MenuItem><MenuItem value="NON">Non</MenuItem><MenuItem value="Non renseigné">À recueillir</MenuItem>
            </TextField>
            <TextField fullWidth size="small" label="Commune" value={record.commune || ''} onChange={updateRecord('commune')} />
            <TextField fullWidth size="small" label="Canton" value={record.canton || ''} onChange={updateRecord('canton')} />
            <TextField fullWidth size="small" select label="Catégorie actuelle" value={record.categorieActuelle || ''} onChange={updateRecord('categorieActuelle')}>
              <MenuItem value="">À vérifier</MenuItem><MenuItem value="1">Catégorie 1</MenuItem><MenuItem value="2">Catégorie 2</MenuItem><MenuItem value="3">Catégorie 3</MenuItem><MenuItem value="4">Catégorie 4</MenuItem><MenuItem value="5">Catégorie 5</MenuItem>
            </TextField>
            <TextField fullWidth size="small" select label="Indisponibilité en cours" value={record.indisponibiliteEnCours || ''} onChange={updateRecord('indisponibiliteEnCours')}>
              <MenuItem value="">Non renseignée</MenuItem><MenuItem value="OUI">Oui</MenuItem><MenuItem value="NON">Non</MenuItem>
            </TextField>
            <TextField fullWidth size="small" label="DELD / DETLD" value={record.deldDetld || ''} onChange={updateRecord('deldDetld')} />
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
        <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 900, color: '#173f67' }}>
          Suivi immédiat des imports
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr))' }, gap: 1, mt: 0.75 }}>
          {[
            ['a_qualifier', trackingSummary.aQualifier, 'Non traités', '#64748b', '#f1f5f9'],
            ['en_cours', trackingSummary.enCours, 'En cours / convoqués', '#735c00', '#fff7b2'],
            ['realise', trackingSummary.realises, 'Réalisés', '#176b35', '#d9f5e3'],
            ['action', trackingSummary.actionsRequises, 'Actions requises', '#a32121', '#ffe0e0'],
            ['a_recontacter', trackingSummary.aRecontacter, 'À recontacter', '#176b87', '#d9f2fc'],
          ].map(([filter, value, label, color, background]) => (
            <Button
              key={filter}
              variant={trackingFilter === filter ? 'contained' : 'outlined'}
              onClick={() => {
                setTrackingFilter((current) => current === filter ? 'all' : filter)
                setAlertFilter('all')
              }}
              sx={{ minHeight: 62, display: 'block', textAlign: 'left', color, bgcolor: background, borderColor: color, fontWeight: 900, '&:hover': { bgcolor: background } }}
            >
              <Typography variant="h6" sx={{ fontWeight: 950, lineHeight: 1 }}>{value}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 850 }}>{label}</Typography>
            </Button>
          ))}
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, minmax(0, 1fr))' },
            gap: 1,
            my: 1.25,
          }}
        >
          {[
            ['error', alertSummary.dossiersUrgents, 'Dossiers urgents'],
            ['warning', alertSummary.dossiersAvecAlertes, 'Dossiers à traiter'],
            ['primary', alertSummary.totalAlertes, 'Alertes détectées'],
            ['success', alertSummary.dossiersAJour, 'Dossiers à jour'],
          ].map(([color, value, label]) => (
            <Paper key={label} variant="outlined" sx={{ p: 1, borderColor: `${color}.main` }}>
              <Typography variant="h6" sx={{ fontWeight: 950, color: `${color}.main` }}>{value}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>{label}</Typography>
            </Paper>
          ))}
        </Box>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 1 }}>
          <TextField
            size="small"
            label="Rechercher un numéro FT"
            value={portfolioSearch}
            onChange={(event) => setPortfolioSearch(event.target.value)}
            sx={{ minWidth: 260 }}
          />
          <TextField
            select
            size="small"
            label="Objectif de l’import"
            value={campaignFilter}
            onChange={(event) => setCampaignFilter(event.target.value)}
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="all">Tous les imports</MenuItem>
            {campaignOptions.map((campaign) => <MenuItem key={campaign} value={campaign}>{campaign}</MenuItem>)}
          </TextField>
          <TextField
            select
            size="small"
            label="État d’avancement"
            value={trackingFilter}
            onChange={(event) => setTrackingFilter(event.target.value)}
            sx={{ minWidth: 240 }}
          >
            <MenuItem value="all">Tous les états</MenuItem>
            <MenuItem value="a_qualifier">Non traités</MenuItem>
            <MenuItem value="en_cours">En cours / convoqués</MenuItem>
            <MenuItem value="realise">Réalisés</MenuItem>
            <MenuItem value="action">Actions requises</MenuItem>
            <MenuItem value="a_recontacter">À recontacter</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Priorité de suivi"
            value={alertFilter}
            onChange={(event) => setAlertFilter(event.target.value)}
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="alerts">À traiter en priorité</MenuItem>
            <MenuItem value="urgent">Urgences uniquement</MenuItem>
            <MenuItem value="current">Dossiers à jour</MenuItem>
            <MenuItem value="all">Tous les dossiers</MenuItem>
          </TextField>
          <Chip label={`${displayedRecords.length} dossier(s) affiché(s)`} color="primary" variant="outlined" sx={{ alignSelf: { md: 'center' }, fontWeight: 850 }} />
        </Stack>
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
                  <TableCell sx={{ fontWeight: 800 }}>Objectif</TableCell>
                  <TableCell sx={{ fontWeight: 800, minWidth: 250 }}>Suivi rapide</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Dernier contact</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Prochain jalon</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Alerte</TableCell>
                  <TableCell sx={{ fontWeight: 800, minWidth: 260 }}>Ouvrir / modifier</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedRecords.map(({ record: item, alerts }) => {
                  const alertsToShow = expandedAlertId === item.identifiant ? alerts : alerts.slice(0, 2)
                  return (
                    <TableRow key={item.identifiant} sx={{ bgcolor: trackingStatusOption(item.statutSuiviImport).background }}>
                      <TableCell>{item.identifiant}</TableCell>
                      <TableCell>{item.motifImport || '—'}</TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          select
                          size="small"
                          value={item.statutSuiviImport || 'a_qualifier'}
                          onChange={(event) => handleQuickTrackingChange(item, event.target.value)}
                          sx={{
                            minWidth: 235,
                            '& .MuiInputBase-root': {
                              bgcolor: trackingStatusOption(item.statutSuiviImport).background,
                              color: trackingStatusOption(item.statutSuiviImport).color,
                              fontWeight: 900,
                            },
                          }}
                        >
                          {PORTFOLIO_TRACKING_STATUS_OPTIONS.map((option) => (
                            <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>{item.dateDernierContact || '—'}</TableCell>
                      <TableCell>{item.dateProchainJalon || item.prochainJalon || '—'}{item.motifProchainJalon ? ` · ${item.motifProchainJalon}` : ''}</TableCell>
                      <TableCell>
                        {alerts.length === 0 ? (
                          <Chip size="small" color="success" label="Suivi à jour" sx={{ fontWeight: 800 }} />
                        ) : (
                          <Stack spacing={0.65} sx={{ minWidth: 330 }}>
                            {alertsToShow.map((alert) => (
                              <Alert key={alert.id} severity={alert.niveau} sx={{ py: 0.2, px: 0.75, '& .MuiAlert-message': { py: 0.2 } }}>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 950 }}>{alert.titre}</Typography>
                                <Typography variant="caption">{alert.action}</Typography>
                              </Alert>
                            ))}
                            {alerts.length > 2 ? (
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => setExpandedAlertId((current) => current === item.identifiant ? '' : item.identifiant)}
                                sx={{ alignSelf: 'flex-start', fontWeight: 850 }}
                              >
                                {expandedAlertId === item.identifiant ? 'Réduire les alertes' : `Voir les ${alerts.length} alertes`}
                              </Button>
                            ) : null}
                          </Stack>
                        )}
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
