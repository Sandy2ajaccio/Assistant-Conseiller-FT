import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
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
import { portefeuillesCorse } from '../data/configurationCorse'
import { listPortfolioRecords } from '../services/portfolioImportService'

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

const SITUATION_ADMINISTRATIVE_OPTIONS = [
  'Inscription France Travail active',
  'Actualisation à jour',
  'Contrat d’engagement signé',
  'Contrat d’engagement à signer',
  'Indemnisation ARE',
  'Allocation ASS',
  'Bénéficiaire du RSA',
  'Sans indemnisation',
  'Reconnaissance RQTH',
  'Demande RQTH en cours',
  'Titre de séjour valide',
  'Titre de séjour à renouveler',
  'Permis de conduire',
  'Sans permis de conduire',
  'Manquement ou absence à traiter',
  'Démarche administrative en cours',
]

const SITUATION_PERSONNELLE_OPTIONS = [
  'Logement stable',
  'Difficulté de logement',
  'Mobilité autonome',
  'Difficulté de mobilité',
  'Véhicule disponible',
  'Problématique de santé',
  'Garde d’enfants organisée',
  'Difficulté de garde d’enfants',
  'Difficultés financières',
  'À l’aise avec le numérique',
  'Difficultés numériques',
  'Maîtrise du français',
  'Difficultés avec le français',
  'Disponible immédiatement',
  'Disponibilité restreinte',
  'Soutien familial ou social',
  'Isolement social',
]

const PARCOURS_PROFESSIONNEL_OPTIONS = [
  'Expérience professionnelle significative',
  'Première recherche d’emploi',
  'Sans expérience récente',
  'Compétences transférables identifiées',
  'Diplôme ou certification',
  'Qualification à actualiser',
  'Projet professionnel défini',
  'Projet professionnel à préciser',
  'Projet de reconversion',
  'Projet de création d’entreprise',
  'Recherche active d’emploi',
  'Besoin de travailler le CV',
  'Besoin de préparer les entretiens',
  'Besoin de découvrir les métiers',
  'Besoin d’une immersion professionnelle',
  'Projet de formation',
  'Formation en cours',
  'Reprise d’activité récente',
]

const parseSituationValues = (value) => String(value || '')
  .split(' · ')
  .map((item) => item.trim())
  .filter(Boolean)

const SituationMultiSelect = ({ label, value, onChange, options }) => (
  <Autocomplete
    multiple
    freeSolo
    options={options}
    value={parseSituationValues(value)}
    onChange={(_, nextValue) => onChange(nextValue.join(' · '))}
    filterSelectedOptions
    renderTags={(items, getTagProps) => items.map((item, index) => (
      <Chip
        {...getTagProps({ index })}
        key={item}
        label={item}
        color="primary"
        variant="outlined"
        size="small"
      />
    ))}
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        placeholder="Choisir ou saisir une précision…"
        helperText="Plusieurs choix possibles. Tapez une précision puis appuyez sur Entrée."
        size="small"
      />
    )}
  />
)

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

const STATUTS_PRESCRIPTION = [
  'À prescrire',
  'Prescrit',
  'Convoqué',
  'Commencé',
  'Réalisé',
  'Abandonné',
  'Résultat à analyser',
]

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
  const [modeApprofondi, setModeApprofondi] = useState(false)
  const [actionsRetenues, setActionsRetenues] = useState([])
  const [portefeuilleChoisi, setPortefeuilleChoisi] = useState('')

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

  const analyseDemandeAutomatique = useMemo(() => {
    const texteOriginal = `${ceQueDitLaPersonne} ${besoinIdentifieConseiller}`.trim()
    const texte = texteOriginal
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    const constats = []
    const freinsDetectes = []
    const objectifsDetectes = []

    if (/boulanger|restauration|commerce|batiment|industrie|administr/.test(texte)) {
      constats.push('Une expérience professionnelle exploitable est mentionnée.')
    }
    if (/\d+\s*ans?.*(experience|boulanger|restauration|commerce|batiment|industrie)/.test(texte)) {
      constats.push('Le parcours comporte une expérience longue à valoriser dans le futur projet.')
    }
    if (/rqth|reconnaissance.*handicap|travailleur handicape/.test(texte)) {
      freinsDetectes.push('Santé / RQTH')
      constats.push('La RQTH doit être intégrée au choix du métier, de la formation et des conditions de travail.')
    }
    if (/\brsa\b/.test(texte)) {
      constats.push('La situation RSA nécessite de coordonner les démarches et le contrat d’engagement.')
    }
    if (/enfant|garde|creche/.test(texte)) {
      freinsDetectes.push('Garde d’enfants')
      constats.push('La garde des enfants conditionne la disponibilité.')
    }
    if (/sans vehicule|pas de vehicule|permis|transport|mobilite/.test(texte)) {
      freinsDetectes.push('Mobilité')
      constats.push('La mobilité doit être sécurisée avant une entrée en formation ou en emploi.')
    }
    if (/financ|dette|budget|rsa/.test(texte)) freinsDetectes.push('Finances')
    if (/numerique|ordinateur|internet|informatique|pas d.?aisance.*(informatique|numerique)/.test(texte)) {
      freinsDetectes.push('Compétences numériques')
      constats.push('Les compétences numériques doivent être évaluées avant de demander des démarches autonomes en ligne.')
    }
    if (/pas de cv|sans cv|cv absent|cv non visible/.test(texte)) {
      freinsDetectes.push('Absence de CV')
      objectifsDetectes.push('Créer ou actualiser le CV')
      constats.push('L’absence de CV limite les candidatures et la valorisation de l’expérience.')
    }
    if (/formation|former|reconversion/.test(texte)) {
      objectifsDetectes.push('Formation')
      constats.push('Une demande de formation est exprimée.')
    }
    if (/projet non defini|projet a definir|ne sait pas|hesite|sans projet/.test(texte)) {
      freinsDetectes.push('Projet professionnel')
      objectifsDetectes.push('Clarifier le projet professionnel')
      constats.push('Le projet n’est pas encore défini : une phase d’exploration est prioritaire.')
    }

    return {
      constats: Array.from(new Set(constats)),
      freins: Array.from(new Set(freinsDetectes)),
      objectifs: Array.from(new Set(objectifsDetectes)),
    }
  }, [ceQueDitLaPersonne, besoinIdentifieConseiller])

  const diagnosticAutonome = useMemo(() => {
    const freins = analyseDemandeAutomatique.freins
    const garde = freins.includes('Garde d’enfants')
    const mobilite = freins.includes('Mobilité')
    const rqth = freins.includes('Santé / RQTH')
    const projetFlou = freins.includes('Projet professionnel')

    const priorites = []
    if (garde || mobilite) {
      priorites.push(`Sécuriser les conditions pratiques${garde ? ' de garde' : ''}${garde && mobilite ? ' et' : ''}${mobilite ? ' de mobilité' : ''}.`)
    }
    if (rqth) priorites.push('Vérifier la compatibilité du projet et de la formation avec la RQTH.')
    if (projetFlou) priorites.push('Transformer l’expérience acquise en deux ou trois pistes professionnelles réalistes.')
    if (analyseDemandeAutomatique.objectifs.includes('Formation')) {
      priorites.push('Choisir une formation seulement après validation du métier visé et de sa faisabilité.')
    }

    return {
      conclusion: freins.length >= 3
        ? 'L’entrée immédiate en formation ou en emploi serait prématurée. Les conditions de réussite doivent d’abord être sécurisées.'
        : freins.length > 0
          ? 'Le projet peut avancer à condition de traiter les points de vigilance identifiés.'
          : 'Aucun frein majeur n’est détecté dans le récit actuel ; le plan peut être orienté vers la mise en action.',
      priorites: priorites.slice(0, 3),
    }
  }, [analyseDemandeAutomatique])

  const alertesDiagnosticAutonome = useMemo(() => {
    const freins = analyseDemandeAutomatique.freins
    const alertes = []
    if (freins.includes('Santé / RQTH')) {
      alertes.push({
        severity: 'error',
        texte: 'RQTH : vérifier les restrictions, les besoins d’aménagement et l’appui de Cap emploi avant de valider un métier, une formation ou une prescription.',
      })
    }
    if (freins.includes('Garde d’enfants')) {
      alertes.push({
        severity: 'error',
        texte: 'Garde d’enfants non sécurisée : vérifier les horaires, la solution de garde et la disponibilité réelle avant toute action contraignante.',
      })
    }
    if (freins.includes('Projet professionnel')) {
      alertes.push({
        severity: 'warning',
        texte: 'Projet non défini : privilégier l’exploration, Focus Compétences ou Activ’Projet avant une formation ou une recherche ciblée.',
      })
    }
    if (freins.includes('Absence de CV')) {
      alertes.push({
        severity: 'warning',
        texte: 'CV absent : proposer la création du CV et valoriser les 15 années d’expérience avant les candidatures.',
      })
    }
    if (freins.includes('Compétences numériques')) {
      alertes.push({
        severity: 'warning',
        texte: 'Difficultés numériques : faire réaliser PIX Emploi et prévoir un appui aux démarches depuis l’espace personnel.',
      })
    }
    return alertes
  }, [analyseDemandeAutomatique.freins])

  const capaciteAAgir = useMemo(() => {
    const freinsComplets = Array.from(new Set([...freinsSelectionnes, ...analyseDemandeAutomatique.freins]))
    const nbFreins = freinsComplets.length
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
        `Mobilite: ${freinsComplets.some((item) => item.toLowerCase().includes('mobilit')) ? 'a travailler' : 'exploitable'}`,
        `Disponibilite: ${ressourcesSelectionnees.includes('Disponibilite') ? 'identifiee' : 'a confirmer'}`,
      ],
      consequence:
        !projetRenseigne || nbFreins >= 2
          ? 'Il est recommande de consolider la demande et le projet avant une orientation vers une recherche active.'
          : 'Un plan d action operationnel peut etre engage avec un suivi regulier.',
    }
  }, [
    freinsSelectionnes,
    ressourcesSelectionnees,
    projet,
    parcoursProfessionnel,
    besoinIdentifieConseiller,
    ceQueDitLaPersonne,
    analyseDemandeAutomatique.freins,
  ])

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
      situation: `${situationAdministrative} ${situationPersonnelle} ${parcoursProfessionnel}`.trim(),
      projet: projet.trim() || parcoursProfessionnel.trim() || besoinIdentifieConseiller.trim() || ceQueDitLaPersonne.trim(),
      rechercheEmploi: `${ceQueDitLaPersonne} ${besoinIdentifieConseiller}`.trim(),
      advp: advpTab,
      capaciteAgir: capaciteAAgir.statut,
      freins: Array.from(new Set([...freinsSelectionnes, ...analyseDemandeAutomatique.freins])),
      ressources: ressourcesSelectionnees,
    }),
    [
      situationAdministrative,
      situationPersonnelle,
      parcoursProfessionnel,
      projet,
      besoinIdentifieConseiller,
      ceQueDitLaPersonne,
      advpTab,
      capaciteAAgir.statut,
      freinsSelectionnes,
      ressourcesSelectionnees,
      analyseDemandeAutomatique.freins,
    ],
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
    const contexte = `${ceQueDitLaPersonne} ${besoinIdentifieConseiller} ${situationAdministrative} ${situationPersonnelle} ${parcoursProfessionnel}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    const ateliersInternes = []
    const projetFlou = /projet non defini|projet a definir|ne sait pas|hesite|sans projet|pas d.?objectif/.test(contexte)
    const absenceCv = /pas de cv|sans cv|cv absent|cv non visible/.test(contexte)
    const difficulteNumerique = /numerique|ordinateur|internet|informatique|pas d.?aisance/.test(contexte)
    const entrepreneuriat = /entrepren|creation d.?entreprise|creer.*entreprise|reprendre.*entreprise/.test(contexte)
    const senior = /\b(5[0-9]|6[0-9])\s*ans\b|senior/.test(contexte)

    if (typeEntretien === 'premier-physique' || /contrat|engagement|droit|obligation/.test(contexte)) {
      ateliersInternes.push({ nom: 'Droits et engagements', type: 'Atelier' })
    }
    if (typeEntretien === 'premier-physique' || /offre de service|nouvellement inscrit/.test(contexte)) {
      ateliersInternes.push({ nom: 'Offre de service France Travail', type: 'Atelier' })
    }
    if (/formation|reconversion|financement/.test(contexte)) {
      ateliersInternes.push({ nom: 'Formation et financements', type: 'Atelier' })
    }
    if (/numerique|demarche|organisation|autonomie|espace personnel/.test(contexte)) {
      ateliersInternes.push({ nom: 'Organisation des démarches', type: 'Atelier' })
    }
    if (/marche du travail|secteur|metier|projet/.test(contexte)) {
      ateliersInternes.push({ nom: 'Mon Marché du Travail', type: 'Atelier' })
    }
    if (absenceCv) ateliersInternes.push({ nom: 'CV', type: 'Atelier' })
    if (difficulteNumerique) ateliersInternes.push({ nom: 'PIX Emploi', type: 'Atelier' })
    if (projetFlou) {
      ateliersInternes.push({ nom: 'Focus Compétences', type: 'Atelier' })
      ateliersInternes.push({ nom: "Activ'Projet", type: 'Prestation' })
    }

    const suggestions = [
      ...ateliersInternes,
      ...(recommandationsMoteur.ateliers || []).map((nom) => ({ nom, type: 'Atelier' })),
      ...(recommandationsMoteur.prestations || []).map((nom) => ({ nom, type: 'Prestation' })),
    ]

    return suggestions
      .filter((item) => senior || !/senior\s*360/i.test(item.nom))
      .filter((item) => entrepreneuriat || !/entrepren|lundis/i.test(item.nom))
      .filter((item, index, items) => items.findIndex((candidate) => candidate.nom === item.nom && candidate.type === item.type) === index)
      .slice(0, 8)
  }, [
    recommandationsMoteur,
    typeEntretien,
    ceQueDitLaPersonne,
    besoinIdentifieConseiller,
    situationAdministrative,
    situationPersonnelle,
    parcoursProfessionnel,
  ])

  const prescriptionsDetaillees = useMemo(() => {
    const besoinRenseigne = Boolean(ceQueDitLaPersonne.trim() || besoinIdentifieConseiller.trim())
    if (!besoinRenseigne) return []

    return prescriptionsSuggerees.map((suggestion) => {
      const catalogueEntry = findPrescriptionInCatalogue(suggestion)
      const item = catalogueEntry || {
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
      const descriptionIntervenant = `${item.partenaire || ''} ${item.intervenants || ''}`.toLowerCase()
      return {
        ...item,
        interne: /france travail|conseiller/.test(descriptionIntervenant),
      }
    }).sort((left, right) => Number(right.interne) - Number(left.interne))
  }, [prescriptionsSuggerees, ceQueDitLaPersonne, besoinIdentifieConseiller])

  const actionsDecisionPriorisees = useMemo(() => {
    const prescriptions = prescriptionsDetaillees.slice(0, 8).map((item) => ({
      ...item,
      categorieDecision: item.type,
    }))
    const partenairesRecommandes = [...(recommandationsMoteur.partenaires || [])]
    if (analyseDemandeAutomatique.freins.includes('Santé / RQTH')) partenairesRecommandes.unshift('Cap Emploi')
    const partenaires = partenairesRecommandes.map((nom, index) => ({
      id: `partenaire-${index}-${nom}`,
      nom,
      type: 'Partenaire',
      categorieDecision: 'Partenaire',
      interne: false,
    }))

    return [...prescriptions, ...partenaires]
      .filter((item, index, items) => items.findIndex((candidate) => candidate.nom === item.nom && candidate.categorieDecision === item.categorieDecision) === index)
      .slice(0, 12)
  }, [prescriptionsDetaillees, recommandationsMoteur.partenaires, analyseDemandeAutomatique.freins])

  const toutesActionsDisponibles = useMemo(() => {
    const suggerees = new Set(
      actionsDecisionPriorisees.map((item) => `${item.categorieDecision}|${item.nom}`),
    )
    const catalogue = offreServiceCorse.map((item) => {
      const descriptionIntervenant = `${item.partenaire || ''} ${item.intervenants || ''}`.toLowerCase()
      const interne = /france travail|conseiller/.test(descriptionIntervenant)
      return {
        ...item,
        categorieDecision: item.type,
        interne,
        suggeree: suggerees.has(`${item.type}|${item.nom}`),
      }
    })
    const partenaires = (recommandationsMoteur.partenaires || []).map((nom, index) => ({
      id: `partenaire-catalogue-${index}-${nom}`,
      nom,
      type: 'Partenaire',
      categorieDecision: 'Partenaire',
      interne: false,
      suggeree: true,
      objectif: 'Partenaire proposé selon les besoins identifiés.',
    }))
    return [...catalogue, ...partenaires]
      .filter((item, index, items) => items.findIndex(
        (candidate) => candidate.nom === item.nom && candidate.categorieDecision === item.categorieDecision,
      ) === index)
      .sort((left, right) => {
        if (left.suggeree !== right.suggeree) return Number(right.suggeree) - Number(left.suggeree)
        if (left.interne !== right.interne) return Number(right.interne) - Number(left.interne)
        return left.nom.localeCompare(right.nom, 'fr')
      })
  }, [actionsDecisionPriorisees, recommandationsMoteur.partenaires])

  const portefeuillePropose = useMemo(() => {
    const proposition = `${recommandationsMoteur.portefeuille || ''}`.toLowerCase()
    if (!proposition) return ''
    const direct = portefeuillesCorse.find((item) => item.toLowerCase() === proposition.trim())
    if (direct) return direct
    const correspondances = [
      ['Mutualisé', ['mutual']],
      ['Intensif', ['intensif']],
      ['EM', ['retour rapide', 'emploi']],
      ['SP', ['socio-professionnel', 'socio professionnel']],
      ['GLO', ['global']],
      ['TH', ['travailleur handicape', 'travailleur handicapé', 'handicap']],
      ['PP', ['pre-orientation', 'pré-orientation', 'parcours professionnalise', 'parcours professionnalisé']],
      ['CEJ', ['cej', 'engagement jeune']],
    ]
    return correspondances.find(([, termes]) => termes.some((terme) => proposition.includes(terme)))?.[0] || ''
  }, [recommandationsMoteur.portefeuille])

  const orientationPrioritaire = useMemo(() => {
    if (analyseDemandeAutomatique.freins.includes('Projet professionnel')) return 'Projet à clarifier'
    if (analyseDemandeAutomatique.freins.includes('Santé / RQTH')) return 'Handicap / compensation à sécuriser'
    return recommandationsMoteur.orientation?.principale || 'À préciser'
  }, [analyseDemandeAutomatique.freins, recommandationsMoteur.orientation])

  const explicationsDecision = useMemo(() => {
    const freins = analyseDemandeAutomatique.freins
    const explications = []
    const ajouter = (decision, indices, regle, verification, changement) => {
      explications.push({ decision, indices, regle, verification, changement })
    }

    if (freins.includes('Santé / RQTH')) {
      ajouter(
        'Sécuriser la situation RQTH avant de valider un projet ou une formation',
        ['La RQTH est mentionnée dans le récit.'],
        'Une situation de handicap peut modifier les conditions de travail, les aménagements utiles et la faisabilité d’une formation.',
        'Restrictions, besoins d’aménagement, accord de la personne et pertinence d’un appui Cap emploi.',
        'La proposition pourra être allégée si aucun besoin de compensation ou aucune restriction n’est confirmé.',
      )
    }
    if (freins.includes('Garde d’enfants')) {
      ajouter(
        'Traiter la garde d’enfants comme une priorité pratique',
        ['Des enfants en bas âge et l’absence de solution de garde sont signalés.'],
        'Une prescription avec horaires imposés ne doit pas être retenue sans disponibilité réelle.',
        'Horaires possibles, solution de garde, déplacements et date de disponibilité.',
        'Une action plus contraignante pourra être retenue dès qu’une solution fiable sera confirmée.',
      )
    }
    if (freins.includes('Projet professionnel')) {
      ajouter(
        'Clarifier le projet avant une recherche ciblée ou une formation',
        ['Le récit indique qu’aucun objectif professionnel n’est encore défini.'],
        'Sans métier cible, une formation ou une recherche ciblée risquerait d’être prématurée.',
        'Compétences transférables, contraintes, centres d’intérêt et pistes métiers réalistes.',
        'Une fois deux ou trois pistes validées, le logiciel pourra proposer une action sectorielle ou une formation précise.',
      )
    }
    if (freins.includes('Absence de CV')) {
      ajouter(
        'Créer ou actualiser le CV',
        ['Le récit signale l’absence de CV.', 'Une expérience professionnelle longue est mentionnée.'],
        'Les compétences acquises doivent être rendues visibles avant les candidatures.',
        'Postes occupés, durées, activités, compétences et réalisations.',
        'Cette action sera considérée comme terminée lorsque le CV sera créé et enregistré dans l’espace personnel.',
      )
    }
    if (freins.includes('Compétences numériques')) {
      ajouter(
        'Proposer PIX Emploi et un appui numérique',
        ['Le récit mentionne un manque d’aisance avec l’informatique.'],
        'Les démarches, candidatures et prescriptions nécessitent un niveau minimal d’autonomie numérique.',
        'Accès au compte, messagerie, dépôt de CV et capacité à suivre une action à distance.',
        'L’appui pourra être retiré si l’autonomie numérique est constatée pendant l’entretien.',
      )
    }

    ajouter(
      `Orientation proposée : ${orientationPrioritaire}`,
      analyseDemandeAutomatique.constats.length
        ? analyseDemandeAutomatique.constats.slice(0, 3)
        : ['La proposition repose uniquement sur les informations actuellement saisies.'],
      'Le logiciel classe d’abord les freins bloquants, puis le besoin exprimé et les ressources mobilisables.',
      'Le conseiller doit confirmer les informations avec la personne avant d’enregistrer la décision.',
      'Toute correction du récit, des freins ou des ressources recalcule automatiquement cette proposition.',
    )
    return explications
  }, [analyseDemandeAutomatique, orientationPrioritaire])

  const alertesPrescriptions = useMemo(() => {
    const alertes = []
    const besoinRenseigne = Boolean(ceQueDitLaPersonne.trim() || besoinIdentifieConseiller.trim())
    const projetRenseigne = Boolean(
      projet.trim()
      || parcoursProfessionnel.trim()
      || besoinIdentifieConseiller.trim()
      || ceQueDitLaPersonne.trim(),
    )

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
    parcoursProfessionnel,
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

  const planActionConcret = useMemo(() => {
    const premiereSolution = recommandationsMoteur.ateliers?.[0] || recommandationsMoteur.prestations?.[0]
    const premierFrein = analyseDemandeAutomatique.freins[0] || freinsSelectionnes[0]
    const demande = ceQueDitLaPersonne.trim() || besoinIdentifieConseiller.trim()
    const plusieursFreins = analyseDemandeAutomatique.freins.length >= 2
    const rqthDetectee = analyseDemandeAutomatique.freins.includes('Santé / RQTH')
    const formationDemandee = analyseDemandeAutomatique.objectifs.includes('Formation')

    return [
      {
        quand: 'Aujourd’hui',
        action: plusieursFreins
          ? `Valider l’ordre des priorités : ${analyseDemandeAutomatique.freins.slice(0, 3).join(', ')}.`
          : demande
            ? `Valider avec la personne l’objectif suivant : ${demande.replace(/[.]+$/, '')}.`
          : 'Faire formuler à la personne son objectif prioritaire avec ses propres mots.',
      },
      {
        quand: 'Action à prescrire',
        action: rqthDetectee
          ? 'Vérifier les restrictions, besoins d’aménagement et appuis mobilisables liés à la RQTH avant de retenir un métier ou une formation.'
          : premierFrein
          ? `Traiter en priorité le frein « ${premierFrein} » et noter la solution retenue dans le dossier.`
          : premiereSolution
            ? `Vérifier les conditions d’accès et la disponibilité de « ${premiereSolution} ».`
            : 'Choisir une première action réalisable et fixer son échéance.',
      },
      {
        quand: 'Suivi du dossier',
        action: formationDemandee
          ? 'Comparer les pistes de formation avec le métier visé, les prérequis, le financement, la mobilité et la garde, puis tracer la décision dans le dossier.'
          : premiereSolution
          ? `Tracer la prescription de « ${premiereSolution} » et les éléments permettant d’en vérifier la réalisation.`
          : 'Tracer l’action retenue et la décision d’orientation dans le dossier.',
      },
    ]
  }, [
    recommandationsMoteur.ateliers,
    recommandationsMoteur.prestations,
    freinsSelectionnes,
    analyseDemandeAutomatique.freins,
    analyseDemandeAutomatique.objectifs,
    ceQueDitLaPersonne,
    besoinIdentifieConseiller,
  ])

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
    const freinsSynthese = Array.from(new Set([...freinsSelectionnes, ...analyseDemandeAutomatique.freins]))
    if (freinsSynthese.length > 0) constats.push(`les freins suivants : ${formatListeCourte(freinsSynthese)}`)
    if (ressourcesSelectionnees.length > 0) constats.push(`les points d'appui suivants : ${formatListeCourte(ressourcesSelectionnees)}`)
    if (constats.length > 0) paragraphes.push(`Nous avons identifié ${constats.join(', ainsi que ')}.`)

    const actions = [
      ...actionsImmediatesValidees,
      ...actionsRetenues.map((item) => (
        item.type === 'Partenaire'
          ? `votre orientation vers ${item.nom}`
          : `votre participation à ${item.nom}`
      )),
      ...planActionConcret.slice(0, 1).map((etape) => etape.action),
    ].filter(Boolean).slice(0, 4)
    paragraphes.push(
      actions.length > 0
        ? `Nous convenons de réaliser les actions suivantes : ${formatListeCourte(actions)}.`
        : "Nous convenons de préciser ensemble les prochaines actions de votre accompagnement.",
    )

    paragraphes.push(
      "Je vous invite à réaliser PIX Emploi depuis votre espace personnel France Travail afin d’évaluer vos compétences numériques et d’identifier, si nécessaire, les points à renforcer.",
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
    planActionConcret,
    analyseDemandeAutomatique.freins,
    actionsRetenues,
  ])

  const controleCloture = useMemo(() => [
    { id: 'identifiant', label: 'Identifiant France Travail renseigné', ok: Boolean(identifiantDemandeur.trim()) },
    { id: 'demande', label: 'Demande ou objectif de l’entretien renseigné', ok: Boolean(ceQueDitLaPersonne.trim() || besoinIdentifieConseiller.trim()) },
    { id: 'diagnostic', label: 'Diagnostic et capacité à agir calculés', ok: Boolean(diagnosticAutonome?.conclusion && capaciteAAgir?.statut) },
    { id: 'prescriptions', label: 'Au moins une action ou prescription retenue', ok: actionsRetenues.length > 0 || actionsImmediatesValidees.length > 0 },
    { id: 'portefeuille', label: 'Portefeuille retenu ou affectation demandée', ok: Boolean(portefeuilleChoisi || decisions.demandeAffectation) },
    { id: 'suivi', label: 'État de chaque prescription renseigné', ok: actionsRetenues.every((item) => Boolean(item.suiviStatut || 'À prescrire')) },
    { id: 'synthese', label: 'Synthèse destinée au DE générée', ok: Boolean(syntheseEntretien.trim()) },
  ], [
    identifiantDemandeur,
    ceQueDitLaPersonne,
    besoinIdentifieConseiller,
    diagnosticAutonome,
    capaciteAAgir,
    actionsRetenues,
    actionsImmediatesValidees,
    portefeuilleChoisi,
    decisions.demandeAffectation,
    syntheseEntretien,
  ])

  const dossierPretACloturer = controleCloture.every((item) => item.ok)

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
    setActionsRetenues(
      Array.isArray(dossier.actionsRetenues)
        ? dossier.actionsRetenues
        : dossier.actionRetenue
          ? [{ nom: dossier.actionRetenue, type: 'Atelier' }]
          : [],
    )
    setPortefeuilleChoisi(dossier.portefeuilleChoisi || '')
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
    actionsRetenues,
    portefeuilleChoisi,
    controleCloture,
    clotureValidee: dossierPretACloturer && decisionConseillerStatut === 'Acceptee',
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

  const enregistrerEtPasserAuSuivant = () => {
    const result = saveStoredDossier(identifiantDemandeur, buildSnapshot())
    if (!result.ok) {
      setStorageStatus(result.message || 'Enregistrement impossible.')
      return
    }
    const dossiers = listPortfolioRecords()
    const indexActuel = dossiers.findIndex((item) => item.identifiant === identifiantDemandeur)
    const suivant = indexActuel >= 0 ? dossiers[indexActuel + 1] : dossiers[0]
    if (!suivant) {
      setStorageStatus('Dossier enregistré. Aucun autre DE à ouvrir.')
      navigate('/tableau-de-bord')
      return
    }
    setStorageStatus(`Dossier ${identifiantDemandeur} enregistré. Ouverture de ${suivant.identifiant}.`)
    navigate(`/assistant?dossier=${encodeURIComponent(suivant.identifiant)}`)
  }

  const cloturerEtPasserAuSuivant = () => {
    if (!dossierPretACloturer) {
      setStorageStatus('Clôture impossible : complétez les éléments signalés en rouge.')
      return
    }
    const result = saveStoredDossier(identifiantDemandeur, {
      ...buildSnapshot(),
      clotureValidee: true,
      dossierStatut: 'termine',
    })
    if (!result.ok) {
      setStorageStatus(result.message || 'Clôture impossible.')
      return
    }
    setDecisionConseillerStatut('Acceptee')
    const dossiers = listPortfolioRecords()
    const indexActuel = dossiers.findIndex((item) => item.identifiant === identifiantDemandeur)
    const suivant = indexActuel >= 0 ? dossiers[indexActuel + 1] : dossiers[0]
    if (suivant) navigate(`/assistant?dossier=${encodeURIComponent(suivant.identifiant)}`)
    else navigate('/tableau-de-bord')
  }

  const ouvrirPrescriptionAdaptee = (type, nom = '') => {
    const params = new URLSearchParams({ type })
    if (nom) params.set('q', nom)
    navigate(`/tableau-de-bord?${params.toString()}`)
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
              <Button
                size="small"
                variant="contained"
                onClick={() => setWorkspaceTab('synthese')}
                sx={{ whiteSpace: 'nowrap', fontWeight: 800 }}
              >
                Voir la synthèse
              </Button>
              <Button
                size="small"
                variant={modeApprofondi ? 'contained' : 'outlined'}
                color="secondary"
                onClick={() => setModeApprofondi((value) => !value)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {modeApprofondi ? 'Revenir à l’essentiel' : 'Approfondir si nécessaire'}
              </Button>
            </Stack>
            {!modeApprofondi ? (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                Vue essentielle : renseignez la demande, puis sélectionnez la situation, les freins et les ressources. Le reste est calculé automatiquement.
              </Typography>
            ) : null}
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

        {workspaceTab === 'entretien' && (ceQueDitLaPersonne.trim() || besoinIdentifieConseiller.trim()) ? (
          <CockpitBlockCard
            title="Diagnostic automatique et plan proposé"
            subtitle="Résultat produit à partir du récit saisi. Vous pouvez corriger les informations avec le mode Approfondir."
            sx={{ borderTop: '6px solid #0b6fb8', boxShadow: '0 4px 16px rgba(15,35,65,0.12)' }}
          >
            <Stack spacing={0.65}>
              {alertesDiagnosticAutonome.map((alerte) => (
                <Alert key={alerte.texte} severity={alerte.severity} variant="filled" sx={{ py: 0.25, fontWeight: 800 }}>
                  {alerte.texte}
                </Alert>
              ))}
            </Stack>
            <Grid container spacing={1.25}>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Box sx={{ height: '100%', p: 1.25, bgcolor: '#eef6ff', borderRadius: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#174f86' }}>Diagnostic</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700 }}>
                    {diagnosticAutonome.conclusion}
                  </Typography>
                  <Stack spacing={0.35} sx={{ mt: 0.75 }}>
                    {analyseDemandeAutomatique.constats.map((constat) => (
                      <Typography key={constat} variant="body2">• {constat}</Typography>
                    ))}
                  </Stack>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, lg: 3 }}>
                <Box sx={{ height: '100%', p: 1.25, bgcolor: '#fff8e8', borderRadius: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#8a4b00' }}>Priorités</Typography>
                  <Stack spacing={0.65} sx={{ mt: 0.5 }}>
                    {diagnosticAutonome.priorites.map((priorite, index) => (
                      <Typography key={priorite} variant="body2" sx={{ fontWeight: index === 0 ? 800 : 500 }}>
                        {index + 1}. {priorite}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }}>
                <Box sx={{ height: '100%', p: 1.25, bgcolor: '#f0f8f1', borderRadius: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#256b2b' }}>Plan d’action</Typography>
                  <Stack spacing={0.65} sx={{ mt: 0.5 }}>
                    {planActionConcret.map((etape) => (
                      <Stack key={etape.quand} direction="row" spacing={0.75} alignItems="flex-start">
                        <Chip size="small" color="success" label={etape.quand} sx={{ minWidth: 105, fontWeight: 800 }} />
                        <Typography variant="body2">{etape.action}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
            <Accordion
              defaultExpanded
              disableGutters
              sx={{
                border: '2px solid #174f86',
                borderRadius: '8px !important',
                '&::before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<Typography sx={{ fontWeight: 900 }}>⌄</Typography>}
                sx={{ bgcolor: '#eef6ff', minHeight: 46 }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#174f86' }}>
                    Pourquoi le logiciel propose cette décision ?
                  </Typography>
                  <Typography variant="caption">
                    Explications fondées sur les informations saisies — décision finale à valider par le conseiller.
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1.25 }}>
                <Grid container spacing={1}>
                  {explicationsDecision.map((explication, index) => (
                    <Grid key={`${explication.decision}-${index}`} size={{ xs: 12, lg: 6 }}>
                      <Box sx={{ height: '100%', p: 1.1, border: '1px solid #b8cee4', borderRadius: 1.5, bgcolor: '#fff' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#123f6d' }}>
                          {index + 1}. {explication.decision}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.6, fontWeight: 900 }}>
                          Éléments détectés
                        </Typography>
                        {explication.indices.map((indice) => (
                          <Typography key={indice} variant="body2">• {indice}</Typography>
                        ))}
                        <Typography variant="body2" sx={{ mt: 0.6 }}>
                          <strong>Règle appliquée :</strong> {explication.regle}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.4 }}>
                          <strong>À vérifier :</strong> {explication.verification}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.4, color: '#6b4a00' }}>
                          <strong>Ce qui peut changer la décision :</strong> {explication.changement}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
            <Box sx={{ p: 1.25, bgcolor: '#fff', border: '2px solid #1f7a3f', borderRadius: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1f6b36' }}>
                Décision à enregistrer
              </Typography>
              <Grid container spacing={1.25} alignItems="center" sx={{ mt: 0.25 }}>
                <Grid size={{ xs: 12, lg: 7 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>
                    Prescriptions à retenir — sélection multiple, offre interne prioritaire
                  </Typography>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={toutesActionsDisponibles}
                    value={actionsRetenues}
                    onChange={(_, nouvellesActions) => {
                      setActionsRetenues(nouvellesActions)
                      setDecisions((prev) => ({
                        ...prev,
                        prescriptionAtelier: nouvellesActions.some((item) => item.type === 'Atelier'),
                        prescriptionPrestation: nouvellesActions.some((item) => item.type === 'Prestation'),
                        orientationPartenaire: nouvellesActions.some((item) => item.categorieDecision === 'Partenaire'),
                      }))
                    }}
                    groupBy={(item) => (
                      item.suggeree
                        ? '★ Propositions du logiciel'
                        : item.interne
                          ? 'Offre interne France Travail'
                          : item.categorieDecision === 'Partenaire'
                            ? 'Partenaires'
                            : 'Autres ateliers et prestations'
                    )}
                    getOptionLabel={(item) => item.nom}
                    isOptionEqualToValue={(option, value) => (
                      option.nom === value.nom && option.categorieDecision === (value.categorieDecision || value.type)
                    )}
                    renderOption={(props, item) => (
                      <li {...props} key={`${item.categorieDecision}-${item.id || item.nom}`}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: item.suggeree ? 900 : 600 }}>
                            {item.suggeree ? '★ ' : ''}{item.nom}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.interne ? 'Interne France Travail' : item.categorieDecision} · {item.objectif || item.domaine || 'Prescription disponible'}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    renderTags={(value, getTagProps) => value.map((item, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={`${item.categorieDecision || item.type}-${item.nom}`}
                        color={item.interne ? 'success' : item.categorieDecision === 'Partenaire' ? 'warning' : 'secondary'}
                        label={`${item.interne ? 'Interne' : item.categorieDecision || item.type} · ${item.nom}`}
                      />
                    ))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        sx={{ mt: 0.5 }}
                        label={`${actionsDecisionPriorisees.length} proposition(s) du logiciel — ouvrir la liste complète`}
                        placeholder="Choisir plusieurs ateliers, prestations ou partenaires"
                      />
                    )}
                  />
                  {actionsDecisionPriorisees.length > 0 ? (
                    <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap" sx={{ mt: 0.75 }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, alignSelf: 'center' }}>
                        Proposé :
                      </Typography>
                      {actionsDecisionPriorisees.slice(0, 5).map((item) => {
                        const retenue = actionsRetenues.some(
                          (action) => action.nom === item.nom
                            && (action.categorieDecision || action.type) === item.categorieDecision,
                        )
                        return (
                          <Chip
                            key={`suggestion-${item.categorieDecision}-${item.nom}`}
                            size="small"
                            clickable
                            color={retenue ? 'success' : 'default'}
                            variant={retenue ? 'filled' : 'outlined'}
                            label={`${retenue ? '✓ Retenu' : '＋ Retenir'} · ${item.nom}`}
                            onClick={() => {
                              const option = toutesActionsDisponibles.find(
                                (candidate) => candidate.nom === item.nom
                                  && candidate.categorieDecision === item.categorieDecision,
                              ) || item
                              const nouvellesActions = retenue
                                ? actionsRetenues.filter(
                                  (action) => !(action.nom === item.nom
                                    && (action.categorieDecision || action.type) === item.categorieDecision),
                                )
                                : [...actionsRetenues, option]
                              setActionsRetenues(nouvellesActions)
                              setDecisions((prev) => ({
                                ...prev,
                                prescriptionAtelier: nouvellesActions.some((action) => action.type === 'Atelier'),
                                prescriptionPrestation: nouvellesActions.some((action) => action.type === 'Prestation'),
                                orientationPartenaire: nouvellesActions.some((action) => action.categorieDecision === 'Partenaire'),
                              }))
                            }}
                          />
                        )
                      })}
                    </Stack>
                  ) : null}
                  {actionsRetenues.length > 0 ? (
                    <Stack spacing={0.6} sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 900 }}>
                        Suivi des prescriptions retenues
                      </Typography>
                      {actionsRetenues.map((action, index) => (
                        <Stack
                          key={`suivi-${action.categorieDecision || action.type}-${action.nom}`}
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={0.75}
                          alignItems={{ sm: 'center' }}
                        >
                          <Typography variant="body2" sx={{ flex: 1, fontWeight: 700 }}>
                            {action.nom}
                          </Typography>
                          <TextField
                            select
                            size="small"
                            label="État"
                            value={action.suiviStatut || 'À prescrire'}
                            onChange={(event) => setActionsRetenues((prev) => prev.map((item, itemIndex) => (
                              itemIndex === index ? { ...item, suiviStatut: event.target.value } : item
                            )))}
                            sx={{ minWidth: 180 }}
                          >
                            {STATUTS_PRESCRIPTION.map((statut) => (
                              <MenuItem key={statut} value={statut}>{statut}</MenuItem>
                            ))}
                          </TextField>
                        </Stack>
                      ))}
                    </Stack>
                  ) : null}
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                  {portefeuillePropose ? (
                    <Alert
                      severity="info"
                      action={portefeuilleChoisi !== portefeuillePropose ? (
                        <Button size="small" onClick={() => setPortefeuilleChoisi(portefeuillePropose)}>
                          Retenir
                        </Button>
                      ) : null}
                      sx={{ mb: 0.75, py: 0 }}
                    >
                      Proposition : <strong>{portefeuillePropose}</strong>
                    </Alert>
                  ) : null}
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Portefeuille retenu"
                    value={portefeuilleChoisi}
                    onChange={(event) => setPortefeuilleChoisi(event.target.value)}
                  >
                    {portefeuillesCorse.map((item) => (
                      <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                  <Button
                    fullWidth
                    variant={decisions.demandeAffectation ? 'contained' : 'outlined'}
                    color="warning"
                    onClick={() => setDecisions((prev) => ({ ...prev, demandeAffectation: !prev.demandeAffectation }))}
                  >
                    {decisions.demandeAffectation ? 'Affectation demandée' : 'Demander l’affectation'}
                  </Button>
                </Grid>
              </Grid>
              <Box sx={{ mt: 1.25, p: 1, borderRadius: 1.5, bgcolor: dossierPretACloturer ? '#edf7ed' : '#fff5e6', border: '1px solid', borderColor: dossierPretACloturer ? '#8bc593' : '#efb45d' }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.25} alignItems={{ lg: 'center' }} justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: dossierPretACloturer ? '#1f6b36' : '#9a5100' }}>
                      {dossierPretACloturer ? '✓ Dossier prêt à être clôturé' : 'Contrôle avant clôture'}
                    </Typography>
                    <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                      {controleCloture.map((item) => (
                        <Chip
                          key={item.id}
                          size="small"
                          color={item.ok ? 'success' : 'error'}
                          variant={item.ok ? 'outlined' : 'filled'}
                          label={`${item.ok ? '✓' : 'À compléter'} · ${item.label}`}
                        />
                      ))}
                    </Stack>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.75} sx={{ minWidth: { lg: 420 } }}>
                    <Button variant="outlined" fullWidth onClick={enregistrerAnalyse}>
                      Enregistrer le brouillon
                    </Button>
                    <Button variant="contained" fullWidth onClick={enregistrerEtPasserAuSuivant} disabled={!identifiantDemandeur.trim()}>
                      Enregistrer et DE suivant
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      disabled={!dossierPretACloturer}
                      onClick={cloturerEtPasserAuSuivant}
                    >
                      Clôturer et DE suivant
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </CockpitBlockCard>
        ) : null}

        <Grid container spacing={1.5} sx={{ display: workspaceTab === 'entretien' ? 'flex' : 'none' }}>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: modeApprofondi ? 'block' : 'none' }}>
            <Stack spacing={1.5} sx={{ display: { xs: 'flex', xl: 'grid' }, gridTemplateColumns: { xl: '1fr 1fr' }, gap: { xl: 1.5 }, alignItems: 'start' }}>
              <CockpitBlockCard title="1. Analyse de la situation" sx={{ display: modeApprofondi ? 'flex' : 'none', minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #1976d2' }}>
                  <Accordion disableGutters defaultExpanded={false} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <AccordionSummary sx={{ minHeight: 30, px: 1, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Situation administrative</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 1, pt: 0, pb: 1 }}>
                      <SituationMultiSelect
                        label="Situation administrative"
                        value={situationAdministrative}
                        onChange={setSituationAdministrative}
                        options={SITUATION_ADMINISTRATIVE_OPTIONS}
                      />
                    </AccordionDetails>
                  </Accordion>
                  <Accordion disableGutters defaultExpanded={false} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <AccordionSummary sx={{ minHeight: 30, px: 1, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Situation personnelle</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 1, pt: 0, pb: 1 }}>
                      <SituationMultiSelect
                        label="Situation personnelle"
                        value={situationPersonnelle}
                        onChange={setSituationPersonnelle}
                        options={SITUATION_PERSONNELLE_OPTIONS}
                      />
                    </AccordionDetails>
                  </Accordion>
                  <Accordion disableGutters defaultExpanded={false} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <AccordionSummary sx={{ minHeight: 30, px: 1, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Parcours professionnel</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 1, pt: 0, pb: 1 }}>
                      <SituationMultiSelect
                        label="Parcours professionnel"
                        value={parcoursProfessionnel}
                        onChange={setParcoursProfessionnel}
                        options={PARCOURS_PROFESSIONNEL_OPTIONS}
                      />
                    </AccordionDetails>
                  </Accordion>
                </CockpitBlockCard>

              <CockpitBlockCard title="3. Freins identifiés" sx={{ display: modeApprofondi ? 'flex' : 'none', minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #ed6c02', bgcolor: '#fffaf2' }}>
                  <CockpitBadgeGroup
                    title="Freins a prendre en compte"
                    options={FREINS_OPTIONS}
                    selected={freinsSelectionnes}
                    onToggle={onToggleFrein}
                  />
              </CockpitBlockCard>

              <CockpitBlockCard title="5. ADVP" sx={{ display: modeApprofondi ? 'flex' : 'none', minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #7b1fa2' }}>
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
                sx={{ display: modeApprofondi ? 'flex' : 'none', minHeight: CARD_MIN_HEIGHT, bgcolor: '#faf7fc', borderColor: '#d5dde8', borderTop: '5px solid #7b1fa2' }}
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

          <Grid size={{ xs: 12, md: modeApprofondi ? 6 : 12 }}>
            <Stack spacing={1.5} sx={{ display: { xs: 'flex', xl: 'grid' }, gridTemplateColumns: { xl: modeApprofondi ? '1fr 1fr' : '1fr 1fr 1.25fr' }, gap: { xl: 1.5 }, alignItems: 'start' }}>
              <CockpitBlockCard title="2. Demande exprimée" sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #1976d2' }}>
                  <TextField
                    label="Demande ou objectif du rendez-vous"
                    value={ceQueDitLaPersonne}
                    onChange={(event) => {
                      const nextValue = event.target.value
                      setCeQueDitLaPersonne(nextValue)
                      if (!besoinIdentifieConseiller.trim() || besoinIdentifieConseiller === ceQueDitLaPersonne) {
                        setBesoinIdentifieConseiller(nextValue)
                      }
                    }}
                    fullWidth
                    multiline
                    minRows={3}
                    size="small"
                    helperText={!modeApprofondi ? 'Une seule saisie suffit : le besoin est repris automatiquement.' : ''}
                  />
                  {modeApprofondi ? (
                    <TextField
                      label="Besoin identifié par le conseiller"
                      value={besoinIdentifieConseiller}
                      onChange={(event) => setBesoinIdentifieConseiller(event.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                      size="small"
                    />
                  ) : null}
                </CockpitBlockCard>

              {!modeApprofondi && !ceQueDitLaPersonne.trim() && !besoinIdentifieConseiller.trim() ? (
                <CockpitBlockCard
                  title="Commencez ici"
                  subtitle="Décrivez librement la situation dans la zone de gauche. Le logiciel réalisera ensuite le diagnostic et le plan."
                  sx={{ minHeight: CARD_MIN_HEIGHT, gridColumn: { xl: 'span 2' }, borderTop: '5px solid #0b6fb8', bgcolor: '#eef6ff' }}
                >
                  <Grid container spacing={1}>
                    {[
                      ['1', 'Parcours', 'Expérience, métier exercé, compétences ou diplôme.'],
                      ['2', 'Situation actuelle', 'Emploi, santé, mobilité, garde, finances et disponibilité.'],
                      ['3', 'Objectif', 'Métier, formation ou changement souhaité, même s’il reste imprécis.'],
                    ].map(([numero, titre, texte]) => (
                      <Grid key={numero} size={{ xs: 12, md: 4 }}>
                        <Box sx={{ height: '100%', p: 1.25, bgcolor: '#fff', borderRadius: 1.5, border: '1px solid #bdd5eb' }}>
                          <Chip size="small" color="primary" label={numero} sx={{ mb: 0.5, fontWeight: 900 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{titre}</Typography>
                          <Typography variant="body2" color="text.secondary">{texte}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Alert severity="info" sx={{ py: 0 }}>
                    Aucun formulaire supplémentaire n’est nécessaire pour obtenir une première analyse.
                  </Alert>
                </CockpitBlockCard>
              ) : null}

              <CockpitBlockCard title="4. Ressources et points d’appui" sx={{ display: modeApprofondi ? 'flex' : 'none', minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #ed6c02', bgcolor: '#fffaf2' }}>
                  <CockpitBadgeGroup
                    title="Ressources mobilisables"
                    options={RESSOURCES_OPTIONS}
                    selected={ressourcesSelectionnees}
                    onToggle={onToggleBadge(setRessourcesSelectionnees)}
                  />
                </CockpitBlockCard>

              <CockpitBlockCard title="6. Capacité à agir" sx={{ display: modeApprofondi || ceQueDitLaPersonne.trim() || besoinIdentifieConseiller.trim() ? 'flex' : 'none', minHeight: CARD_MIN_HEIGHT, ...capaciteFondSx, borderTop: '5px solid #7b1fa2' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{capaciteAAgir.statut}</Typography>
                  <Stack spacing={0.25}>
                    {capaciteAAgir.observations.map((line) => (
                      <Typography key={line} variant="body2">{line}</Typography>
                    ))}
                  </Stack>
                  <Typography variant="body2">Consequence pour l accompagnement: {capaciteAAgir.consequence}</Typography>
                </CockpitBlockCard>

              <CockpitBlockCard title="8. Recommandations" sx={{ display: modeApprofondi || ceQueDitLaPersonne.trim() || besoinIdentifieConseiller.trim() ? 'flex' : 'none', minHeight: CARD_MIN_HEIGHT, borderTop: '5px solid #7b1fa2' }}>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    <Chip
                      size="small"
                      color={recommandationsMoteur.niveauConfiance === 'Élevé' ? 'success' : 'warning'}
                      label={`Confiance : ${recommandationsMoteur.niveauConfiance || 'Faible'}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Orientation : ${orientationPrioritaire}`}
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
                      justification={recommandationActive.key === 'orientation'
                        ? `Priorité issue du récit : ${orientationPrioritaire}.`
                        : recommandationActive.justification}
                      preconisation={recommandationActive.key === 'orientation'
                        ? `Sécuriser d’abord : ${diagnosticAutonome.priorites.join(' • ') || orientationPrioritaire}.`
                        : recommandationActive.preconisation}
                      onAction={() => onActionRecommandation(recommandationActive.key)}
                    />
                  ) : null}
                </CockpitBlockCard>
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={1.5} sx={{ display: workspaceTab === 'entretien' && modeApprofondi ? 'flex' : 'none' }}>
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
