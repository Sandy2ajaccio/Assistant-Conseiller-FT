import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { analyserSituation } from '../services/moteurExpert'
import analyseDiagnostic from '../services/diagnosticService'
import getRecommandations from '../services/recommandationService'
import genererSynthese from '../services/syntheseService'
import genererMAP from '../services/mapService'
import {
  deleteStoredDossier,
  getEntryDossierId,
  listStoredDossiers,
  loadStoredDossier,
  saveStoredDossier,
} from '../services/dossierLoaderService'
import CockpitBadgeGroup from '../components/CockpitBadgeGroup'
import CockpitBlockCard from '../components/CockpitBlockCard'
import CockpitRecommendationCard from '../components/CockpitRecommendationCard'
import PrescriptionDashboard from '../components/PrescriptionDashboard'
import { offreServiceCorse } from '../data/offreServiceCorse'

const ENTRETIEN_TYPES = [
  { value: 'premier-physique', label: 'Premier entretien (60 min)' },
  { value: 'suivi-physique', label: 'Entretien de suivi (30 min)' },
  { value: 'telephonique', label: 'Entretien telephonique (15 a 20 min)' },
]

const DECISION_LABELS = {
  poursuiteAccompagnement: "Poursuite de l'accompagnement",
  prescriptionPrestation: 'Prescription prestation',
  prescriptionAtelier: 'Prescription atelier',
  orientationPartenaire: 'Orientation partenaire',
  entreeFormation: 'Entree en formation',
  demandeAffectation: "Demande d'affectation",
}

const FREINS_OPTIONS = [
  'Mobilite',
  'Sante',
  'Logement',
  "Garde d'enfants",
  'Finances',
  'Administratif',
  'Competences numeriques',
  'Maitrise du francais',
  'Projet professionnel',
  'Confiance en soi',
  'Autre',
]

const RESSOURCES_OPTIONS = [
  'Motivation',
  'Autonomie',
  'Experience',
  'Diplomes',
  'Competences',
  'Disponibilite',
  'Reseau',
  'Autres ressources',
]

const ADVP_STEPS = [
  'Explorer',
  'Cristalliser',
  'Specifier',
  'Realiser',
]

const QUESTIONS_FALLBACK = [
  'Quel est l objectif prioritaire du rendez-vous ?',
  'Quels freins doivent etre traites en priorite ?',
  'Quelle action concrete declencher aujourd hui ?',
]

const CARD_MIN_HEIGHT = 180

const normalizePrescriptionLabel = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()

const findPrescriptionInCatalogue = (suggestion) => {
  const expected = normalizePrescriptionLabel(suggestion.nom)
  const expectedTokens = expected
    .split(' ')
    .filter((token) => token.length >= 3 && !['atelier', 'prestation'].includes(token))

  return offreServiceCorse.find((item) => {
    if (item.type !== suggestion.type) return false
    const candidate = normalizePrescriptionLabel(`${item.code || ''} ${item.nom}`)
    return candidate.includes(expected)
      || expected.includes(candidate)
      || expectedTokens.some((token) => candidate.includes(token))
  }) || null
}

const formatListeCourte = (items) => {
  const values = [...new Set(items.filter(Boolean))]
  if (values.length === 0) return ''
  if (values.length === 1) return values[0]
  if (values.length === 2) return `${values[0]} et ${values[1]}`
  return `${values.slice(0, -1).join(', ')} et ${values[values.length - 1]}`
}

const formatDateFr = (isoLike) => {
  if (!isoLike) return 'Non renseignee'
  const d = new Date(isoLike)
  if (Number.isNaN(d.getTime())) return String(isoLike)
  return d.toLocaleString('fr-FR')
}

function AssistantMissionPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const recognitionRef = useRef(null)

  const [identifiantDemandeur, setIdentifiantDemandeur] = useState('')
  const [typeEntretien, setTypeEntretien] = useState('premier-physique')
  const [situationAdministrative, setSituationAdministrative] = useState('')
  const [situationPersonnelle, setSituationPersonnelle] = useState('')
  const [parcoursProfessionnel, setParcoursProfessionnel] = useState('')
  const [ceQueDitLaPersonne, setCeQueDitLaPersonne] = useState('')
  const [besoinIdentifieConseiller, setBesoinIdentifieConseiller] = useState('')
  const [notes, setNotes] = useState('')
  const [projet, setProjet] = useState('')
  const [formation, setFormation] = useState('')

  const [freinsSelectionnes, setFreinsSelectionnes] = useState([])
  const [ressourcesSelectionnees, setRessourcesSelectionnees] = useState([])

  const [freinsEngine, setFreinsEngine] = useState({ mobilite: false, sante: false, numerique: false })
  const [decisions, setDecisions] = useState({
    poursuiteAccompagnement: false,
    prescriptionPrestation: false,
    prescriptionAtelier: false,
    orientationPartenaire: false,
    entreeFormation: false,
    demandeAffectation: false,
  })

  const [questionIndex, setQuestionIndex] = useState(0)
  const [assistantAnswers, setAssistantAnswers] = useState({})
  const [advpTab, setAdvpTab] = useState(ADVP_STEPS[0])
  const [recommandationTab, setRecommandationTab] = useState('orientation')
  const [advpNotes, setAdvpNotes] = useState(
    ADVP_STEPS.reduce((acc, step) => ({ ...acc, [step]: { questions: '', reponses: '', observations: '' } }), {}),
  )

  const [decisionConseillerStatut, setDecisionConseillerStatut] = useState('Modifiee')
  const [decisionConseillerCommentaire, setDecisionConseillerCommentaire] = useState('')
  const [actionsImmediatesValidees, setActionsImmediatesValidees] = useState([])
  const [chronoSecondes, setChronoSecondes] = useState(0)

  const [diagnosticMetier, setDiagnosticMetier] = useState(null)
  const [recommandationsMetier, setRecommandationsMetier] = useState(null)
  const [syntheseMetier, setSyntheseMetier] = useState(null)
  const [mapMetier, setMapMetier] = useState(null)

  const [isListening, setIsListening] = useState(false)
  const [speechStatus, setSpeechStatus] = useState('')
  const [storageStatus, setStorageStatus] = useState('')
  const [ouvertureDialogOpen, setOuvertureDialogOpen] = useState(false)
  const [analysesEnregistrees, setAnalysesEnregistrees] = useState([])
  const [historiqueEntretiens, setHistoriqueEntretiens] = useState([])
  const [workspaceTab, setWorkspaceTab] = useState('entretien')
  const [copyStatus, setCopyStatus] = useState('')

  const speechSupported = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

  const analyseInput = useMemo(() => {
    const freins = []
    if (freinsEngine.mobilite) freins.push('Mobilite')
    if (freinsEngine.sante) freins.push('Sante')
    if (freinsEngine.numerique) freins.push('Numerique')

    return {
      mission: typeEntretien,
      situation: `${situationAdministrative} ${situationPersonnelle} ${parcoursProfessionnel}`,
      projet,
      formation,
      rechercheEmploi: ceQueDitLaPersonne,
      mobilite: !freinsEngine.mobilite,
      sante: !freinsEngine.sante,
      numerique: !freinsEngine.numerique,
      freins,
      ...decisions,
    }
  }, [
    typeEntretien,
    situationAdministrative,
    situationPersonnelle,
    parcoursProfessionnel,
    projet,
    formation,
    ceQueDitLaPersonne,
    freinsEngine,
    decisions,
  ])

  const analyseMetier = useMemo(() => analyserSituation(analyseInput), [analyseInput])

  const diagnosticMetierCalcule = useMemo(() => analyseDiagnostic(analyseInput), [analyseInput])

  const recommandationsMetierCalculees = useMemo(
    () => getRecommandations({ ...analyseInput, diagnostic: diagnosticMetierCalcule }),
    [analyseInput, diagnosticMetierCalcule],
  )

  const syntheseMetierCalculee = useMemo(
    () => genererSynthese(analyseInput, diagnosticMetierCalcule, recommandationsMetierCalculees),
    [analyseInput, diagnosticMetierCalcule, recommandationsMetierCalculees],
  )

  const mapMetierCalcule = useMemo(
    () => genererMAP(analyseInput, diagnosticMetierCalcule, recommandationsMetierCalculees),
    [analyseInput, diagnosticMetierCalcule, recommandationsMetierCalculees],
  )

  const questionsEntretien = useMemo(() => {
    const fromEngine = Array.isArray(analyseMetier.questions) ? analyseMetier.questions : []
    return Array.from(new Set([...fromEngine, ...QUESTIONS_FALLBACK]))
  }, [analyseMetier.questions])

  const questionCourante = questionsEntretien[questionIndex] || ''

  const capaciteAAgir = useMemo(() => {
    const nbFreins = freinsSelectionnes.length
    const motivation = ressourcesSelectionnees.includes('Motivation')
    const projetRenseigne = Boolean(projet.trim())

    let statut = 'La personne est mobilisee mais necessite un accompagnement.'
    if (nbFreins >= 4) statut = 'Les freins actuels limitent l engagement.'
    else if (!projetRenseigne) statut = 'La capacite a agir est a consolider.'
    else if (motivation && nbFreins <= 1) statut = "La personne est prete a passer a l'action."
    else if (nbFreins >= 2) statut = 'La personne necessite un accompagnement renforce.'

    return {
      statut,
      observations: [
        `Motivation: ${motivation ? 'presente' : 'a confirmer'}`,
        `Projet: ${projetRenseigne ? 'formule et a structurer' : 'a formaliser'}`,
        `Freins: ${nbFreins > 0 ? `${nbFreins} frein(s) actif(s)` : 'freins limites'}`,
        `Autonomie: ${ressourcesSelectionnees.includes('Autonomie') ? 'appui present' : 'appui a renforcer'}`,
        `Mobilite: ${freinsSelectionnes.includes('Mobilite') ? 'a travailler' : 'exploitable'}`,
        `Disponibilite: ${ressourcesSelectionnees.includes('Disponibilite') ? 'identifiee' : 'a confirmer'}`,
      ],
      consequence:
        !projetRenseigne || nbFreins >= 2
          ? 'Il est recommande de consolider la demande et le projet avant une orientation vers une recherche active.'
          : 'Un plan d action operationnel peut etre engage avec un suivi regulier.',
    }
  }, [freinsSelectionnes, ressourcesSelectionnees, projet])

  const capaciteFondSx = useMemo(() => {
    const statut = (capaciteAAgir.statut || '').toLowerCase()
    if (statut.includes('limitent')) {
      return { bgcolor: '#fdecea', borderColor: '#e0b4b4' }
    }
    if (statut.includes('prete')) {
      return { bgcolor: '#edf7ed', borderColor: '#b8d8ba' }
    }
    if (statut.includes('renforce') || statut.includes('consolider')) {
      return { bgcolor: '#fff7e6', borderColor: '#e6cf9e' }
    }
    return { bgcolor: '#eef4fb', borderColor: '#bed3ea' }
  }, [capaciteAAgir.statut])

  const diagnosticRecommandation = useMemo(
    () => ({
      projet: projet.trim(),
      advp: advpTab,
      capaciteAgir: capaciteAAgir.statut,
      freins: freinsSelectionnes,
      ressources: ressourcesSelectionnees,
    }),
    [projet, advpTab, capaciteAAgir.statut, freinsSelectionnes, ressourcesSelectionnees],
  )

  const recommandationsMoteur = useMemo(
    () => getRecommandations(diagnosticRecommandation),
    [diagnosticRecommandation],
  )

  const recommandationsService = useMemo(() => {
    const orientation = recommandationsMoteur.orientation?.principale || 'Orientation a preciser'
    const compatibles = recommandationsMoteur.orientation?.compatibles || []

    return [
      {
        key: 'orientation',
        title: 'Orientation',
        justification: orientation,
        preconisation: compatibles.length > 0
          ? compatibles.map((item) => `${item.situation} (priorite ${item.priorite})`).join(' | ')
          : 'Aucune regle compatible',
      },
      {
        key: 'ateliers',
        title: 'Ateliers',
        justification: (recommandationsMoteur.ateliers || []).join(', ') || 'Aucun atelier propose.',
        preconisation: recommandationsMoteur.ateliers.length > 0
          ? `Proposer: ${recommandationsMoteur.ateliers.join(', ')}`
          : 'Aucun atelier disponible',
      },
      {
        key: 'prestations',
        title: 'Prestations',
        justification: (recommandationsMoteur.prestations || []).join(', ') || 'Aucune prestation proposee.',
        preconisation: recommandationsMoteur.prestations.length > 0
          ? `Prescrire: ${recommandationsMoteur.prestations.join(', ')}`
          : 'Aucune prestation disponible',
      },
      {
        key: 'partenaires',
        title: 'Partenaires',
        justification: (recommandationsMoteur.partenaires || []).join(', ') || 'Aucun partenaire propose.',
        preconisation: recommandationsMoteur.partenaires.length > 0
          ? `Mobiliser: ${recommandationsMoteur.partenaires.join(', ')}`
          : 'Aucun partenaire disponible',
      },
      {
        key: 'formation',
        title: 'Formations',
        justification: (recommandationsMoteur.formations || []).join(', ') || 'Aucune formation proposee.',
        preconisation: recommandationsMoteur.formations.length > 0
          ? `Verifier: ${recommandationsMoteur.formations.join(', ')}`
          : 'Aucune formation disponible',
      },
      {
        key: 'portefeuille',
        title: 'Portefeuille',
        justification: recommandationsMoteur.portefeuille || 'Portefeuille a preciser.',
        preconisation: recommandationsMoteur.portefeuille
          ? `Positionner le portefeuille ${recommandationsMoteur.portefeuille}`
          : 'Aucun portefeuille propose',
      },
      {
        key: 'map',
        title: 'MAP',
        justification: (recommandationsMoteur.map || []).join(', ') || 'Aucune MAP proposee.',
        preconisation: recommandationsMoteur.map.length > 0
          ? `Structurer la MAP autour de ${recommandationsMoteur.map.join(', ')}`
          : 'Aucune MAP disponible',
      },
      {
        key: 'actions',
        title: 'Actions',
        justification: (recommandationsMoteur.actions || []).join(', ') || 'Aucune action proposee.',
        preconisation: recommandationsMoteur.actions.length > 0
          ? `Planifier: ${recommandationsMoteur.actions.join(', ')}`
          : 'Aucune action disponible',
      },
    ]
  }, [recommandationsMoteur])

  const prescriptionsSuggerees = useMemo(() => {
    const suggestions = [
      ...(recommandationsMoteur.ateliers || []).map((nom) => ({ nom, type: 'Atelier' })),
      ...(recommandationsMoteur.prestations || []).map((nom) => ({ nom, type: 'Prestation' })),
    ]

    return suggestions
      .filter((item, index, items) => items.findIndex((candidate) => candidate.nom === item.nom && candidate.type === item.type) === index)
      .slice(0, 3)
  }, [recommandationsMoteur])

  const prescriptionsDetaillees = useMemo(() => {
    const besoinRenseigne = Boolean(ceQueDitLaPersonne.trim() || besoinIdentifieConseiller.trim())
    if (!besoinRenseigne) return []

    return prescriptionsSuggerees.map((suggestion) => {
      const catalogueEntry = findPrescriptionInCatalogue(suggestion)
      return catalogueEntry || {
        id: `suggestion-${suggestion.type}-${suggestion.nom}`,
        nom: suggestion.nom,
        type: suggestion.type,
        public: 'À vérifier',
        objectif: 'Proposition issue du moteur métier selon la situation renseignée.',
        duree: 'À confirmer',
        intervenants: 'À confirmer',
        conditions: "Vérifier l'adéquation avec le besoin et les conditions d'accès.",
        prescription: 'À confirmer dans le référentiel France Travail',
        localisation: 'Corse',
      }
    })
  }, [prescriptionsSuggerees, ceQueDitLaPersonne, besoinIdentifieConseiller])

  const alertesPrescriptions = useMemo(() => {
    const alertes = []
    const besoinRenseigne = Boolean(ceQueDitLaPersonne.trim() || besoinIdentifieConseiller.trim())
    const projetRenseigne = Boolean(projet.trim())

    if (!besoinRenseigne) {
      alertes.push({
        severity: 'error',
        texte: 'Besoin non renseigné : complétez la demande exprimée avant de valider une prescription.',
      })
    }
    if (!projetRenseigne) {
      alertes.push({
        severity: 'warning',
        texte: 'Projet professionnel à préciser : les propositions restent provisoires.',
      })
    }
    if (freinsSelectionnes.length >= 3) {
      alertes.push({
        severity: 'error',
        texte: `${freinsSelectionnes.length} freins sont actifs : vérifiez la capacité à suivre l’action avant prescription.`,
      })
    } else if (freinsSelectionnes.length > 0) {
      alertes.push({
        severity: 'warning',
        texte: `Point de vigilance : ${freinsSelectionnes.join(', ')}.`,
      })
    }
    if (prescriptionsDetaillees.length > 0 && besoinRenseigne) {
      alertes.push({
        severity: 'success',
        texte: `${prescriptionsDetaillees.length} proposition(s) cohérente(s) avec les éléments actuellement renseignés.`,
      })
    }

    return alertes
  }, [
    ceQueDitLaPersonne,
    besoinIdentifieConseiller,
    projet,
    freinsSelectionnes,
    prescriptionsDetaillees,
  ])

  useEffect(() => {
    setDiagnosticMetier(diagnosticMetierCalcule)
    setRecommandationsMetier(recommandationsMetierCalculees)
    setSyntheseMetier(syntheseMetierCalculee)
    setMapMetier(mapMetierCalcule)
  }, [
    diagnosticMetierCalcule,
    recommandationsMetierCalculees,
    syntheseMetierCalculee,
    mapMetierCalcule,
  ])

  const lectureConseiller = useMemo(() => {
    const lignes = []
    lignes.push(
      ressourcesSelectionnees.includes('Motivation')
        ? 'La personne exprime une motivation mobilisable.'
        : 'La motivation reste a travailler.',
    )
    lignes.push(projet.trim() ? 'Le projet commence a se structurer.' : 'Le projet reste a construire.')
    lignes.push(
      freinsSelectionnes.includes('Mobilite')
        ? 'Les freins principaux concernent la mobilite.'
        : 'La mobilite ne bloque pas la dynamique actuelle.',
    )
    lignes.push('Un accompagnement progressif parait adapte.')
    return lignes
  }, [ressourcesSelectionnees, projet, freinsSelectionnes])

  const recommandationActive = useMemo(
    () => recommandationsService.find((item) => item.key === recommandationTab) || recommandationsService[0],
    [recommandationsService, recommandationTab],
  )

  const mapObjectifs = useMemo(() => {
    const objectifPrincipal = recommandationsMoteur.orientation?.principale || 'Structurer un projet professionnel realiste'
    const actions = Array.isArray(recommandationsMoteur.map) ? recommandationsMoteur.map : []

    return {
      objectifs: [objectifPrincipal, recommandationsMoteur.portefeuille ? `Portefeuille: ${recommandationsMoteur.portefeuille}` : 'Portefeuille a preciser'].filter(Boolean),
      etapes: actions.length > 0 ? actions : ['Definir les priorites de mise en oeuvre'],
    }
  }, [recommandationsMoteur])

  const actionsImmediatesActives = useMemo(
    () => recommandationsMoteur.actions || [],
    [recommandationsMoteur],
  )

  const syntheseEntretien = useMemo(() => {
    const paragraphes = []
    const demande = ceQueDitLaPersonne.trim() || besoinIdentifieConseiller.trim()
    const contexte = [situationAdministrative, situationPersonnelle].filter((item) => item.trim()).join(' ')

    paragraphes.push(
      demande
        ? `Vous m'indiquez que ${demande.replace(/[.]+$/, '')}.`
        : "Vous avez été reçu(e) ce jour dans le cadre de votre accompagnement par France Travail.",
    )

    const parcoursEtProjet = [
      parcoursProfessionnel.trim() ? `Votre parcours : ${parcoursProfessionnel.trim().replace(/[.]+$/, '')}.` : '',
      projet.trim() ? `Votre projet est de ${projet.trim().replace(/[.]+$/, '')}.` : 'Votre projet professionnel reste à préciser.',
      contexte ? `Votre situation actuelle : ${contexte.replace(/[.]+$/, '')}.` : '',
    ].filter(Boolean).join(' ')
    paragraphes.push(parcoursEtProjet)

    const constats = []
    if (freinsSelectionnes.length > 0) constats.push(`les freins suivants : ${formatListeCourte(freinsSelectionnes)}`)
    if (ressourcesSelectionnees.length > 0) constats.push(`les points d'appui suivants : ${formatListeCourte(ressourcesSelectionnees)}`)
    if (constats.length > 0) paragraphes.push(`Nous avons identifié ${constats.join(', ainsi que ')}.`)

    const actions = [
      ...actionsImmediatesValidees,
      ...(recommandationsMoteur.ateliers || []).slice(0, 1),
      ...(recommandationsMoteur.prestations || []).slice(0, 1),
      ...(actionsImmediatesActives || []).slice(0, 2),
    ].filter(Boolean).slice(0, 4)
    paragraphes.push(
      actions.length > 0
        ? `Nous convenons de réaliser les actions suivantes : ${formatListeCourte(actions)}.`
        : "Nous convenons de préciser ensemble les prochaines actions de votre accompagnement.",
    )

    const conclusion = "Je vous ai expliqué en quoi consistait le contrat d'engagement, vos obligations et vos devoirs. Nous signons ce jour votre contrat d'engagement."
    paragraphes.push(conclusion)
    return paragraphes.filter(Boolean).join('\n\n')
  }, [
    ceQueDitLaPersonne,
    besoinIdentifieConseiller,
    situationAdministrative,
    situationPersonnelle,
    parcoursProfessionnel,
    projet,
    freinsSelectionnes,
    ressourcesSelectionnees,
    actionsImmediatesValidees,
    actionsImmediatesActives,
    recommandationsMoteur,
  ])

  const dureeRendezVous = useMemo(() => {
    if (typeEntretien === 'premier-physique') return '60 min'
    if (typeEntretien === 'suivi-physique') return '30 min'
    return '15-20 min'
  }, [typeEntretien])

  useEffect(() => {
    const id = setInterval(() => setChronoSecondes((prev) => prev + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const entryId = getEntryDossierId(location.search)
    if (!entryId) return

    const result = loadStoredDossier(entryId)
    if (!result.ok) return

    const dossier = result.dossier || {}
    setIdentifiantDemandeur(entryId)
    setTypeEntretien(dossier.typeEntretien || 'premier-physique')
    setSituationAdministrative(dossier.situationAdministrative || '')
    setSituationPersonnelle(dossier.situationPersonnelle || '')
    setParcoursProfessionnel(dossier.parcoursProfessionnel || '')
    setCeQueDitLaPersonne(dossier.ceQueDitLaPersonne || '')
    setBesoinIdentifieConseiller(dossier.besoinIdentifieConseiller || '')
    setProjet(dossier.projet || '')
    setFormation(dossier.formation || '')
    setNotes(dossier.notes || '')
    setFreinsSelectionnes(Array.isArray(dossier.freinsSelectionnes) ? dossier.freinsSelectionnes : [])
    setRessourcesSelectionnees(Array.isArray(dossier.ressourcesSelectionnees) ? dossier.ressourcesSelectionnees : [])
    setFreinsEngine(dossier.freinsEngine || { mobilite: false, sante: false, numerique: false })
    setDecisions((prev) => ({ ...prev, ...(dossier.decisions || {}) }))
    setHistoriqueEntretiens(Array.isArray(dossier.historiqueEntretiens) ? dossier.historiqueEntretiens : [])
  }, [location.search])

  useEffect(
    () => () => {
      if (recognitionRef.current) recognitionRef.current.stop()
    },
    [],
  )

  const formatChrono = (totalSeconds) => {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
    const seconds = String(totalSeconds % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  const onToggleBadge = (setter) => (label) => {
    setter((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const onToggleFrein = (label) => {
    onToggleBadge(setFreinsSelectionnes)(label)
    if (label === 'Mobilite') setFreinsEngine((prev) => ({ ...prev, mobilite: !prev.mobilite }))
    if (label === 'Sante') setFreinsEngine((prev) => ({ ...prev, sante: !prev.sante }))
    if (label === 'Competences numeriques') setFreinsEngine((prev) => ({ ...prev, numerique: !prev.numerique }))
  }

  const onToggleDecision = (key) => {
    setDecisions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const onActionRecommandation = (key) => {
    if (key === 'orientation' || key === 'portefeuille') {
      setDecisions((prev) => ({ ...prev, poursuiteAccompagnement: true }))
      return
    }

    if (key === 'prestations') {
      setDecisions((prev) => ({ ...prev, prescriptionPrestation: true }))
      return
    }

    if (key === 'ateliers') {
      setDecisions((prev) => ({ ...prev, prescriptionAtelier: true }))
      return
    }

    if (key === 'partenaires' || key === 'iae' || key === 'handicap') {
      setDecisions((prev) => ({ ...prev, orientationPartenaire: true }))
      return
    }

    if (key === 'formation') {
      setDecisions((prev) => ({ ...prev, entreeFormation: true }))
      return
    }

    if (key === 'aides') {
      setDecisions((prev) => ({ ...prev, demandeAffectation: true }))
    }
  }

  const onAssistantAnswer = (question, value) => {
    if (!question) return
    setAssistantAnswers((prev) => ({ ...prev, [question]: value }))
  }

  const onEditAdvp = (step, field, value) => {
    setAdvpNotes((prev) => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: value,
      },
    }))
  }

  const validerActionImmediate = (label) => {
    setActionsImmediatesValidees((prev) => (prev.includes(label) ? prev : [...prev, label]))
  }

  const buildSnapshot = () => ({
    identifiant: identifiantDemandeur,
    typeEntretien,
    situationAdministrative,
    situationPersonnelle,
    parcoursProfessionnel,
    ceQueDitLaPersonne,
    besoinIdentifieConseiller,
    projet,
    formation,
    notes,
    freinsSelectionnes,
    ressourcesSelectionnees,
    freinsEngine,
    decisions,
    assistantAnswers,
    advpNotes,
    actionsImmediatesValidees,
    historiqueEntretiens,
    analyse: analyseMetier,
    diagnosticMetier,
    recommandationsMetier,
    syntheseMetier,
    mapMetier,
    synthese: { contenu: syntheseEntretien },
    dossierStatut: decisionConseillerStatut === 'Acceptee' ? 'termine' : 'brouillon',
  })

  const enregistrerAnalyse = () => {
    const result = saveStoredDossier(identifiantDemandeur, buildSnapshot())
    setStorageStatus(
      result.ok
        ? `Analyse enregistree pour ${identifiantDemandeur}.`
        : result.message || 'Erreur enregistrement.',
    )
  }

  const ouvrirListeAnalyses = () => {
    const items = listStoredDossiers().map((item) => {
      const dossier = item.dossier || {}
      return {
        identifiant: item.identifiant,
        updatedAt: dossier.versionnement?.updatedAt || '',
        statut: dossier.dossierStatut || 'brouillon',
      }
    })
    setAnalysesEnregistrees(items)
    setOuvertureDialogOpen(true)
  }

  const ouvrirAnalyseParIdentifiant = (id) => {
    const result = loadStoredDossier(id)
    if (!result.ok) {
      setStorageStatus(result.message)
      return
    }

    const dossier = result.dossier || {}
    setIdentifiantDemandeur(id)
    setTypeEntretien(dossier.typeEntretien || 'premier-physique')
    setSituationAdministrative(dossier.situationAdministrative || '')
    setSituationPersonnelle(dossier.situationPersonnelle || '')
    setParcoursProfessionnel(dossier.parcoursProfessionnel || '')
    setCeQueDitLaPersonne(dossier.ceQueDitLaPersonne || '')
    setBesoinIdentifieConseiller(dossier.besoinIdentifieConseiller || '')
    setProjet(dossier.projet || '')
    setFormation(dossier.formation || '')
    setNotes(dossier.notes || '')
    setFreinsSelectionnes(Array.isArray(dossier.freinsSelectionnes) ? dossier.freinsSelectionnes : [])
    setRessourcesSelectionnees(Array.isArray(dossier.ressourcesSelectionnees) ? dossier.ressourcesSelectionnees : [])
    setFreinsEngine(dossier.freinsEngine || { mobilite: false, sante: false, numerique: false })
    setDecisions((prev) => ({ ...prev, ...(dossier.decisions || {}) }))
    setHistoriqueEntretiens(Array.isArray(dossier.historiqueEntretiens) ? dossier.historiqueEntretiens : [])
    setOuvertureDialogOpen(false)
    setStorageStatus(`Analyse ${id} chargee.`)
  }

  const supprimerAnalyse = () => {
    const result = deleteStoredDossier(identifiantDemandeur)
    setStorageStatus(result.ok ? 'Analyse supprimee.' : 'Suppression impossible.')
  }

  const dupliquerAnalyse = () => {
    const duplicatedId = `${identifiantDemandeur || 'dossier'}-copie`
    const result = saveStoredDossier(duplicatedId, buildSnapshot())
    setStorageStatus(result.ok ? `Copie creee: ${duplicatedId}` : 'Duplication impossible.')
  }

  const nouveauDossier = () => {
    setIdentifiantDemandeur('')
    setTypeEntretien('premier-physique')
    setSituationAdministrative('')
    setSituationPersonnelle('')
    setParcoursProfessionnel('')
    setCeQueDitLaPersonne('')
    setBesoinIdentifieConseiller('')
    setProjet('')
    setFormation('')
    setNotes('')
    setFreinsSelectionnes([])
    setRessourcesSelectionnees([])
    setFreinsEngine({ mobilite: false, sante: false, numerique: false })
    setDecisions({
      poursuiteAccompagnement: false,
      prescriptionPrestation: false,
      prescriptionAtelier: false,
      orientationPartenaire: false,
      entreeFormation: false,
      demandeAffectation: false,
    })
    setAssistantAnswers({})
    setAdvpNotes(ADVP_STEPS.reduce((acc, step) => ({ ...acc, [step]: { questions: '', reponses: '', observations: '' } }), {}))
    setActionsImmediatesValidees([])
    setHistoriqueEntretiens([])
    setWorkspaceTab('entretien')
    setCopyStatus('')
    setStorageStatus('Nouveau dossier initialise.')
  }

  const ouvrirPrescriptionAdaptee = (type, nom = '') => {
    const params = new URLSearchParams({ type })
    if (nom) params.set('q', nom)
    navigate(`/prescriptions?${params.toString()}`)
  }

  const demarrerDictee = () => {
    if (!speechSupported || isListening) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')

      if (transcript.trim()) {
        setNotes((prev) => `${prev ? `${prev}\n` : ''}${transcript.trim()}`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      setSpeechStatus('Dictee arretee.')
    }

    recognition.onerror = () => {
      setIsListening(false)
      setSpeechStatus('Erreur dictee vocale.')
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    setSpeechStatus('Dictee en cours...')
  }

  const arreterDictee = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }

    setIsListening(false)
    setSpeechStatus('Dictee arretee.')
  }

  const copierSynthese = async () => {
    try {
      await navigator.clipboard.writeText(syntheseEntretien)
      setCopyStatus('Synthèse copiée. Vous pouvez maintenant la coller dans le logiciel France Travail.')
    } catch {
      setCopyStatus('La copie automatique a échoué. Sélectionnez le texte puis utilisez Ctrl + C.')
    }
  }

  const completionSignals = [
    situationAdministrative || situationPersonnelle || parcoursProfessionnel,
    ceQueDitLaPersonne || besoinIdentifieConseiller,
    freinsSelectionnes.length > 0 || ressourcesSelectionnees.length > 0,
    projet,
    decisionConseillerCommentaire,
  ]
  const missionCompletion = Math.round((completionSignals.filter(Boolean).length / completionSignals.length) * 100)

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 'none',
        mx: 0,
        p: { xs: 0.75, md: 1 },
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <Stack spacing={1.5}>
        <CockpitBlockCard
          title="Cockpit Demandeur"
          summarySx={{ minHeight: 42, px: 2 }}
          titleSx={{ fontSize: '1.05rem' }}
          detailsSx={{ px: 2, pt: 0.5, pb: 1.5 }}
        >
          <Grid container spacing={1.5} alignItems="center">
            <Grid size={{ xs: 12, md: 2.5 }}>
              <TextField
                label="Identifiant France Travail"
                value={identifiantDemandeur}
                onChange={(event) => setIdentifiantDemandeur(event.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Type de rendez-vous"
                value={typeEntretien}
                onChange={(event) => setTypeEntretien(event.target.value)}
                fullWidth
                size="small"
              >
                {ENTRETIEN_TYPES.map((item) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="body2" color="text.secondary">Durée</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{dureeRendezVous}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="body2" color="text.secondary">Conseiller référent</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>Conseiller FT</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 2.5 }}>
              <Typography variant="body2" color="text.secondary">Chronomètre</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{formatChrono(chronoSecondes)}</Typography>
            </Grid>
          </Grid>

          <Typography variant="caption" color="text.secondary">
            Dernière actualisation : {formatDateFr(new Date().toISOString())}
          </Typography>
        </CockpitBlockCard>

        <Tabs
          value={workspaceTab}
          onChange={(_, value) => setWorkspaceTab(value)}
          sx={{
            bgcolor: '#fff',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            px: 1,
          }}
        >
          <Tab value="entretien" label="Conduite de l’entretien" />
          <Tab value="prescriptions" label="Offre de services" />
          <Tab value="synthese" label="Synthèse d’entretien" />
        </Tabs>

        {workspaceTab === 'entretien' ? (
          <Paper
            variant="outlined"
            sx={{
              position: 'sticky',
              top: 8,
              zIndex: 5,
              p: 1,
              bgcolor: 'rgba(255,255,255,0.96)',
              boxShadow: '0 4px 16px rgba(15,35,65,0.12)',
              borderColor: '#b9cbe0',
            }}
          >
            <Stack direction={{ xs: 'column', lg: 'row' }} alignItems={{ lg: 'center' }} spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#244d78' }}>Vue entretien 360°</Typography>
              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                <Chip size="small" label="1 · Situation" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 800 }} />
                <Chip size="small" label="2 · Diagnostic" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 800 }} />
                <Chip size="small" label="3 · Accompagnement" sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', fontWeight: 800 }} />
                <Chip size="small" label="4 · Actions" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 800 }} />
              </Stack>
              <Typography variant="caption" sx={{ fontWeight: 800, minWidth: 110 }}>Dossier complété</Typography>
              <Box sx={{ flex: 1, height: 8, borderRadius: 5, bgcolor: '#e3e8ef', overflow: 'hidden' }}>
                <Box sx={{ width: `${missionCompletion}%`, height: '100%', bgcolor: missionCompletion >= 80 ? '#2e7d32' : missionCompletion >= 40 ? '#ed6c02' : '#d32f2f' }} />
              </Box>
              <Chip size="small" color={missionCompletion >= 80 ? 'success' : missionCompletion >= 40 ? 'warning' : 'error'} label={`${missionCompletion} %`} />
            </Stack>
          </Paper>
        ) : null}

        {workspaceTab === 'entretien' ? (
        <CockpitBlockCard
          title="Aide à la décision et prescriptions adaptées"
          subtitle="Ces propositions évoluent automatiquement selon les informations saisies dans l’entretien."
          defaultExpanded={false}
          summarySx={{ minHeight: 42 }}
          detailsSx={{ py: 2 }}
        >
          <Stack direction={{ xs: 'column', xl: 'row' }} spacing={1}>
            {alertesPrescriptions.map((alerte) => (
              <Alert key={`${alerte.severity}-${alerte.texte}`} severity={alerte.severity} variant="outlined" sx={{ flex: 1, py: 0 }}>
                {alerte.texte}
              </Alert>
            ))}
          </Stack>

          {prescriptionsDetaillees.length > 0 ? (
            <Grid container spacing={1.5}>
              {prescriptionsDetaillees.map((item) => (
                <Grid key={item.id} size={{ xs: 12, md: 6, xl: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderLeft: '6px solid',
                      borderLeftColor: item.public === 'À vérifier' ? 'warning.main' : 'success.main',
                      bgcolor: item.public === 'À vérifier' ? '#fffaf0' : '#f4fbf6',
                    }}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Stack spacing={0.75}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                              {item.code ? `${item.code} - ` : ''}{item.nom}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.intervenants}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            color={item.type === 'Atelier' ? 'primary' : 'secondary'}
                            label={item.type}
                          />
                        </Stack>

                        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                          <Chip size="small" variant="outlined" label={item.public} />
                          <Chip size="small" variant="outlined" label={item.duree} />
                        </Stack>

                        <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
                          {item.objectif}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 700 }}>
                          À vérifier : {item.conditions}
                        </Typography>

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => ouvrirPrescriptionAdaptee(item.type, item.nom)}
                        >
                          Détails et sélection
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              Complétez le besoin, le projet et les freins pour obtenir des propositions ciblées.
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" onClick={() => ouvrirPrescriptionAdaptee('Atelier')}>
              Catalogue complet des ateliers
            </Button>
            <Button variant="outlined" onClick={() => ouvrirPrescriptionAdaptee('Prestation')}>
              Catalogue complet des prestations
            </Button>
          </Stack>
        </CockpitBlockCard>
        ) : null}

        {workspaceTab === 'prescriptions' ? (
          <CockpitBlockCard
            title="Tableau de bord de l’offre de services"
            subtitle="Toute l'offre de service, les alertes et les conditions de prescription visibles sur un seul écran."
            detailsSx={{ p: { xs: 1, md: 1.5 } }}
          >
            <PrescriptionDashboard
              items={offreServiceCorse}
              recommendedNames={prescriptionsDetaillees.map((item) => item.nom)}
              alerts={alertesPrescriptions}
            />
          </CockpitBlockCard>
        ) : null}

        {workspaceTab === 'synthese' ? (
          <CockpitBlockCard
            title="Synthèse automatique à destination du demandeur d’emploi"
            subtitle="Le texte se met à jour automatiquement à partir des informations saisies pendant l’entretien."
            sx={{ minHeight: 520 }}
            detailsSx={{ px: { xs: 1.5, md: 3 }, pb: 3 }}
          >
            <Typography variant="body2" color="text.secondary">
              Relisez la synthèse avant son envoi. Elle est rédigée à la deuxième personne et ne remplace pas la validation du conseiller.
            </Typography>
            <TextField
              label="Synthèse prête à copier"
              value={syntheseEntretien}
              fullWidth
              multiline
              minRows={10}
              maxRows={14}
              InputProps={{ readOnly: true }}
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  lineHeight: 1.65,
                },
              }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <Button variant="contained" size="large" onClick={copierSynthese}>
                Copier la synthèse
              </Button>
              <Button variant="outlined" onClick={() => setWorkspaceTab('entretien')}>
                Retour à l’entretien
              </Button>
              {copyStatus ? (
                <Typography variant="body2" color={copyStatus.startsWith('Synthèse copiée') ? 'success.main' : 'warning.main'}>
                  {copyStatus}
                </Typography>
              ) : null}
            </Stack>
          </CockpitBlockCard>
        ) : null}

        <Grid container spacing={1.5} sx={{ display: workspaceTab === 'entretien' ? 'flex' : 'none' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1.5} sx={{ display: { xs: 'flex', xl: 'grid' }, gridTemplateColumns: { xl: '1fr 1fr' }, gap: { xl: 1.5 }, alignItems: 'start' }}>
              <CockpitBlockCard title="1. Analyse de la situation" sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #1976d2' }}>
                  <Accordion disableGutters defaultExpanded={false} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <AccordionSummary sx={{ minHeight: 30, px: 1, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Situation administrative</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 1, pt: 0, pb: 1 }}>
                      <TextField
                        label="Situation administrative"
                        value={situationAdministrative}
                        onChange={(event) => setSituationAdministrative(event.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                        size="small"
                      />
                    </AccordionDetails>
                  </Accordion>
                  <Accordion disableGutters defaultExpanded={false} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <AccordionSummary sx={{ minHeight: 30, px: 1, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Situation personnelle</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 1, pt: 0, pb: 1 }}>
                      <TextField
                        label="Situation personnelle"
                        value={situationPersonnelle}
                        onChange={(event) => setSituationPersonnelle(event.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                        size="small"
                      />
                    </AccordionDetails>
                  </Accordion>
                  <Accordion disableGutters defaultExpanded={false} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <AccordionSummary sx={{ minHeight: 30, px: 1, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Parcours professionnel</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 1, pt: 0, pb: 1 }}>
                      <TextField
                        label="Parcours professionnel"
                        value={parcoursProfessionnel}
                        onChange={(event) => setParcoursProfessionnel(event.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                        size="small"
                      />
                    </AccordionDetails>
                  </Accordion>
                </CockpitBlockCard>

              <CockpitBlockCard title="3. Freins identifiés" sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #ed6c02', bgcolor: '#fffaf2' }}>
                  <CockpitBadgeGroup
                    title="Freins a prendre en compte"
                    options={FREINS_OPTIONS}
                    selected={freinsSelectionnes}
                    onToggle={onToggleFrein}
                  />
              </CockpitBlockCard>

              <CockpitBlockCard title="5. ADVP" sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #7b1fa2' }}>
                  <Tabs
                    value={advpTab}
                    onChange={(_, value) => setAdvpTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ minHeight: 30, '& .MuiTab-root': { minHeight: 30, py: 0 } }}
                  >
                    {ADVP_STEPS.map((step) => (
                      <Tab key={step} value={step} label={step} />
                    ))}
                  </Tabs>
                  <TextField
                    label="Questions conseillees"
                    value={advpNotes[advpTab].questions}
                    onChange={(event) => onEditAdvp(advpTab, 'questions', event.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                  />
                  <TextField
                    label="Reponses importantes"
                    value={advpNotes[advpTab].reponses}
                    onChange={(event) => onEditAdvp(advpTab, 'reponses', event.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                  />
                  <TextField
                    label="Observations"
                    value={advpNotes[advpTab].observations}
                    onChange={(event) => onEditAdvp(advpTab, 'observations', event.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                  />
              </CockpitBlockCard>

              <CockpitBlockCard
                title="7. Lecture du conseiller"
                sx={{ minHeight: CARD_MIN_HEIGHT, bgcolor: '#faf7fc', borderColor: '#d5dde8', borderTop: '5px solid #7b1fa2' }}
                titleSx={{ fontSize: '1rem', fontWeight: 800 }}
              >
                  <Stack spacing={0.25}>
                    {lectureConseiller.map((line) => (
                      <Typography key={line} variant="body2">{line}</Typography>
                    ))}
                  </Stack>
                  <TextField
                    label="Commentaire conseiller"
                    value={decisionConseillerCommentaire}
                    onChange={(event) => setDecisionConseillerCommentaire(event.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                  />
                </CockpitBlockCard>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1.5} sx={{ display: { xs: 'flex', xl: 'grid' }, gridTemplateColumns: { xl: '1fr 1fr' }, gap: { xl: 1.5 }, alignItems: 'start' }}>
              <CockpitBlockCard title="2. Demande exprimée" sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #1976d2' }}>
                  <TextField
                    label="Ce que dit la personne"
                    value={ceQueDitLaPersonne}
                    onChange={(event) => setCeQueDitLaPersonne(event.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                  />
                  <TextField
                    label="Besoin identifie par le conseiller"
                    value={besoinIdentifieConseiller}
                    onChange={(event) => setBesoinIdentifieConseiller(event.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                  />
                </CockpitBlockCard>

              <CockpitBlockCard title="4. Ressources et points d’appui" sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #ed6c02', bgcolor: '#fffaf2' }}>
                  <CockpitBadgeGroup
                    title="Ressources mobilisables"
                    options={RESSOURCES_OPTIONS}
                    selected={ressourcesSelectionnees}
                    onToggle={onToggleBadge(setRessourcesSelectionnees)}
                  />
                </CockpitBlockCard>

              <CockpitBlockCard title="6. Capacité à agir" sx={{ minHeight: CARD_MIN_HEIGHT, ...capaciteFondSx, borderTop: '5px solid #7b1fa2' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{capaciteAAgir.statut}</Typography>
                  <Stack spacing={0.25}>
                    {capaciteAAgir.observations.map((line) => (
                      <Typography key={line} variant="body2">{line}</Typography>
                    ))}
                  </Stack>
                  <Typography variant="body2">Consequence pour l accompagnement: {capaciteAAgir.consequence}</Typography>
                </CockpitBlockCard>

              <CockpitBlockCard title="8. Recommandations" sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #7b1fa2' }}>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    <Chip
                      size="small"
                      color={recommandationsMoteur.niveauConfiance === 'Élevé' ? 'success' : 'warning'}
                      label={`Confiance : ${recommandationsMoteur.niveauConfiance || 'Faible'}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Orientation : ${recommandationsMoteur.orientation?.principale || 'À préciser'}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Portefeuille : ${recommandationsMoteur.portefeuille || 'À préciser'}`}
                    />
                  </Stack>
                  {!ceQueDitLaPersonne.trim() && !besoinIdentifieConseiller.trim() ? (
                    <Alert severity="warning" sx={{ py: 0 }}>
                      Complétez d’abord la demande exprimée pour fiabiliser les recommandations.
                    </Alert>
                  ) : (
                    <Alert severity="success" sx={{ py: 0 }}>
                      Les recommandations ci-dessous tiennent compte du besoin actuellement renseigné.
                    </Alert>
                  )}
                  <Tabs
                    value={recommandationTab}
                    onChange={(_, value) => setRecommandationTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ minHeight: 30, '& .MuiTab-root': { minHeight: 30, py: 0 } }}
                  >
                    {recommandationsService
                      .filter((item) => ['orientation', 'ateliers', 'prestations', 'partenaires', 'formation', 'actions'].includes(item.key))
                      .map((item) => (
                      <Tab key={item.key} value={item.key} label={item.title} />
                    ))}
                  </Tabs>
                  {recommandationActive ? (
                    <CockpitRecommendationCard
                      title={recommandationActive.title}
                      justification={recommandationActive.justification}
                      preconisation={recommandationActive.preconisation}
                      onAction={() => onActionRecommandation(recommandationActive.key)}
                    />
                  ) : null}
                </CockpitBlockCard>
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={1.5} sx={{ display: workspaceTab === 'entretien' ? 'flex' : 'none' }}>
          <Grid size={{ xs: 12, md: 6, xl: 3 }}>
            <CockpitBlockCard title="9. MAP" defaultExpanded={false} sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #2e7d32', bgcolor: '#f4fbf6' }}>
                  <Grid container spacing={1}>
                    <Grid size={12}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>Objectifs</Typography>
                      <Stack spacing={0.15}>
                        {mapObjectifs.objectifs.map((item) => (
                          <Typography key={item} variant="body2">- {item}</Typography>
                        ))}
                      </Stack>
                    </Grid>
                    <Grid size={12}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>Etapes</Typography>
                      <Stack spacing={0.15}>
                        {mapObjectifs.etapes.map((item) => (
                          <Typography key={item} variant="body2">- {item}</Typography>
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                </CockpitBlockCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 3 }}>
            <CockpitBlockCard title="10. Actions immédiates" defaultExpanded={false} sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #2e7d32', bgcolor: '#f4fbf6' }}>
                {actionsImmediatesActives.length === 0 ? (
                  <Typography variant="body2">Toutes les actions immediates sont validees.</Typography>
                ) : (
                  <Stack spacing={0.5}>
                    {actionsImmediatesActives.map((action) => (
                      <Stack key={action} direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Typography variant="body2">□ {action}</Typography>
                        <Button size="small" variant="text" onClick={() => validerActionImmediate(action)}>
                          Valider
                        </Button>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </CockpitBlockCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 3 }}>
            <CockpitBlockCard title="Conduite d’entretien" defaultExpanded={false} sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #2e7d32', bgcolor: '#f4fbf6' }}>
                  <Typography variant="body2">Question en cours: {questionCourante || 'Aucune question'}</Typography>
                  <TextField
                    label="Reponse"
                    value={assistantAnswers[questionCourante] || ''}
                    onChange={(event) => onAssistantAnswer(questionCourante, event.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                  />
                  <TextField
                    label="Notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={questionIndex <= 0}
                      onClick={() => setQuestionIndex((prev) => Math.max(0, prev - 1))}
                    >
                      Precedent
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={questionIndex >= questionsEntretien.length - 1}
                      onClick={() => setQuestionIndex((prev) => Math.min(questionsEntretien.length - 1, prev + 1))}
                    >
                      Suivant
                    </Button>
                    <Button
                      size="small"
                      variant={isListening ? 'contained' : 'outlined'}
                      color={isListening ? 'error' : 'primary'}
                      onClick={isListening ? arreterDictee : demarrerDictee}
                      disabled={!speechSupported}
                    >
                      {isListening ? 'Arreter dictee' : 'Demarrer dictee'}
                    </Button>
                  </Stack>
                </CockpitBlockCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 3 }}>
            <CockpitBlockCard title="Actions du dossier" defaultExpanded={false} sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #2e7d32', bgcolor: '#f4fbf6' }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                    <Button variant="outlined" onClick={nouveauDossier}>Nouveau dossier</Button>
                    <Button variant="outlined" onClick={ouvrirListeAnalyses}>Ouvrir</Button>
                    <Button variant="contained" onClick={enregistrerAnalyse}>Enregistrer</Button>
                    <Button variant="outlined" onClick={dupliquerAnalyse}>Dupliquer</Button>
                    <Button variant="outlined" color="error" onClick={supprimerAnalyse}>Supprimer</Button>
                  </Stack>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {Object.keys(decisions).map((key) => (
                      <Button key={key} size="small" variant={decisions[key] ? 'contained' : 'outlined'} onClick={() => onToggleDecision(key)}>
                        {DECISION_LABELS[key]}
                      </Button>
                    ))}
                  </Stack>
                  <TextField
                    select
                    label="Statut dossier"
                    value={decisionConseillerStatut}
                    onChange={(event) => setDecisionConseillerStatut(event.target.value)}
                    size="small"
                    sx={{ maxWidth: 260 }}
                  >
                    <MenuItem value="Acceptee">Acceptee</MenuItem>
                    <MenuItem value="Refusee">Refusee</MenuItem>
                    <MenuItem value="Modifiee">Modifiee</MenuItem>
                  </TextField>
                </CockpitBlockCard>
          </Grid>
        </Grid>

        {speechStatus ? <Typography variant="caption" color="text.secondary">{speechStatus}</Typography> : null}
        {storageStatus ? <Typography variant="caption" color="text.secondary">{storageStatus}</Typography> : null}

        <Dialog open={ouvertureDialogOpen} onClose={() => setOuvertureDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Analyses enregistrees</DialogTitle>
          <DialogContent dividers>
            {analysesEnregistrees.length > 0 ? (
              <List dense>
                {analysesEnregistrees.map((item) => (
                  <ListItemButton key={item.identifiant} onClick={() => ouvrirAnalyseParIdentifiant(item.identifiant)}>
                    <ListItemText
                      primary={item.identifiant}
                      secondary={`Derniere modification: ${formatDateFr(item.updatedAt)} - Statut: ${item.statut}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Typography variant="body2">Aucune analyse enregistree.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOuvertureDialogOpen(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  )
}

export default AssistantMissionPage
