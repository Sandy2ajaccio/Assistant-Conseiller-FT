import { useMemo, useRef, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PrescriptionDashboard from '../components/PrescriptionDashboard'
import DailyWorkQueue from '../components/DailyWorkQueue'
import PrescriptionFollowUp from '../components/PrescriptionFollowUp'
import PortfolioManagementPanel from '../components/PortfolioManagementPanel'
import { offreServiceCorse } from '../data/offreServiceCorse'
import {
  getLastOpenedDossierId,
  listStoredDossiers,
} from '../services/dossierLoaderService'
import getRecommandations from '../services/recommandationService'
import {
  importPortfolioWorkbook,
  listPortfolioRecords,
  portfolioRecordToDossier,
} from '../services/portfolioImportService'

const PrescriptionsPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fileInputRef = useRef(null)
  const [portfolioVersion, setPortfolioVersion] = useState(0)
  const [importStatus, setImportStatus] = useState('')
  const portfolioRecords = useMemo(() => listPortfolioRecords(), [portfolioVersion])
  const dossiers = useMemo(() => {
    const fullDossiers = new Map(listStoredDossiers().map((item) => [item.identifiant, item]))
    portfolioRecords.forEach((record) => {
      if (!fullDossiers.has(record.identifiant)) {
        fullDossiers.set(record.identifiant, {
          identifiant: record.identifiant,
          dossier: portfolioRecordToDossier(record),
          portfolioRecord: record,
        })
      } else {
        fullDossiers.get(record.identifiant).portfolioRecord = record
      }
    })
    return [...fullDossiers.values()].sort((a, b) =>
      `${a.portfolioRecord?.nom || ''} ${a.portfolioRecord?.prenom || ''}`.localeCompare(
        `${b.portfolioRecord?.nom || ''} ${b.portfolioRecord?.prenom || ''}`,
        'fr',
      ),
    )
  }, [portfolioRecords])
  const initialDossier = searchParams.get('dossier') || getLastOpenedDossierId() || ''
  const [selectedDossierId, setSelectedDossierId] = useState(initialDossier)
  const [activeView, setActiveView] = useState(
    searchParams.get('q') || searchParams.get('type') ? 'services' : 'work',
  )

  const selectedEntry = dossiers.find((item) => item.identifiant === selectedDossierId)
  const dossier = selectedEntry?.dossier || null
  const recommandations = useMemo(() => dossier ? getRecommandations(dossier) : null, [dossier])
  const recommendedNames = [
    ...(recommandations?.ateliers || []),
    ...(recommandations?.prestations || []),
    selectedEntry?.portfolioRecord?.atelier,
    selectedEntry?.portfolioRecord?.prestation,
  ]
    .filter((value) => value && !['Autres', 'Cat. 1', 'Cat. 2', 'Cat. 3'].includes(value))

  const situationAlerts = useMemo(() => {
    if (!dossier) {
      return [{
        severity: 'error',
        texte: 'Aucun demandeur sélectionné : choisissez un dossier pour afficher les alertes liées à sa situation.',
      }]
    }

    const result = []
    const demande = String(dossier.ceQueDitLaPersonne || dossier.besoinIdentifieConseiller || '').trim()
    const projet = String(dossier.projet || '').trim()
    const freins = Array.isArray(dossier.freinsSelectionnes) ? dossier.freinsSelectionnes : []
    const ressources = Array.isArray(dossier.ressourcesSelectionnees) ? dossier.ressourcesSelectionnees : []
    const urgence = recommandations?.diagnostic?.urgence
    const portfolioRecord = selectedEntry?.portfolioRecord

    if (String(portfolioRecord?.priorite || '').toLowerCase() === 'haute') {
      result.push({ severity: 'error', texte: 'Dossier classé en priorité haute : une action rapide est attendue.' })
    }
    if (String(portfolioRecord?.contratEngagement || '').toLowerCase().includes('signer')) {
      result.push({ severity: 'warning', texte: 'Contrat d’engagement à signer.' })
    }
    if (portfolioRecord?.alerte) {
      result.push({ severity: 'error', texte: `Alerte portefeuille : ${portfolioRecord.alerte}.` })
    }
    if (portfolioRecord?.dateManquement) {
      result.push({ severity: 'error', texte: `Manquement enregistré le ${portfolioRecord.dateManquement}.` })
    }
    if (!demande) result.push({ severity: 'error', texte: 'Demande non renseignée : aucune orientation ne doit être validée.' })
    if (!projet) result.push({ severity: 'warning', texte: 'Projet professionnel à préciser : les solutions proposées restent provisoires.' })
    if (freins.length >= 3) {
      result.push({ severity: 'error', texte: `Vigilance forte : ${freins.length} freins actifs — ${freins.join(', ')}.` })
    } else if (freins.length > 0) {
      result.push({ severity: 'warning', texte: `Frein à sécuriser avant orientation : ${freins.join(', ')}.` })
    }
    if (urgence === 'critique' || urgence === 'haute') {
      result.push({ severity: 'error', texte: `Situation prioritaire : niveau d’urgence ${urgence}. Vérifier la capacité à agir avant toute prescription.` })
    }
    if (ressources.length === 0) {
      result.push({ severity: 'warning', texte: 'Aucune ressource ou point d’appui identifié dans le dossier.' })
    }
    if (result.length === 0) {
      result.push({ severity: 'success', texte: 'Situation sécurisée : aucun point de blocage majeur détecté pour cette orientation.' })
    }
    return result
  }, [dossier, recommandations, selectedEntry])

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImportStatus('Import en cours…')
    try {
      const result = await importPortfolioWorkbook(file)
      setPortfolioVersion((value) => value + 1)
      setImportStatus(
        `${result.total} DE uniques traités : ${result.created} ajouté(s), ${result.updated} mis à jour, `
        + `${result.unchanged} inchangé(s), ${result.duplicatesMerged} doublon(s) fusionné(s).`
        + (result.cloudSynced ? ' Sauvegarde en ligne effectuée.' : ' Sauvegarde locale effectuée ; synchronisation en ligne à reprendre.'),
      )
    } catch (error) {
      setImportStatus(error.message || 'Import impossible.')
    } finally {
      event.target.value = ''
    }
  }

  const alertCounts = situationAlerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1
    return acc
  }, {})

  const analyseIndividuelle = useMemo(() => {
    if (!dossier) return null
    const record = selectedEntry?.portfolioRecord || {}
    const usefulFields = [
      record.priorite,
      record.contratEngagement,
      record.prestation,
      record.atelier,
      record.formation,
      record.echeance,
      record.alerte,
      record.actionRealisee,
      record.historiqueAppels,
      record.historiqueMails,
      record.historiqueEntretiens,
      record.commentaires,
      dossier.projet,
      dossier.besoinIdentifieConseiller,
    ]
    const completeness = Math.round((usefulFields.filter((value) => String(value || '').trim()).length / usefulFields.length) * 100)
    const priorityHigh = String(record.priorite || '').toLowerCase() === 'haute'
    const contractPending = String(record.contratEngagement || '').toLowerCase().includes('signer')
    const hasAlert = Boolean(record.alerte || record.dateManquement)
    const hasAction = Boolean(record.actionRealisee || record.action || record.decision)
    const hasContact = Boolean(record.historiqueEntretiens || record.historiqueAppels || record.historiqueMails)
    const hasProject = Boolean(String(dossier.projet || '').trim())

    const actions = []
    if (contractPending) actions.push('Expliquer puis faire signer le contrat d’engagement.')
    if (hasAlert) actions.push(`Traiter l’alerte ${record.alerte || 'de manquement'} et tracer la décision.`)
    if (priorityHigh) actions.push('Contacter le DE rapidement : dossier classé en priorité haute.')
    if (!hasContact) actions.push('Planifier et tracer un premier contact ou entretien.')
    if (!hasProject) actions.push('Qualifier le projet professionnel, la disponibilité et la capacité à agir.')
    if (!hasAction) actions.push('Définir une prochaine action datée avec le demandeur.')
    if (actions.length === 0) actions.push('Poursuivre le suivi et contrôler l’avancement de l’action engagée.')

    const currentStatus = hasAlert || priorityHigh
      ? 'Intervention prioritaire'
      : contractPending
        ? 'Contractualisation à finaliser'
        : (record.prestation || record.atelier || record.formation)
          ? 'Accompagnement engagé'
          : 'Diagnostic à compléter'

    const lastContact = record.historiqueEntretiens || record.historiqueAppels || record.historiqueMails || 'Aucun contact tracé'
    const engagement = [record.prestation, record.atelier, record.formation]
      .filter((value) => value && value !== 'Autres')
      .join(' · ') || 'Aucune action précise enregistrée'

    return {
      completeness,
      currentStatus,
      lastContact,
      engagement,
      actions: actions.slice(0, 4),
      color: hasAlert || priorityHigh ? '#d32f2f' : contractPending ? '#ed6c02' : '#2e7d32',
      missing: [
        !hasProject && 'projet professionnel',
        !record.telephone && 'téléphone',
        !record.echeance && 'échéance',
        !hasAction && 'action réalisée',
      ].filter(Boolean),
    }
  }, [dossier, selectedEntry])

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1480,
        mx: 'auto',
        px: { xs: 0.5, sm: 1, lg: 1.5 },
        py: 1,
        boxSizing: 'border-box',
      }}
    >
      <Stack spacing={1.25}>
        <Paper
          sx={{
            px: 2,
            py: 1.25,
            color: '#fff',
            background: 'linear-gradient(100deg, #173f67 0%, #1976d2 60%, #00897b 100%)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={1.5}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Tableau de bord Cap Décision FT</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                Sélectionnez un demandeur, puis choisissez la vue utile sans parcourir toute la page.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Autocomplete
                size="small"
                options={dossiers}
                value={dossiers.find((item) => item.identifiant === selectedDossierId) || null}
                onChange={(_, value) => setSelectedDossierId(value?.identifiant || '')}
                getOptionLabel={(item) => {
                  const identity = [item.portfolioRecord?.civilite, item.portfolioRecord?.nom, item.portfolioRecord?.prenom]
                    .filter(Boolean).join(' ')
                  const age = item.portfolioRecord?.age ? ` · ${item.portfolioRecord.age} ans` : ''
                  return `${identity ? `${identity} — ` : ''}${item.identifiant}${age}`
                }}
                isOptionEqualToValue={(option, value) => option.identifiant === value.identifiant}
                renderInput={(params) => <TextField {...params} label={`Demandeur d’emploi (${dossiers.length})`} />}
                sx={{ width: { xs: '100%', sm: 360 }, bgcolor: '#fff', borderRadius: 1 }}
              />
              <input ref={fileInputRef} hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} />
              <Button
                variant="contained"
                color="warning"
                onClick={() => fileInputRef.current?.click()}
                sx={{ whiteSpace: 'nowrap', fontWeight: 800 }}
              >
                Importer un fichier Excel
              </Button>
            </Stack>
          </Stack>
          {importStatus ? (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: '#fff', fontWeight: 700 }}>
              {importStatus}
            </Typography>
          ) : null}
        </Paper>

        <Paper variant="outlined" sx={{ overflow: 'hidden', borderColor: '#a8bfd5' }}>
          <Tabs
            value={activeView}
            onChange={(_, value) => setActiveView(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Vues du tableau de bord"
            sx={{
              minHeight: 44,
              bgcolor: '#f7fafc',
              '& .MuiTab-root': { minHeight: 44, fontWeight: 900, px: { xs: 1.5, sm: 2.5 } },
            }}
          >
            <Tab value="work" label="Travail du jour" />
            <Tab value="services" label="Offre de services" />
            <Tab value="portfolio" label="Gestion et export" />
          </Tabs>
        </Paper>

        {activeView === 'portfolio' ? (
          <PortfolioManagementPanel
            portfolioVersion={portfolioVersion}
            onPortfolioChanged={(identifiant) => {
              setPortfolioVersion((value) => value + 1)
              setSelectedDossierId(identifiant)
            }}
          />
        ) : null}

        {activeView === 'work' ? (
          <>
            <DailyWorkQueue
              dossiers={dossiers}
              selectedDossierId={selectedDossierId}
              onSelect={setSelectedDossierId}
              onOpen={(identifiant) => navigate(`/assistant?dossier=${encodeURIComponent(identifiant)}`)}
            />

            <PrescriptionFollowUp
              dossiers={dossiers}
              onOpen={(identifiant) => navigate(`/assistant?dossier=${encodeURIComponent(identifiant)}`)}
            />

            <Paper
          sx={{
            p: 1.25,
            border: '2px solid',
            borderColor: alertCounts.error ? '#d32f2f' : alertCounts.warning ? '#ed6c02' : '#2e7d32',
            bgcolor: alertCounts.error ? '#fff1f1' : alertCounts.warning ? '#fff8e8' : '#edf8ef',
          }}
        >
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.25} alignItems={{ lg: 'center' }}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 250 }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {alertCounts.error ? '🚨 ALERTE DOSSIER' : alertCounts.warning ? '⚠ VIGILANCE' : '✅ SITUATION SÉCURISÉE'}
              </Typography>
              {selectedDossierId ? <Chip label={`DE ${selectedDossierId}`} color="primary" /> : null}
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={0.75} sx={{ flex: 1 }}>
              {situationAlerts.slice(0, 3).map((alert) => (
                <Alert key={alert.texte} severity={alert.severity} variant="filled" sx={{ flex: 1, py: 0.25, fontWeight: 700 }}>
                  {alert.texte}
                </Alert>
              ))}
            </Stack>
          </Stack>
            </Paper>

            {analyseIndividuelle ? (
              <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderLeft: '9px solid',
              borderLeftColor: analyseIndividuelle.color,
              boxShadow: '0 3px 14px rgba(15,35,65,0.12)',
            }}
          >
            <Stack direction={{ xs: 'column', xl: 'row' }} spacing={1.5}>
              <Box sx={{ minWidth: { xl: 250 } }}>
                <Typography variant="overline" sx={{ color: analyseIndividuelle.color, fontWeight: 900 }}>
                  ANALYSE INDIVIDUELLE DU DE
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>{analyseIndividuelle.currentStatus}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedEntry?.portfolioRecord?.nom} {selectedEntry?.portfolioRecord?.prenom} · {selectedDossierId}
                  {selectedEntry?.portfolioRecord?.age ? ` · ${selectedEntry.portfolioRecord.age} ans` : ''}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>Dossier renseigné</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 900 }}>{analyseIndividuelle.completeness} %</Typography>
                  </Stack>
                  <Box sx={{ height: 10, borderRadius: 5, bgcolor: '#e4e9ef', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${analyseIndividuelle.completeness}%`, bgcolor: analyseIndividuelle.color }} />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ flex: 1, p: 1.25, bgcolor: '#eef5ff', borderRadius: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#174f86' }}>Où en est le DE ?</Typography>
                <Typography variant="body2"><strong>Dernier contact :</strong> {analyseIndividuelle.lastContact}</Typography>
                <Typography variant="body2"><strong>Contrat :</strong> {selectedEntry?.portfolioRecord?.contratEngagement || 'Non renseigné'}</Typography>
                <Typography variant="body2"><strong>Action/parcours :</strong> {analyseIndividuelle.engagement}</Typography>
                {selectedEntry?.portfolioRecord?.commentaires ? (
                  <Typography variant="body2"><strong>Commentaire :</strong> {selectedEntry.portfolioRecord.commentaires}</Typography>
                ) : null}
              </Box>

              <Box sx={{ flex: 1.35, p: 1.25, bgcolor: '#fff7e8', borderRadius: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#9a5200' }}>Ce qu’il faut faire maintenant</Typography>
                {analyseIndividuelle.actions.map((action, index) => (
                  <Typography key={action} variant="body2" sx={{ fontWeight: index === 0 ? 800 : 500 }}>
                    {index + 1}. {action}
                  </Typography>
                ))}
              </Box>

              <Box sx={{ minWidth: { xl: 230 }, p: 1.25, bgcolor: '#f7f8fa', borderRadius: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Informations à compléter</Typography>
                <Typography variant="body2" color={analyseIndividuelle.missing.length ? 'error.main' : 'success.main'}>
                  {analyseIndividuelle.missing.length ? analyseIndividuelle.missing.join(' · ') : 'Données essentielles présentes'}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 1 }}
                  onClick={() => navigate(`/assistant?dossier=${encodeURIComponent(selectedDossierId)}`)}
                >
                  Ouvrir et compléter le dossier
                </Button>
              </Box>
            </Stack>
              </Paper>
            ) : null}
          </>
        ) : null}

        {activeView === 'services' ? (
          <PrescriptionDashboard
            items={offreServiceCorse}
            recommendedNames={recommendedNames}
            alerts={situationAlerts}
            initialSearch={searchParams.get('q') || ''}
            initialType={searchParams.get('type') || 'Tous'}
          />
        ) : null}
      </Stack>
    </Box>
  )
}

export default PrescriptionsPage
