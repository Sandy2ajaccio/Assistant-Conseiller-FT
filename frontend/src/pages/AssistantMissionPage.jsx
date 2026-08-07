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
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
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
import OrientationReseauCard from '../components/OrientationReseauCard'
import PortefeuilleMutualiseCard from '../components/PortefeuilleMutualiseCard'
import PrescriptionDashboard from '../components/PrescriptionDashboard'
import SuiviObligationsCard from '../components/SuiviObligationsCard'
import SuiviRemobilisationCard from '../components/SuiviRemobilisationCard'
import { offreServiceCorse } from '../data/offreServiceCorse'
import { analyserAvecReferentielReseauEmploi } from '../data/referentielDiagnosticReseauEmploi'
import { listPortfolioRecords } from '../services/portfolioImportService'
import {
  buildFormalitesSynthese,
  DEFAULT_FORMALITES_ENTRETIEN,
  formalitesEntretienCompletes,
  normalizeFormalitesEntretien,
} from '../services/syntheseFormalitesService'
import {
  DEFAULT_CONTRAT_ENGAGEMENT_DETAILS,
  DEFAULT_ORIENTATION_RESEAU,
  DEFAULT_TYPE_ENTRETIEN,
  ENTRETIEN_TYPES,
  estEntretienOrientation,
  estPremierEntretienAccompagnement,
  getTypeEntretien,
  normaliserContratEngagementDetails,
  normaliserOrientationReseau,
  normaliserTypeEntretien,
  orientationReseauComplete,
} from '../data/contratOrientation'
import {
  DEFAULT_SUIVI_OBLIGATIONS,
  compterAlertesActionnables,
  genererAlertesSuivi,
  normaliserSuiviObligations,
} from '../data/suiviObligations'
import { lireRegionBaremePreferee } from '../data/regionsBareme'
import {
  DEFAULT_SUIVI_PORTEFEUILLE_MUTUALISE,
  NOM_PORTEFEUILLE_MUTUALISE,
  compterAlertesPortefeuilleMutualise,
  getFilePortefeuilleMutualise,
  normaliserSuiviPortefeuilleMutualise,
} from '../data/portefeuilleMutualise'
import {
  CODES_SITUATION_OP2,
  formatCodeSituationOp2,
  normaliserCodeSituationOp2,
} from '../data/codesSituationOp2'
import {
  DEFAULT_SUIVI_REMOBILISATION,
  compterAlertesRemobilisation,
  genererAlertesRemobilisation,
  normaliserSuiviRemobilisation,
} from '../data/suiviRemobilisation'

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

const ENTRETIEN_DRAFT_KEY = 'cap-decision-ft-entretien-en-cours'

const SITUATION_ADMINISTRATIVE_OPTIONS = [
  'Inscription France Travail active',
  'Actualisation à jour',
  'Contrat d’engagement signé',
  'Contrat d’engagement à signer',
  'Indemnisation ARE',
  'Allocation ASS',
  'Bénéficiaire du RSA',
  'BRSA sans orientation enregistrée',
  'Primo-inscrit',
  'Réinscrit après plus de 10 ans',
  'Catégorie 1',
  'Catégorie 2',
  'Catégorie 3',
  'Orientation Collectivité / Conseil départemental',
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
    disableCloseOnSelect
    options={options}
    value={parseSituationValues(value)}
    onChange={(_, nextValue) => onChange(nextValue.join(' · '))}
    limitTags={2}
    renderOption={(props, option, { selected }) => (
      <li {...props} key={option}>
        <Checkbox checked={selected} sx={{ mr: 1, py: 0.25 }} />
        {option}
      </li>
    )}
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

const CARD_MIN_HEIGHT = 128

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

const RESPONSABLES_ACTION = [
  'Personne accompagnée',
  'Conseiller',
  'Conseiller et personne accompagnée',
  'Partenaire',
]

const normaliserSuiviAction = (action = {}) => ({
  ...action,
  suiviStatut: action.suiviStatut || 'À prescrire',
  responsableAction: action.responsableAction || (
    action.categorieDecision === 'Partenaire' || action.type === 'Partenaire'
      ? 'Conseiller'
      : 'Conseiller et personne accompagnée'
  ),
  resultatAttendu: action.resultatAttendu || action.objectif || `Mettre en œuvre l’action « ${action.nom || 'retenue'} ».`,
  echeanceAction: action.echeanceAction || '',
})

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

const reformulerRecitPourDemandeur = (texteSource) => {
  const phrases = String(texteSource || '')
    .trim()
    .split(/[.!?]+/)
    .map((phrase) => phrase.trim())
    .filter(Boolean)

  return phrases.map((phrase) => {
    const phraseNormalisee = phrase
      .replace(/\bRégion\b/g, 'région')
      .replace(/\bde sonder les potentiels\b/gi, "d’évaluer les perspectives d'emploi")
      .replace(/\bsonder les potentiels\b/gi, "évaluer les perspectives d'emploi")
      .replace(/\bau regard de son profil\b/gi, 'au regard de votre profil')
      .replace(/\bet dans cette perspective,\s*souhaite\b/gi, 'et, dans cette perspective, vous souhaitez')
    const debutMinuscule = phraseNormalisee.charAt(0).toLowerCase() + phraseNormalisee.slice(1)
    if (/^\d+\s*ans?\b/i.test(phraseNormalisee)) return `vous disposez de ${debutMinuscule}`
    if (/^ne sait plus/i.test(phraseNormalisee)) return phraseNormalisee.replace(/^ne sait plus/i, 'vous ne savez plus')
    if (/^ne sait pas/i.test(phraseNormalisee)) return phraseNormalisee.replace(/^ne sait pas/i, 'vous ne savez pas')
    if (/^envisage/i.test(phraseNormalisee)) return phraseNormalisee.replace(/^envisage/i, 'vous envisagez')
    if (/^souhaite/i.test(phraseNormalisee)) return phraseNormalisee.replace(/^souhaite/i, 'vous souhaitez')
    if (/^recherche/i.test(phraseNormalisee)) return phraseNormalisee.replace(/^recherche/i, 'vous recherchez')
    if (/^pas de/i.test(phraseNormalisee)) return phraseNormalisee.replace(/^pas de/i, "vous n'avez pas de")
    if (/^sans /i.test(phraseNormalisee)) return `vous êtes ${debutMinuscule}`
    if (/^vous\b/i.test(phraseNormalisee)) return debutMinuscule
    return debutMinuscule
  }).join(', et ')
}

function AssistantMissionPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const recognitionRef = useRef(null)
  const ignorerProchaineSauvegardeRef = useRef(false)
  const chronoDepartRef = useRef(null)
  const chronoBaseSecondesRef = useRef(0)

  const [identifiantDemandeur, setIdentifiantDemandeur] = useState('')
  const [typeEntretien, setTypeEntretien] = useState(DEFAULT_TYPE_ENTRETIEN)
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
  const [formalitesEntretien, setFormalitesEntretien] = useState(DEFAULT_FORMALITES_ENTRETIEN)
  const [contratEngagementDetails, setContratEngagementDetails] = useState(DEFAULT_CONTRAT_ENGAGEMENT_DETAILS)
  const [orientationReseau, setOrientationReseau] = useState(DEFAULT_ORIENTATION_RESEAU)
  const [suiviObligations, setSuiviObligations] = useState(DEFAULT_SUIVI_OBLIGATIONS)
  const [suiviPortefeuilleMutualise, setSuiviPortefeuilleMutualise] = useState(DEFAULT_SUIVI_PORTEFEUILLE_MUTUALISE)
  const [suiviRemobilisation, setSuiviRemobilisation] = useState(DEFAULT_SUIVI_REMOBILISATION)

  const [questionIndex, setQuestionIndex] = useState(0)
  const [assistantAnswers, setAssistantAnswers] = useState({})
  const [questionPrecisions, setQuestionPrecisions] = useState({})
  const [advpTab, setAdvpTab] = useState(ADVP_STEPS[0])
  const [recommandationTab, setRecommandationTab] = useState('orientation')
  const [advpNotes, setAdvpNotes] = useState(
    ADVP_STEPS.reduce((acc, step) => ({ ...acc, [step]: { questions: '', reponses: '', observations: '' } }), {}),
  )

  const [decisionConseillerStatut, setDecisionConseillerStatut] = useState('Modifiee')
  const [decisionConseillerCommentaire, setDecisionConseillerCommentaire] = useState('')
  const [actionsImmediatesValidees, setActionsImmediatesValidees] = useState([])
  const [chronoSecondes, setChronoSecondes] = useState(0)
  const [chronoActif, setChronoActif] = useState(false)

  const [diagnosticMetier, setDiagnosticMetier] = useState(null)
  const [recommandationsMetier, setRecommandationsMetier] = useState(null)
  const [syntheseMetier, setSyntheseMetier] = useState(null)
  const [mapMetier, setMapMetier] = useState(null)

  const [isListening, setIsListening] = useState(false)
  const [speechStatus, setSpeechStatus] = useState('')
  const [storageStatus, setStorageStatus] = useState('')
  const [analysesEnregistrees, setAnalysesEnregistrees] = useState([])
  const [historiqueEntretiens, setHistoriqueEntretiens] = useState([])
  const [workspaceTab, setWorkspaceTab] = useState('entretien')
  const [assistantPhase, setAssistantPhase] = useState('exploration')
  const [copyStatus, setCopyStatus] = useState('')
  const [modeApprofondi, setModeApprofondi] = useState(false)
  const [actionsRetenues, setActionsRetenues] = useState([])
  const [actionsEcartees, setActionsEcartees] = useState([])
  const [classementTab, setClassementTab] = useState('maintenant')
  const [portefeuilleChoisi, setPortefeuilleChoisi] = useState(NOM_PORTEFEUILLE_MUTUALISE)
  const [codeSituationOp2, setCodeSituationOp2] = useState('')
  const [brouillonAutomatiquePret, setBrouillonAutomatiquePret] = useState(false)
  const [brouillonAutomatiqueStatut, setBrouillonAutomatiqueStatut] = useState('')

  const speechSupported = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
  const regionBaremePreferee = useMemo(() => lireRegionBaremePreferee(), [])
  const alertesSuiviObligations = useMemo(
    () => genererAlertesSuivi(suiviObligations, regionBaremePreferee),
    [suiviObligations, regionBaremePreferee],
  )
  const nombreAlertesSuivi = useMemo(
    () => compterAlertesActionnables(suiviObligations, regionBaremePreferee),
    [suiviObligations, regionBaremePreferee],
  )
  const nombreAlertesPortefeuille = useMemo(
    () => compterAlertesPortefeuilleMutualise(suiviPortefeuilleMutualise) + (codeSituationOp2 ? 0 : 1),
    [suiviPortefeuilleMutualise, codeSituationOp2],
  )
  const alertesRemobilisation = useMemo(
    () => genererAlertesRemobilisation(suiviRemobilisation),
    [suiviRemobilisation],
  )
  const nombreAlertesRemobilisation = useMemo(
    () => compterAlertesRemobilisation(suiviRemobilisation),
    [suiviRemobilisation],
  )
  const resumeAlertesEnregistrement = useMemo(() => {
    const alertes = []
    if (nombreAlertesPortefeuille > 0) alertes.push(`${nombreAlertesPortefeuille} portefeuille`)
    if (nombreAlertesSuivi > 0) alertes.push(`${nombreAlertesSuivi} M6`)
    if (nombreAlertesRemobilisation > 0) alertes.push(`${nombreAlertesRemobilisation} CRE`)
    return alertes.length > 0
      ? `${alertes.join(' · ')} alerte(s) à vérifier.`
      : 'Aucune alerte active.'
  }, [nombreAlertesPortefeuille, nombreAlertesSuivi, nombreAlertesRemobilisation])

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

  const reponsesGuideesTexte = useMemo(
    () => Object.entries(assistantAnswers)
      .filter(([, reponse]) => reponse && !['Non', 'Non concerné'].includes(reponse))
      .map(([question, reponse]) => `${question} ${reponse}. ${questionPrecisions[question] || ''}`)
      .join(' '),
    [assistantAnswers, questionPrecisions],
  )

  const analyseReferentielReseauEmploi = useMemo(
    () => analyserAvecReferentielReseauEmploi(
      `${ceQueDitLaPersonne} ${besoinIdentifieConseiller} ${situationAdministrative} ${situationPersonnelle} ${parcoursProfessionnel} ${reponsesGuideesTexte}`,
    ),
    [
      ceQueDitLaPersonne,
      besoinIdentifieConseiller,
      situationAdministrative,
      situationPersonnelle,
      parcoursProfessionnel,
      reponsesGuideesTexte,
    ],
  )

  const questionsEntretien = useMemo(() => {
    const fromEngine = Array.isArray(analyseMetier.questions) ? analyseMetier.questions : []
    return Array.from(new Set([...analyseReferentielReseauEmploi.questions, ...fromEngine, ...QUESTIONS_FALLBACK]))
  }, [analyseMetier.questions, analyseReferentielReseauEmploi.questions])

  const questionCourante = questionsEntretien[questionIndex] || ''
  const questionCouranteOuverte = /^(quel|quelle|quels|quelles|comment|pourquoi|dans quel|dans quelle|decrivez|décrivez|precisez|précisez)/i
    .test(questionCourante.trim())
  const aideQuestionCourante = /métier|secteur|compétence/i.test(questionCourante)
    ? 'Aide : notez les métiers déjà envisagés, les secteurs refusés, les tâches appréciées et les savoir-faire transférables. Si la personne ne sait pas, écrivez « aucune piste à ce stade ».'
    : 'Notez les éléments exprimés par la personne. Si elle ne sait pas répondre, indiquez-le clairement.'

  const analyseDemandeAutomatique = useMemo(() => {
    const texteOriginal = `${ceQueDitLaPersonne} ${besoinIdentifieConseiller} ${situationAdministrative} ${reponsesGuideesTexte}`.trim()
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
    if (/(?:brsa|rsa).{0,30}sans orientation|sans orientation.{0,30}(?:brsa|rsa)/.test(texte)) {
      objectifsDetectes.push('Vérifier l’orientation RSA')
      constats.push('Une situation BRSA sans orientation enregistrée nécessite une vérification de la procédure d’orientation applicable.')
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
    if (/projet non defini|projet a definir|ne sait pas|ne sait plus|hesite|sans projet/.test(texte)) {
      freinsDetectes.push('Projet professionnel')
      objectifsDetectes.push('Clarifier le projet professionnel')
      constats.push('Le projet n’est pas encore défini : une phase d’exploration est prioritaire.')
    }
    if (/immersion|pmsmp|decouvrir.*metier|confirmer.*projet|tester.*metier|tester.*environnement/.test(texte)) {
      objectifsDetectes.push('Immersion professionnelle')
      constats.push('Une immersion peut être étudiée pour découvrir un métier, confirmer le projet ou préparer une mise en relation avec un employeur.')
    }

    return {
      constats: Array.from(new Set(constats)),
      freins: Array.from(new Set(freinsDetectes)),
      objectifs: Array.from(new Set(objectifsDetectes)),
    }
  }, [ceQueDitLaPersonne, besoinIdentifieConseiller, situationAdministrative, reponsesGuideesTexte])

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
        texte: 'Difficultés numériques : proposer l’atelier PIX Emploi à réaliser à domicile afin d’identifier les connaissances informatiques de base de la personne accompagnée.',
      })
    }
    if (analyseDemandeAutomatique.objectifs.includes('Vérifier l’orientation RSA')) {
      alertes.push({
        severity: 'warning',
        texte: 'BRSA sans orientation : vérifier la procédure interne France Travail et l’orientation relevant de la Collectivité avant toute décision. Ne pas déduire l’orientation du seul dossier.',
      })
    }
    return alertes
  }, [analyseDemandeAutomatique.freins, analyseDemandeAutomatique.objectifs])

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
    const propositionIAE = recommandationsMoteur.diagnostic?.propositionIAE

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
        key: 'iae',
        title: 'Insertion par l’activité économique',
        justification: propositionIAE?.pertinente
          ? `Piste IAE à étudier : ${propositionIAE.motifs.join(' ')}`
          : 'Aucun signal suffisant ne justifie une proposition IAE à ce stade.',
        preconisation: propositionIAE?.pertinente
          ? `Structures à examiner selon le secteur et la mobilité : ${propositionIAE.propositions.map((item) => `${item.nom} (${item.activites.join(', ')})`).join(' ; ')}. Éligibilité, postes et circuit à confirmer en interne.`
          : 'Compléter la situation d’emploi et les difficultés d’insertion avant d’étudier cette piste.',
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

  useEffect(() => {
    if (recommandationTab === 'iae' && !recommandationsMoteur.diagnostic?.propositionIAE?.pertinente) {
      setRecommandationTab('orientation')
    }
  }, [recommandationTab, recommandationsMoteur.diagnostic?.propositionIAE?.pertinente])

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
    const rechercheEmploi = /recherche d.?emploi|candidature|retour a l.?emploi|emploi durable|emploi stable|retrouver.*emploi/.test(contexte)
    const mobiliteInternationale = /etranger|international|mobilite internationale|anglais|allemand|espagnol/.test(contexte)
    const immersion = /immersion|pmsmp|decouvrir.*metier|confirmer.*projet|tester.*metier|tester.*environnement|metier en tension/.test(contexte)
    const regardsCroises = /regards? croises?|psychologue du travail|besoin.*reconversion|reconversion.*(?:rsa|deld|senior|50 ans)/.test(contexte)
    const financementFormation = /\baif\b|financement.*formation|formation.*financement|cpf insuffisant|reste a charge|devis.*formation/.test(contexte)
    const pisteIAEPertinente = Boolean(recommandationsMoteur.diagnostic?.propositionIAE?.pertinente)

    if (estPremierEntretienAccompagnement(typeEntretien) || /contrat|engagement|droit|obligation/.test(contexte)) {
      ateliersInternes.push({ nom: 'Droits et engagements', type: 'Atelier' })
    }
    if (estPremierEntretienAccompagnement(typeEntretien) || /offre de service|nouvellement inscrit/.test(contexte)) {
      ateliersInternes.push({ nom: 'Offre de service France Travail', type: 'Atelier' })
    }
    if (/formation|reconversion|financement/.test(contexte)) {
      ateliersInternes.push({ nom: 'Formation et financements', type: 'Atelier' })
    }
    if (financementFormation && !projetFlou) {
      ateliersInternes.push({ nom: 'Aide individuelle à la formation (AIF)', type: 'Prestation' })
    }
    if (/numerique|demarche|organisation|autonomie|espace personnel/.test(contexte)) {
      ateliersInternes.push({ nom: 'Organisation des démarches', type: 'Atelier' })
    }
    if (/marche du travail|secteur|metier|projet/.test(contexte)) {
      ateliersInternes.push({ nom: 'Mon Marché du Travail', type: 'Atelier' })
    }
    if (absenceCv) {
      ateliersInternes.push({ nom: 'CV', type: 'Atelier' })
      ateliersInternes.push({ nom: 'Faire le point sur mes compétences professionnelles et concevoir un CV percutant', type: 'Atelier' })
    }
    if (difficulteNumerique) {
      ateliersInternes.push({ nom: 'PIX Emploi', type: 'Atelier' })
      ateliersInternes.push({ nom: 'Mes démarches en ligne avec France Travail', type: 'Atelier' })
    }
    if (projetFlou) {
      ateliersInternes.push({ nom: 'Focus Compétences', type: 'Atelier' })
      ateliersInternes.push({ nom: 'Construire et affiner mon projet professionnel au regard du marché du travail', type: 'Atelier' })
      ateliersInternes.push({ nom: "Activ'Projet", type: 'Prestation' })
    }
    if (rechercheEmploi) {
      ateliersInternes.push({ nom: 'Organiser et optimiser ma recherche d’emploi', type: 'Atelier' })
      ateliersInternes.push({ nom: 'Un emploi stable', type: 'Prestation' })
    }
    if (mobiliteInternationale) {
      ateliersInternes.push({ nom: 'Réaliser mon CV en langue étrangère', type: 'Atelier' })
      ateliersInternes.push({ nom: 'Activ International', type: 'Prestation' })
    }
    if (immersion) {
      ateliersInternes.push({ nom: 'Immersion professionnelle', type: 'Atelier' })
    }
    if (regardsCroises) {
      ateliersInternes.push({ nom: 'Regards croisés', type: 'Prestation' })
    }
    if (pisteIAEPertinente) {
      ateliersInternes.push({ nom: 'Parcours IAE / SIAE Corse-du-Sud', type: 'Prestation' })
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
      .slice(0, 12)
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

  const actionsClassees = useMemo(() => {
    const freins = analyseDemandeAutomatique.freins
    const projetFlou = freins.includes('Projet professionnel')
    const nombreuxFreins = freins.length >= 3
    const garde = freins.includes('Garde d’enfants')
    const numerique = freins.includes('Compétences numériques')

    return actionsDecisionPriorisees.map((item) => {
      const nom = item.nom.toLowerCase()
      let categorie = item.interne ? 'maintenant' : 'conditions'
      let raison = item.interne
        ? 'Offre interne prioritaire et cohérente avec le besoin détecté.'
        : 'Solution mobilisable après vérification des conditions d’accès.'
      const conditions = []

      if (projetFlou && /formation|emploi stable|recherche emploi/.test(nom)) {
        categorie = 'prematuree'
        raison = 'Le métier cible doit d’abord être clarifié.'
      } else if (nombreuxFreins && /mise en emploi|emploi stable/.test(nom)) {
        categorie = 'prematuree'
        raison = 'Plusieurs freins actifs limitent une mise en emploi directe.'
      } else if (/focus compétences|activ.?projet/.test(nom) && projetFlou) {
        categorie = 'maintenant'
        raison = 'Cette action répond directement au besoin de clarification du projet.'
      } else if (/\bcv\b/.test(nom) && freins.includes('Absence de CV')) {
        categorie = 'maintenant'
        raison = 'Le CV est absent et l’expérience doit être valorisée.'
      } else if (/pix|numérique/.test(nom) && numerique) {
        categorie = 'maintenant'
        raison = 'Une difficulté numérique est détectée.'
      } else if (/cap emploi/.test(nom) && freins.includes('Santé / RQTH')) {
        categorie = 'maintenant'
        raison = 'La RQTH nécessite de vérifier les compensations et appuis mobilisables.'
      }

      if (garde && !/distance|numérique|pix/.test(nom)) conditions.push('Confirmer la solution de garde et les horaires.')
      if (!item.interne) conditions.push('Vérifier l’éligibilité et la disponibilité du partenaire.')
      if (item.conditions) conditions.push(item.conditions)

      return { ...item, categorieClassement: categorie, raisonClassement: raison, conditionsClassement: conditions.slice(0, 2) }
    })
  }, [actionsDecisionPriorisees, analyseDemandeAutomatique.freins])

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
        suiviStatut: 'À prescrire',
        responsableAction: 'Conseiller et personne accompagnée',
        resultatAttendu: item.objectif || '',
        echeanceAction: '',
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
      suiviStatut: 'À prescrire',
      responsableAction: 'Conseiller',
      resultatAttendu: `Obtenir l’appui adapté de ${nom}.`,
      echeanceAction: '',
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

  const orientationPrioritaire = useMemo(() => {
    if (analyseDemandeAutomatique.freins.includes('Projet professionnel')) return 'Projet à clarifier'
    if (analyseDemandeAutomatique.freins.includes('Santé / RQTH')) return 'Handicap / compensation à sécuriser'
    if (recommandationsMoteur.diagnostic?.propositionIAE?.pertinente) return 'Piste IAE à étudier'
    return recommandationsMoteur.orientation?.principale || 'À préciser'
  }, [
    analyseDemandeAutomatique.freins,
    recommandationsMoteur.orientation,
    recommandationsMoteur.diagnostic?.propositionIAE?.pertinente,
  ])

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
        'Proposer l’atelier PIX Emploi à réaliser à domicile',
        ['Le récit mentionne un manque d’aisance avec l’informatique.'],
        'PIX Emploi permet d’identifier les connaissances informatiques de base de la personne accompagnée.',
        'Vérifier que la personne peut accéder à son espace personnel et démarrer l’atelier depuis son domicile.',
        'Un accompagnement au démarrage pourra être ajouté si la personne ne peut pas réaliser seule l’atelier à la maison.',
      )
    }
    if (recommandationsMoteur.diagnostic?.propositionIAE?.pertinente) {
      const pisteIAE = recommandationsMoteur.diagnostic.propositionIAE
      ajouter(
        'Étudier une orientation vers l’insertion par l’activité économique',
        pisteIAE.motifs.slice(0, 4),
        'La piste IAE est une proposition d’accompagnement par le travail, l’encadrement technique et un suivi renforcé ; elle n’est pas une décision automatique.',
        `Éligibilité, absence d’activité incompatible, secteur, mobilité, postes disponibles et circuit interne. Structures suggérées : ${pisteIAE.propositions.map((item) => item.nom).join(', ')}.`,
        'La piste sera retirée si la situation d’emploi ou de retraite la rend incompatible, ou réorientée vers une autre structure selon le secteur et les postes ouverts.',
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
  }, [analyseDemandeAutomatique, orientationPrioritaire, recommandationsMoteur.diagnostic?.propositionIAE])

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
      objectifs: [
        objectifPrincipal,
        codeSituationOp2 ? `Code situation OP2 : ${formatCodeSituationOp2(codeSituationOp2)}` : 'Code situation OP2 à renseigner',
      ],
      etapes: actions.length > 0 ? actions : ['Definir les priorites de mise en oeuvre'],
    }
  }, [recommandationsMoteur, codeSituationOp2])

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
        ? `Vous m’indiquez que ${reformulerRecitPourDemandeur(demande)}.`
        : "Vous avez été reçu(e) ce jour dans le cadre de votre accompagnement par France Travail.",
    )

    const parcoursEtProjet = [
      parcoursProfessionnel.trim() ? `Votre parcours : ${parcoursProfessionnel.trim().replace(/[.]+$/, '')}.` : '',
      projet.trim() ? `Votre projet est de ${projet.trim().replace(/[.]+$/, '')}.` : '',
      contexte ? `Votre situation actuelle : ${contexte.replace(/[.]+$/, '')}.` : '',
    ].filter(Boolean).join(' ')
    if (parcoursEtProjet) paragraphes.push(parcoursEtProjet)

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
          : `votre participation à ${item.nom}${item.echeanceAction ? ` avant le ${new Date(`${item.echeanceAction}T12:00:00`).toLocaleDateString('fr-FR')}` : ''}`
      )),
    ]
      .filter(Boolean)
      .filter((item) => !/pix(?:\s+emploi)?|test pix/i.test(item))
      .filter((item, index, items) => items.indexOf(item) === index)
      .slice(0, 4)
    if (actions.length > 0) {
      paragraphes.push(`Nous convenons de réaliser les actions suivantes : ${formatListeCourte(actions)}.`)
    }

    const texteFormalites = buildFormalitesSynthese(formalitesEntretien)
    if (texteFormalites) paragraphes.push(texteFormalites)

    return paragraphes.filter(Boolean).join('\n')
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
    analyseDemandeAutomatique.freins,
    actionsRetenues,
    formalitesEntretien,
  ])

  const formalitesCompletes = formalitesEntretienCompletes(formalitesEntretien)

  const controleCloture = useMemo(() => [
    { id: 'identifiant', label: 'Identifiant France Travail renseigné', ok: Boolean(identifiantDemandeur.trim()) },
    { id: 'demande', label: 'Demande ou objectif de l’entretien renseigné', ok: Boolean(ceQueDitLaPersonne.trim() || besoinIdentifieConseiller.trim()) },
    { id: 'diagnostic', label: 'Diagnostic et capacité à agir calculés', ok: Boolean(diagnosticAutonome?.conclusion && capaciteAAgir?.statut) },
    { id: 'prescriptions', label: 'Au moins une action ou prescription retenue', ok: actionsRetenues.length > 0 || actionsImmediatesValidees.length > 0 },
    { id: 'portefeuille', label: 'Portefeuille mutualisé confirmé', ok: portefeuilleChoisi === NOM_PORTEFEUILLE_MUTUALISE },
    { id: 'code-op2', label: 'Code situation OP2 renseigné', ok: Boolean(codeSituationOp2) },
    {
      id: 'suivi',
      label: 'Responsable, échéance, état et résultat de chaque prescription renseignés',
      ok: actionsRetenues.every((item) => (
        Boolean(item.suiviStatut)
        && Boolean(item.responsableAction)
        && Boolean(item.resultatAttendu?.trim())
        && (Boolean(item.echeanceAction) || ['Réalisé', 'Abandonné'].includes(item.suiviStatut))
      )),
    },
    { id: 'formalites', label: 'Présence, PIX et contrat d’engagement confirmés', ok: formalitesCompletes },
    {
      id: 'orientation-reseau',
      label: 'Orientation réseau validée par le conseiller pour l’EDO',
      ok: !estEntretienOrientation(typeEntretien) || orientationReseauComplete(orientationReseau),
    },
    {
      id: 'suivi-obligations',
      label: 'Alertes M6 traitées ou aucun fait signalé',
      ok: suiviObligations.fait === 'aucun' || nombreAlertesSuivi === 0,
    },
    {
      id: 'portefeuille-mutualise',
      label: 'File et actions du portefeuille mutualisé traitées',
      ok: nombreAlertesPortefeuille === 0,
    },
    {
      id: 'remobilisation',
      label: 'Faisceau CRE et action de remobilisation documentés si un examen est ouvert',
      ok: !suiviRemobilisation.actif || nombreAlertesRemobilisation === 0,
    },
    { id: 'synthese', label: 'Synthèse destinée à la personne générée', ok: Boolean(syntheseEntretien.trim()) },
  ], [
    identifiantDemandeur,
    ceQueDitLaPersonne,
    besoinIdentifieConseiller,
    diagnosticAutonome,
    capaciteAAgir,
    actionsRetenues,
    actionsImmediatesValidees,
    portefeuilleChoisi,
    codeSituationOp2,
    formalitesCompletes,
    typeEntretien,
    orientationReseau,
    suiviObligations.fait,
    nombreAlertesSuivi,
    nombreAlertesPortefeuille,
    suiviRemobilisation.actif,
    nombreAlertesRemobilisation,
    syntheseEntretien,
  ])

  const dossierPretACloturer = controleCloture.every((item) => item.ok)

  const controleDecision = useMemo(() => {
    const freins = analyseDemandeAutomatique.freins
    const manquants = []
    const contradictions = []
    const vigilances = []
    const confirmations = []
    const texteSituation = [
      ceQueDitLaPersonne,
      besoinIdentifieConseiller,
      situationAdministrative,
      situationPersonnelle,
      parcoursProfessionnel,
      projet,
    ].join(' ').toLowerCase()
    const aujourdHui = new Date()
    aujourdHui.setHours(0, 0, 0, 0)
    const actionCorrespond = (expression) => actionsRetenues.some((item) => expression.test(`${item.nom} ${item.objectif || ''}`))
    const actionsActives = actionsRetenues.filter((item) => !['Réalisé', 'Abandonné'].includes(item.suiviStatut))

    if (!identifiantDemandeur.trim()) manquants.push('Identifiant France Travail')
    if (!ceQueDitLaPersonne.trim() && !besoinIdentifieConseiller.trim()) manquants.push('Demande ou objectif de l’entretien')
    if (ressourcesSelectionnees.length === 0) manquants.push('Au moins un point d’appui à confirmer')
    if (actionsRetenues.length === 0 && actionsImmediatesValidees.length === 0) {
      manquants.push('Au moins une action ou prescription à retenir')
    }
    if (!codeSituationOp2) manquants.push('Code situation OP2 à renseigner')
    if (freins.includes('Santé / RQTH') && !actionCorrespond(/cap emploi|handicap|rqth/i)) {
      vigilances.push('RQTH détectée mais aucun appui handicap ou Cap emploi n’est encore retenu.')
    }
    if (freins.includes('Garde d’enfants') && actionsActives.some((item) => !/distance|en ligne|numérique|pix/i.test(`${item.nom} ${item.conditions || ''}`))) {
      contradictions.push('Une action à horaires ou présence imposés est retenue sans solution de garde confirmée.')
    }
    if (freins.includes('Projet professionnel') && analyseDemandeAutomatique.objectifs.includes('Formation')) {
      contradictions.push('Une formation est envisagée alors que le métier cible n’est pas encore défini.')
    }
    if (freins.length >= 3 && actionsRetenues.some((item) => /emploi stable|recherche emploi|mise en emploi/i.test(item.nom))) {
      contradictions.push('Une mise en emploi directe est retenue alors que plusieurs freins actifs restent à sécuriser.')
    }
    if (freins.includes('Compétences numériques') && !actionCorrespond(/pix|numérique/i)) {
      vigilances.push('Difficulté numérique détectée mais aucune action PIX Emploi ou numérique n’est retenue.')
    }
    if (freins.includes('Absence de CV') && !actionCorrespond(/\bcv\b/i)) {
      vigilances.push('Absence de CV détectée mais aucune action CV n’est retenue.')
    }
    if (
      (freins.includes('Mobilité') || /sans (véhicule|permis|moyen de locomotion)|mobilité/.test(texteSituation))
      && actionsActives.some((item) => !/distance|en ligne|domicile|téléphone|visioconférence|corse/i.test(`${item.duree || ''} ${item.localisation || ''} ${item.conditions || ''}`))
    ) {
      vigilances.push('Mobilité limitée : vérifier le lieu, le déplacement et l’accessibilité de chaque action en présentiel.')
    }
    if (actionsActives.some((item) => !`${item.objectif || item.resultatAttendu || ''}`.trim())) {
      manquants.push('Justification ou résultat attendu de chaque action retenue')
    }
    actionsActives.forEach((item) => {
      if (!item.echeanceAction) {
        manquants.push(`Échéance de l’action « ${item.nom} »`)
        return
      }
      const echeance = new Date(`${item.echeanceAction}T12:00:00`)
      if (!Number.isNaN(echeance.getTime()) && echeance < aujourdHui) {
        contradictions.push(`L’échéance de « ${item.nom} » est dépassée.`)
      }
      if (!Number.isNaN(echeance.getTime()) && (echeance.getTime() - aujourdHui.getTime()) > 366 * 24 * 60 * 60 * 1000) {
        vigilances.push(`L’échéance de « ${item.nom} » dépasse un an : confirmer qu’elle est réaliste.`)
      }
    })
    actionsRetenues.forEach((item) => {
      if (!syntheseEntretien.toLowerCase().includes(item.nom.toLowerCase()) && !/pix emploi/i.test(item.nom)) {
        contradictions.push(`La synthèse ne mentionne pas l’action retenue « ${item.nom} ».`)
      }
    })
    if (actionsRetenues.length > 4) {
      vigilances.push('Plus de quatre actions sont retenues : vérifier que le plan reste priorisé et réalisable.')
    }
    if (nombreAlertesSuivi > 0) {
      vigilances.push(`${nombreAlertesSuivi} alerte(s) M6 restent à traiter dans le suivi des obligations.`)
    }
    if (nombreAlertesPortefeuille > 0) {
      vigilances.push(`${nombreAlertesPortefeuille} action(s) ou alerte(s) restent à traiter dans le portefeuille mutualisé.`)
    }

    if (identifiantDemandeur.trim()) confirmations.push('Identité du dossier renseignée')
    if (actionsRetenues.length > 0) confirmations.push(`${actionsRetenues.length} action(s) retenue(s) et suivie(s)`)
    if (portefeuilleChoisi === NOM_PORTEFEUILLE_MUTUALISE) confirmations.push('Portefeuille mutualisé confirmé')
    if (codeSituationOp2) confirmations.push(`Code situation OP2 : ${formatCodeSituationOp2(codeSituationOp2)}`)
    if (syntheseEntretien.trim()) confirmations.push('Synthèse générée à partir des décisions retenues')

    const bloquants = contradictions.length + manquants.filter((item) => !item.includes('point d’appui')).length
    const niveauRisque = contradictions.length > 0 || freins.length >= 4
      ? 'Élevé'
      : vigilances.length > 0 || freins.length >= 2
        ? 'Modéré'
        : 'Faible'
    const statut = bloquants > 0
      ? 'Décision à différer'
      : vigilances.length > 0
        ? 'Décision possible sous réserve'
        : 'Décision suffisamment sécurisée'
    const prochaineAction = manquants.length > 0
      ? `Compléter : ${manquants[0]}.`
      : contradictions.length > 0
        ? `Lever la contradiction : ${contradictions[0]}`
        : vigilances.length > 0
          ? vigilances[0]
          : actionsRetenues.length > 0
            ? 'Valider la proposition avec la personne puis enregistrer la décision.'
            : 'Retenir au moins une action interne adaptée avant la clôture.'

    const couleur = bloquants > 0 ? 'rouge' : vigilances.length > 0 ? 'orange' : 'vert'

    return { manquants, contradictions, vigilances, confirmations, niveauRisque, statut, prochaineAction, couleur, bloquants }
  }, [
    analyseDemandeAutomatique,
    identifiantDemandeur,
    ceQueDitLaPersonne,
    besoinIdentifieConseiller,
    situationAdministrative,
    situationPersonnelle,
    parcoursProfessionnel,
    projet,
    ressourcesSelectionnees,
    actionsRetenues,
    actionsImmediatesValidees,
    portefeuilleChoisi,
    codeSituationOp2,
    syntheseEntretien,
    nombreAlertesSuivi,
    nombreAlertesPortefeuille,
  ])

  const dossierCoherentEtComplet = dossierPretACloturer && controleDecision.bloquants === 0

  const rendezVousConfig = useMemo(() => getTypeEntretien(typeEntretien), [typeEntretien])
  const dureeRendezVous = rendezVousConfig.duree
  const dureeRendezVousSecondes = rendezVousConfig.secondes
  const chronoRestantSecondes = Math.max(0, dureeRendezVousSecondes - chronoSecondes)
  const chronoDureeAtteinte = chronoRestantSecondes === 0
  const minimumTelephoniqueAtteint = Boolean(rendezVousConfig.minimumRepereMinutes)
    && chronoSecondes >= rendezVousConfig.minimumRepereMinutes * 60

  useEffect(() => {
    if (!chronoActif) return undefined
    const actualiserChrono = () => {
      const depart = chronoDepartRef.current || Date.now()
      const ecoulees = chronoBaseSecondesRef.current + Math.floor((Date.now() - depart) / 1000)
      const nouvellesSecondes = Math.min(dureeRendezVousSecondes, ecoulees)
      setChronoSecondes(nouvellesSecondes)
      if (nouvellesSecondes >= dureeRendezVousSecondes) {
        chronoDepartRef.current = null
        chronoBaseSecondesRef.current = dureeRendezVousSecondes
        setChronoActif(false)
      }
    }
    actualiserChrono()
    const id = window.setInterval(actualiserChrono, 250)
    return () => window.clearInterval(id)
  }, [chronoActif, dureeRendezVousSecondes])

  useEffect(() => {
    if (decisionConseillerStatut === 'Acceptee') {
      chronoDepartRef.current = null
      setChronoActif(false)
    }
  }, [decisionConseillerStatut])

  useEffect(() => {
    const entryId = getEntryDossierId(location.search)
    if (!entryId) return

    const result = loadStoredDossier(entryId)
    if (!result.ok) return

    const dossier = result.dossier || {}
    setIdentifiantDemandeur(entryId)
    setTypeEntretien(normaliserTypeEntretien(dossier.typeEntretien))
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
    setFormalitesEntretien(normalizeFormalitesEntretien(dossier.formalitesEntretien))
    setContratEngagementDetails(normaliserContratEngagementDetails(dossier.contratEngagementDetails))
    setOrientationReseau(normaliserOrientationReseau(dossier.orientationReseau))
    setSuiviObligations(normaliserSuiviObligations(dossier.suiviObligations))
    setSuiviPortefeuilleMutualise(normaliserSuiviPortefeuilleMutualise(dossier.suiviPortefeuilleMutualise))
    setSuiviRemobilisation(normaliserSuiviRemobilisation(dossier.suiviRemobilisation))
    setAssistantAnswers(dossier.assistantAnswers || {})
    setQuestionPrecisions(dossier.questionPrecisions || {})
    setActionsRetenues(
      Array.isArray(dossier.actionsRetenues)
        ? dossier.actionsRetenues.map(normaliserSuiviAction)
        : dossier.actionRetenue
          ? [normaliserSuiviAction({ nom: dossier.actionRetenue, type: 'Atelier' })]
          : [],
    )
    setActionsEcartees(Array.isArray(dossier.actionsEcartees) ? dossier.actionsEcartees : [])
    setClassementTab(dossier.classementTab || 'maintenant')
    setPortefeuilleChoisi(NOM_PORTEFEUILLE_MUTUALISE)
    setCodeSituationOp2(normaliserCodeSituationOp2(dossier.codeSituationOp2 || dossier.portefeuilleChoisi))
    setHistoriqueEntretiens(Array.isArray(dossier.historiqueEntretiens) ? dossier.historiqueEntretiens : [])
    setDecisionConseillerStatut(dossier.decisionConseillerStatut || 'Modifiee')
    setDecisionConseillerCommentaire(dossier.decisionConseillerCommentaire || '')
    setChronoSecondes(Number(dossier.chronoSecondes) || 0)
    setChronoActif(false)
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

  const changerTypeEntretien = (event) => {
    setTypeEntretien(normaliserTypeEntretien(event.target.value))
    chronoDepartRef.current = null
    chronoBaseSecondesRef.current = 0
    setChronoSecondes(0)
    setChronoActif(false)
  }

  const basculerChronometre = () => {
    if (chronoActif) {
      const depart = chronoDepartRef.current || Date.now()
      const secondesAuMomentDeLaPause = Math.min(
        dureeRendezVousSecondes,
        chronoBaseSecondesRef.current + Math.floor((Date.now() - depart) / 1000),
      )
      chronoDepartRef.current = null
      chronoBaseSecondesRef.current = secondesAuMomentDeLaPause
      setChronoSecondes(secondesAuMomentDeLaPause)
      setChronoActif(false)
      return
    }

    const secondesDeDepart = chronoDureeAtteinte ? 0 : chronoSecondes
    chronoBaseSecondesRef.current = secondesDeDepart
    chronoDepartRef.current = Date.now()
    setChronoSecondes(secondesDeDepart)
    setChronoActif(true)
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

  const onFormaliteChange = (field) => (event) => {
    const value = ['presenceRappelee', 'contratPresente'].includes(field)
      ? event.target.checked
      : event.target.value
    setFormalitesEntretien((prev) => ({ ...prev, [field]: value }))
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

    if (key === 'iae') {
      const parcoursIAE = offreServiceCorse.find((item) => item.nom === 'Parcours IAE / SIAE Corse-du-Sud')
      setDecisions((prev) => ({ ...prev, orientationPartenaire: true, prescriptionPrestation: true }))
      if (parcoursIAE) {
        setActionsRetenues((current) => (
          current.some((action) => action.nom === parcoursIAE.nom)
            ? current
            : [...current, normaliserSuiviAction(parcoursIAE)]
        ))
      }
      return
    }

    if (key === 'partenaires' || key === 'handicap') {
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

  const repondreEtContinuer = (reponse) => {
    if (!questionCourante) return
    onAssistantAnswer(questionCourante, reponse)
    const prochainIndex = questionsEntretien.findIndex(
      (question, index) => index > questionIndex && !assistantAnswers[question],
    )
    if (prochainIndex >= 0) setQuestionIndex(prochainIndex)
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
    formalitesEntretien,
    contratEngagementDetails,
    orientationReseau,
    suiviObligations,
    alertesSuiviObligations,
    suiviPortefeuilleMutualise,
    alertesPortefeuilleMutualise: nombreAlertesPortefeuille,
    suiviRemobilisation,
    alertesRemobilisation,
    assistantAnswers,
    questionPrecisions,
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
    actionsEcartees,
    classementTab,
    portefeuilleChoisi,
    codeSituationOp2,
    workspaceTab,
    assistantPhase,
    modeApprofondi,
    recommandationTab,
    advpTab,
    questionIndex,
    decisionConseillerStatut,
    decisionConseillerCommentaire,
    chronoSecondes,
    chronoActif: decisionConseillerStatut === 'Acceptee' ? false : chronoActif,
    controleCloture,
    clotureValidee: dossierCoherentEtComplet && decisionConseillerStatut === 'Acceptee',
    dossierStatut: decisionConseillerStatut === 'Acceptee' ? 'termine' : 'brouillon',
  })

  useEffect(() => {
    if (getEntryDossierId(location.search)) {
      setBrouillonAutomatiquePret(true)
      return
    }
    try {
      const brut = window.localStorage.getItem(ENTRETIEN_DRAFT_KEY)
      if (brut) {
        const dossier = JSON.parse(brut)
        setIdentifiantDemandeur(dossier.identifiant || '')
        setTypeEntretien(normaliserTypeEntretien(dossier.typeEntretien))
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
        setFormalitesEntretien(normalizeFormalitesEntretien(dossier.formalitesEntretien))
        setContratEngagementDetails(normaliserContratEngagementDetails(dossier.contratEngagementDetails))
        setOrientationReseau(normaliserOrientationReseau(dossier.orientationReseau))
        setSuiviObligations(normaliserSuiviObligations(dossier.suiviObligations))
        setSuiviPortefeuilleMutualise(normaliserSuiviPortefeuilleMutualise(dossier.suiviPortefeuilleMutualise))
        setSuiviRemobilisation(normaliserSuiviRemobilisation(dossier.suiviRemobilisation))
        setAssistantAnswers(dossier.assistantAnswers || {})
        setQuestionPrecisions(dossier.questionPrecisions || {})
        setAdvpNotes(dossier.advpNotes || ADVP_STEPS.reduce((acc, step) => ({ ...acc, [step]: { questions: '', reponses: '', observations: '' } }), {}))
        setActionsImmediatesValidees(Array.isArray(dossier.actionsImmediatesValidees) ? dossier.actionsImmediatesValidees : [])
        setHistoriqueEntretiens(Array.isArray(dossier.historiqueEntretiens) ? dossier.historiqueEntretiens : [])
        setActionsRetenues(Array.isArray(dossier.actionsRetenues) ? dossier.actionsRetenues.map(normaliserSuiviAction) : [])
        setActionsEcartees(Array.isArray(dossier.actionsEcartees) ? dossier.actionsEcartees : [])
        setClassementTab(dossier.classementTab || 'maintenant')
        setPortefeuilleChoisi(NOM_PORTEFEUILLE_MUTUALISE)
        setCodeSituationOp2(normaliserCodeSituationOp2(dossier.codeSituationOp2 || dossier.portefeuilleChoisi))
        setWorkspaceTab(dossier.workspaceTab || 'entretien')
        setAssistantPhase(dossier.assistantPhase || 'exploration')
        setModeApprofondi(Boolean(dossier.modeApprofondi))
        setRecommandationTab(dossier.recommandationTab || 'orientation')
        setAdvpTab(dossier.advpTab || ADVP_STEPS[0])
        setQuestionIndex(Number.isInteger(dossier.questionIndex) ? dossier.questionIndex : 0)
        setDecisionConseillerStatut(dossier.decisionConseillerStatut || 'Modifiee')
        setDecisionConseillerCommentaire(dossier.decisionConseillerCommentaire || '')
        setChronoSecondes(Number(dossier.chronoSecondes) || 0)
        setChronoActif(false)
        setBrouillonAutomatiqueStatut('Entretien en cours restauré automatiquement.')
      }
    } catch {
      window.localStorage.removeItem(ENTRETIEN_DRAFT_KEY)
    } finally {
      setBrouillonAutomatiquePret(true)
    }
  }, [location.search])

  useEffect(() => {
    if (!brouillonAutomatiquePret) return undefined
    if (ignorerProchaineSauvegardeRef.current) {
      ignorerProchaineSauvegardeRef.current = false
      window.localStorage.removeItem(ENTRETIEN_DRAFT_KEY)
      return undefined
    }
    const timer = window.setTimeout(() => {
      const snapshot = buildSnapshot()
      window.localStorage.setItem(ENTRETIEN_DRAFT_KEY, JSON.stringify(snapshot))
      if (identifiantDemandeur.trim()) saveStoredDossier(identifiantDemandeur, snapshot)
      setBrouillonAutomatiqueStatut(`Brouillon enregistré automatiquement à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [
    brouillonAutomatiquePret,
    identifiantDemandeur,
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
    formalitesEntretien,
    contratEngagementDetails,
    orientationReseau,
    suiviObligations,
    suiviPortefeuilleMutualise,
    suiviRemobilisation,
    assistantAnswers,
    questionPrecisions,
    advpNotes,
    actionsImmediatesValidees,
    historiqueEntretiens,
    actionsRetenues,
    actionsEcartees,
    classementTab,
    portefeuilleChoisi,
    codeSituationOp2,
    workspaceTab,
    assistantPhase,
    modeApprofondi,
    recommandationTab,
    advpTab,
    questionIndex,
    decisionConseillerStatut,
    decisionConseillerCommentaire,
    chronoActif,
  ])

  const enregistrerAnalyse = () => {
    const result = saveStoredDossier(identifiantDemandeur, buildSnapshot())
    setStorageStatus(
      result.ok
        ? `Analyse enregistrée pour ${identifiantDemandeur}. ${resumeAlertesEnregistrement}`
        : result.message || 'Erreur enregistrement.',
    )
  }

  const ouvrirListeAnalyses = () => {
    const items = listStoredDossiers()
      .map((item) => {
        const dossier = item.dossier || {}
        return {
          identifiant: item.identifiant,
          updatedAt: dossier.versionnement?.updatedAt || item.payload?.updatedAt || '',
          statut: dossier.dossierStatut || 'brouillon',
          typeEntretien: normaliserTypeEntretien(dossier.typeEntretien),
          chronoSecondes: Number(dossier.chronoSecondes) || 0,
          alertesSuivi: compterAlertesActionnables(dossier.suiviObligations),
          alertesPortefeuille: compterAlertesPortefeuilleMutualise(dossier.suiviPortefeuilleMutualise)
            + (normaliserCodeSituationOp2(dossier.codeSituationOp2 || dossier.portefeuilleChoisi) ? 0 : 1),
          alertesRemobilisation: compterAlertesRemobilisation(dossier.suiviRemobilisation),
          filePortefeuille: getFilePortefeuilleMutualise(dossier.suiviPortefeuilleMutualise?.file).label,
          codeSituationOp2: normaliserCodeSituationOp2(dossier.codeSituationOp2 || dossier.portefeuilleChoisi),
        }
      })
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    setAnalysesEnregistrees(items)
    setWorkspaceTab('sauvegardes')
  }

  useEffect(() => {
    if (workspaceTab === 'sauvegardes') ouvrirListeAnalyses()
  }, [workspaceTab])

  const ouvrirAnalyseParIdentifiant = (id) => {
    const result = loadStoredDossier(id)
    if (!result.ok) {
      setStorageStatus(result.message)
      return
    }

    const dossier = result.dossier || {}
    setIdentifiantDemandeur(id)
    setTypeEntretien(normaliserTypeEntretien(dossier.typeEntretien))
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
    setFormalitesEntretien(normalizeFormalitesEntretien(dossier.formalitesEntretien))
    setContratEngagementDetails(normaliserContratEngagementDetails(dossier.contratEngagementDetails))
    setOrientationReseau(normaliserOrientationReseau(dossier.orientationReseau))
    setSuiviObligations(normaliserSuiviObligations(dossier.suiviObligations))
    setSuiviPortefeuilleMutualise(normaliserSuiviPortefeuilleMutualise(dossier.suiviPortefeuilleMutualise))
    setSuiviRemobilisation(normaliserSuiviRemobilisation(dossier.suiviRemobilisation))
    setAssistantAnswers(dossier.assistantAnswers || {})
    setQuestionPrecisions(dossier.questionPrecisions || {})
    setAdvpNotes(dossier.advpNotes || ADVP_STEPS.reduce((acc, step) => ({ ...acc, [step]: { questions: '', reponses: '', observations: '' } }), {}))
    setActionsImmediatesValidees(Array.isArray(dossier.actionsImmediatesValidees) ? dossier.actionsImmediatesValidees : [])
    setHistoriqueEntretiens(Array.isArray(dossier.historiqueEntretiens) ? dossier.historiqueEntretiens : [])
    setActionsRetenues(Array.isArray(dossier.actionsRetenues) ? dossier.actionsRetenues.map(normaliserSuiviAction) : [])
    setActionsEcartees(Array.isArray(dossier.actionsEcartees) ? dossier.actionsEcartees : [])
    setClassementTab(dossier.classementTab || 'maintenant')
    setPortefeuilleChoisi(NOM_PORTEFEUILLE_MUTUALISE)
    setCodeSituationOp2(normaliserCodeSituationOp2(dossier.codeSituationOp2 || dossier.portefeuilleChoisi))
    setAssistantPhase(dossier.assistantPhase || 'exploration')
    setModeApprofondi(Boolean(dossier.modeApprofondi))
    setRecommandationTab(dossier.recommandationTab || 'orientation')
    setAdvpTab(dossier.advpTab || ADVP_STEPS[0])
    setQuestionIndex(Number.isInteger(dossier.questionIndex) ? dossier.questionIndex : 0)
    setDecisionConseillerStatut(dossier.decisionConseillerStatut || 'Modifiee')
    setDecisionConseillerCommentaire(dossier.decisionConseillerCommentaire || '')
    setChronoSecondes(Number(dossier.chronoSecondes) || 0)
    setChronoActif(false)
    setWorkspaceTab('entretien')
    navigate(`/assistant?dossier=${encodeURIComponent(id)}`, { replace: true })
    setStorageStatus(`Sauvegarde ${id} chargée. Vous pouvez la modifier.`)
  }

  const supprimerAnalyse = () => {
    nouveauDossier()
  }

  const dupliquerAnalyse = () => {
    const duplicatedId = `${identifiantDemandeur || 'dossier'}-copie`
    const result = saveStoredDossier(duplicatedId, buildSnapshot())
    setStorageStatus(result.ok ? `Copie creee: ${duplicatedId}` : 'Duplication impossible.')
  }

  const nouveauDossier = async (options = {}) => {
    if (options?.sansConfirmation !== true) {
      const confirmation = window.confirm(
        'Effacer définitivement cet entretien ? Le brouillon et l’entretien enregistré pour cet identifiant seront supprimés.',
      )
      if (!confirmation) return
    }
    const identifiantAEffacer = identifiantDemandeur.trim()
    let suppressionCloudSynced = true
    ignorerProchaineSauvegardeRef.current = true
    window.localStorage.removeItem(ENTRETIEN_DRAFT_KEY)
    if (identifiantAEffacer) {
      const suppression = await deleteStoredDossier(identifiantAEffacer)
      suppressionCloudSynced = suppression.cloudSynced !== false
    }
    setIdentifiantDemandeur('')
    setTypeEntretien(DEFAULT_TYPE_ENTRETIEN)
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
    setFormalitesEntretien(DEFAULT_FORMALITES_ENTRETIEN)
    setContratEngagementDetails(DEFAULT_CONTRAT_ENGAGEMENT_DETAILS)
    setOrientationReseau(DEFAULT_ORIENTATION_RESEAU)
    setSuiviObligations(DEFAULT_SUIVI_OBLIGATIONS)
    setSuiviPortefeuilleMutualise(DEFAULT_SUIVI_PORTEFEUILLE_MUTUALISE)
    setSuiviRemobilisation(DEFAULT_SUIVI_REMOBILISATION)
    setAssistantAnswers({})
    setQuestionPrecisions({})
    setAdvpNotes(ADVP_STEPS.reduce((acc, step) => ({ ...acc, [step]: { questions: '', reponses: '', observations: '' } }), {}))
    setActionsImmediatesValidees([])
    setActionsRetenues([])
    setActionsEcartees([])
    setClassementTab('maintenant')
    setPortefeuilleChoisi(NOM_PORTEFEUILLE_MUTUALISE)
    setCodeSituationOp2('')
    setHistoriqueEntretiens([])
    setDecisionConseillerStatut('Modifiee')
    setDecisionConseillerCommentaire('')
    setQuestionIndex(0)
    setAdvpTab(ADVP_STEPS[0])
    setRecommandationTab('orientation')
    setModeApprofondi(false)
    setChronoSecondes(0)
    setChronoActif(false)
    setWorkspaceTab('entretien')
    setAssistantPhase('exploration')
    setCopyStatus('')
    setBrouillonAutomatiqueStatut('')
    setStorageStatus(
      identifiantAEffacer
        ? suppressionCloudSynced
          ? `Entretien ${identifiantAEffacer} effacé sur cet appareil et en ligne. Le chronomètre est arrêté.`
          : `Entretien ${identifiantAEffacer} effacé sur cet appareil. La suppression en ligne sera retentée automatiquement.`
        : 'Entretien effacé. Le chronomètre est arrêté.',
    )
    if (location.search) navigate('/assistant', { replace: true })
  }

  const supprimerSauvegardeAutomatique = async (id) => {
    const confirmation = window.confirm(
      `Effacer définitivement la sauvegarde automatique ${id} ? Cette action est irréversible.`,
    )
    if (!confirmation) return

    if (id === identifiantDemandeur.trim()) {
      await nouveauDossier({ sansConfirmation: true })
    } else {
      const result = await deleteStoredDossier(id)
      setStorageStatus(
        result.ok
          ? result.cloudSynced === false
            ? `Sauvegarde ${id} effacée localement. La suppression en ligne sera retentée automatiquement.`
            : `Sauvegarde ${id} effacée sur cet appareil et en ligne.`
          : 'Suppression impossible.',
      )
    }
    setAnalysesEnregistrees((items) => items.filter((item) => item.identifiant !== id))
  }

  const enregistrerEtPasserAuSuivant = () => {
    const result = saveStoredDossier(identifiantDemandeur, {
      ...buildSnapshot(),
      chronoActif: false,
    })
    if (!result.ok) {
      setStorageStatus(result.message || 'Enregistrement impossible.')
      return
    }
    setChronoActif(false)
    const dossiers = listPortfolioRecords()
    const indexActuel = dossiers.findIndex((item) => item.identifiant === identifiantDemandeur)
    const suivant = indexActuel >= 0 ? dossiers[indexActuel + 1] : dossiers[0]
    if (!suivant) {
      setStorageStatus(
        `Dossier enregistré. ${resumeAlertesEnregistrement} Aucun autre dossier à ouvrir.`,
      )
      navigate('/tableau-de-bord')
      return
    }
    setStorageStatus(
      `Dossier ${identifiantDemandeur} enregistré. ${resumeAlertesEnregistrement} Ouverture de ${suivant.identifiant}.`,
    )
    navigate(`/assistant?dossier=${encodeURIComponent(suivant.identifiant)}`)
  }

  const cloturerEtPasserAuSuivant = () => {
    if (!dossierCoherentEtComplet) {
      setStorageStatus(
        controleDecision.bloquants > 0
          ? `Clôture impossible : ${controleDecision.prochaineAction}`
          : 'Clôture impossible : complétez les éléments signalés en rouge.',
      )
      return
    }
    const result = saveStoredDossier(identifiantDemandeur, {
      ...buildSnapshot(),
      chronoActif: false,
      clotureValidee: true,
      dossierStatut: 'termine',
    })
    if (!result.ok) {
      setStorageStatus(result.message || 'Clôture impossible.')
      return
    }
    setChronoActif(false)
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
    if (!formalitesCompletes) {
      setCopyStatus('Confirmez d’abord le rappel de présence, PIX et le contrat d’engagement.')
      return
    }
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
  const informationsAConfirmer = [
    !projet.trim(),
    !ressourcesSelectionnees.length,
    /à confirmer|à formaliser|à consolider/i.test(`${capaciteAAgir.statut} ${capaciteAAgir.observations.join(' ')}`),
    questionsEntretien.filter((question) => assistantAnswers[question]).length < Math.min(3, questionsEntretien.length),
  ].filter(Boolean).length
  const niveauConfianceAffiche = missionCompletion < 40 || informationsAConfirmer >= 3
    ? 'Faible'
    : missionCompletion < 70 || informationsAConfirmer >= 2
      ? 'Moyen'
      : recommandationsMoteur.niveauConfiance === 'Très élevé'
        ? 'Élevé'
        : recommandationsMoteur.niveauConfiance || 'Moyen'
  const confianceSousReserve = niveauConfianceAffiche !== 'Élevé'

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 'none',
        mx: 0,
        p: { xs: 0.5, md: 0.75 },
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <Stack spacing={1}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1, md: 1.25 },
            borderRadius: 2,
            borderColor: '#bdd0e4',
            boxShadow: '0 3px 12px rgba(15,35,65,0.08)',
            bgcolor: '#fff',
          }}
        >
          <Grid container spacing={1} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <TextField
                label="Identifiant France Travail"
                value={identifiantDemandeur}
                onChange={(event) => setIdentifiantDemandeur(event.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.8 }}>
              <TextField
                select
                label="Type de rendez-vous"
                value={typeEntretien}
                onChange={changerTypeEntretien}
                fullWidth
                size="small"
              >
                {ENTRETIEN_TYPES.map((item) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 3, lg: 1.2 }}>
              <Typography variant="caption" color="text.secondary">Durée</Typography>
              <Typography variant="body2" sx={{ fontWeight: 900 }}>{dureeRendezVous}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3, lg: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Conseiller</Typography>
              <Typography variant="body2" sx={{ fontWeight: 900 }}>Conseiller FT</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">Temps restant</Typography>
                  <Typography
                    variant="h6"
                    sx={{ lineHeight: 1, fontWeight: 950, color: chronoDureeAtteinte ? 'error.main' : minimumTelephoniqueAtteint ? 'warning.main' : '#174f7f' }}
                  >
                    {formatChrono(chronoRestantSecondes)}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant={chronoActif ? 'outlined' : 'contained'}
                  disabled={decisionConseillerStatut === 'Acceptee'}
                  onClick={basculerChronometre}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {decisionConseillerStatut === 'Acceptee'
                    ? 'Terminé'
                    : chronoActif
                      ? 'Pause'
                      : chronoDureeAtteinte
                        ? 'Recommencer'
                        : chronoSecondes > 0
                          ? 'Reprendre'
                          : 'Démarrer'}
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, lg: 2 }}>
              <Stack direction="row" spacing={0.75} justifyContent={{ lg: 'flex-end' }} alignItems="center">
                <Chip
                  size="small"
                  color="success"
                  variant="outlined"
                  label={brouillonAutomatiqueStatut || 'Sauvegarde active'}
                  sx={{ maxWidth: 190, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                />
                <Button size="small" color="error" variant="text" onClick={nouveauDossier}>
                  Effacer
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ bgcolor: '#fff', borderRadius: 2, p: 1 }}
        >
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#244d78', mr: 0.5 }}>
              Aller à :
            </Typography>
            {[
              ['section-entretien', 'Conduite de l’entretien'],
              ['section-prescriptions', 'Offre de services'],
              ['section-synthese', 'Synthèse d’entretien'],
              ['section-portefeuille-mutualise', nombreAlertesPortefeuille > 0 ? `Portefeuille mutualisé (${nombreAlertesPortefeuille})` : 'Portefeuille mutualisé'],
              ['section-suivi-obligations', nombreAlertesSuivi > 0 ? `Suivi obligations (${nombreAlertesSuivi})` : 'Suivi obligations'],
              ['section-remobilisation', nombreAlertesRemobilisation > 0 ? `Faisceau CRE (${nombreAlertesRemobilisation})` : 'Faisceau CRE'],
            ].map(([anchorId, label]) => (
              <Chip
                key={anchorId}
                clickable
                size="small"
                component="a"
                href={`#${anchorId}`}
                label={label}
                sx={{ fontWeight: 700 }}
              />
            ))}
            <Button
              size="small"
              variant={workspaceTab === 'sauvegardes' ? 'contained' : 'outlined'}
              onClick={() => {
                if (workspaceTab === 'sauvegardes') {
                  setWorkspaceTab('entretien')
                } else {
                  ouvrirListeAnalyses()
                }
              }}
              sx={{ ml: { md: 'auto' } }}
            >
              {workspaceTab === 'sauvegardes' ? 'Fermer les sauvegardes' : 'Sauvegardes automatiques'}
            </Button>
          </Stack>
        </Paper>

        {workspaceTab !== 'sauvegardes' ? (
          <Paper variant="outlined" sx={{ px: 1.25, py: 0.75, borderRadius: 2, bgcolor: '#f9fbfd' }} id="section-entretien">
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
              <Chip size="small" color={missionCompletion >= 70 ? 'success' : missionCompletion >= 40 ? 'warning' : 'default'} label={`Complétude ${missionCompletion}%`} />
              <Chip size="small" variant="outlined" label={`Confiance ${niveauConfianceAffiche}`} />
              <Chip size="small" variant="outlined" color={controleDecision.couleur === 'rouge' ? 'error' : controleDecision.couleur === 'orange' ? 'warning' : 'success'} label={controleDecision.statut} />
              <Chip size="small" variant="outlined" label={`Freins ${Array.from(new Set([...freinsSelectionnes, ...analyseDemandeAutomatique.freins])).length}`} />
              <Chip size="small" variant="outlined" label={`Actions ${actionsRetenues.length}`} />
              <Chip
                clickable
                size="small"
                component="a"
                href="#section-portefeuille-mutualise"
                color={nombreAlertesPortefeuille > 0 ? 'error' : 'success'}
                variant={nombreAlertesPortefeuille > 0 ? 'filled' : 'outlined'}
                label={nombreAlertesPortefeuille > 0
                  ? `Portefeuille ${nombreAlertesPortefeuille}`
                  : 'Portefeuille à jour'}
              />
              <Chip
                clickable
                size="small"
                component="a"
                href="#section-suivi-obligations"
                color={nombreAlertesSuivi > 0 ? 'error' : 'success'}
                variant={nombreAlertesSuivi > 0 ? 'filled' : 'outlined'}
                label={nombreAlertesSuivi > 0 ? `Alertes M6 ${nombreAlertesSuivi}` : 'Suivi M6 à jour'}
              />
              <Chip
                clickable
                size="small"
                component="a"
                href="#section-remobilisation"
                color={nombreAlertesRemobilisation > 0 ? 'error' : 'success'}
                variant={nombreAlertesRemobilisation > 0 ? 'filled' : 'outlined'}
                label={nombreAlertesRemobilisation > 0
                  ? `Alertes CRE ${nombreAlertesRemobilisation}`
                  : 'Faisceau CRE à jour'}
              />
              <Typography variant="caption" sx={{ ml: { md: 'auto' }, fontWeight: 800, color: '#244d78' }}>
                Priorité : {orientationPrioritaire}
              </Typography>
            </Stack>
          </Paper>
        ) : null}

        {workspaceTab === 'sauvegardes' ? (
          <CockpitBlockCard
            title="Sauvegardes automatiques des entretiens"
            subtitle="Reprenez un entretien pour le modifier, ou effacez définitivement sa sauvegarde."
            detailsSx={{ p: { xs: 1.5, md: 2 } }}
          >
            <Stack spacing={1.25}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Les entretiens disposant d’un identifiant France Travail sont sauvegardés automatiquement.
                </Typography>
                <Button size="small" variant="outlined" onClick={ouvrirListeAnalyses}>
                  Actualiser la liste
                </Button>
              </Stack>

              {analysesEnregistrees.length > 0 ? analysesEnregistrees.map((item) => (
                <Paper key={item.identifiant} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} alignItems={{ md: 'center' }} justifyContent="space-between">
                    <Box>
                      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                          {item.identifiant}
                        </Typography>
                        <Chip size="small" color={item.statut === 'termine' ? 'success' : 'warning'} label={item.statut === 'termine' ? 'Terminé' : 'Brouillon'} />
                        <Chip size="small" variant="outlined" label={item.filePortefeuille} />
                        <Chip
                          size="small"
                          color={item.codeSituationOp2 ? 'primary' : 'warning'}
                          variant={item.codeSituationOp2 ? 'outlined' : 'filled'}
                          label={item.codeSituationOp2 ? `OP2 ${item.codeSituationOp2}` : 'OP2 non renseigné'}
                        />
                        {item.alertesPortefeuille > 0 ? (
                          <Chip size="small" color="error" label={`${item.alertesPortefeuille} alerte(s) portefeuille`} />
                        ) : (
                          <Chip size="small" color="success" variant="outlined" label="Portefeuille à jour" />
                        )}
                        {item.alertesSuivi > 0 ? (
                          <Chip size="small" color="error" label={`${item.alertesSuivi} alerte(s) M6`} />
                        ) : (
                          <Chip size="small" color="success" variant="outlined" label="Aucune alerte M6" />
                        )}
                        {item.alertesRemobilisation > 0 ? (
                          <Chip size="small" color="error" label={`${item.alertesRemobilisation} alerte(s) CRE`} />
                        ) : (
                          <Chip size="small" color="success" variant="outlined" label="Faisceau CRE à jour" />
                        )}
                        {item.identifiant === identifiantDemandeur.trim() ? (
                          <Chip size="small" color="primary" variant="outlined" label="Ouvert actuellement" />
                        ) : null}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {ENTRETIEN_TYPES.find((type) => type.value === item.typeEntretien)?.label || 'Type non renseigné'}
                        {' · '}
                        Dernière sauvegarde : {formatDateFr(item.updatedAt)}
                        {' · '}
                        Chronomètre : {formatChrono(item.chronoSecondes)}
                      </Typography>
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button variant="contained" size="small" onClick={() => ouvrirAnalyseParIdentifiant(item.identifiant)}>
                        Reprendre et modifier
                      </Button>
                      <Button color="error" variant="outlined" size="small" onClick={() => supprimerSauvegardeAutomatique(item.identifiant)}>
                        Effacer
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              )) : (
                <Alert severity="info">
                  Aucune sauvegarde automatique disponible. Renseignez un identifiant France Travail pour conserver un entretien dans cette liste.
                </Alert>
              )}
            </Stack>
          </CockpitBlockCard>
        ) : null}


        {workspaceTab !== 'sauvegardes' ? (
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
              <Typography variant="caption" sx={{ fontWeight: 800, minWidth: 110 }}>Dossier complété</Typography>
              <Box sx={{ flex: 1, height: 8, borderRadius: 5, bgcolor: '#e3e8ef', overflow: 'hidden' }}>
                <Box sx={{ width: `${missionCompletion}%`, height: '100%', bgcolor: missionCompletion >= 80 ? '#2e7d32' : missionCompletion >= 40 ? '#ed6c02' : '#d32f2f' }} />
              </Box>
              <Chip size="small" color={missionCompletion >= 80 ? 'success' : missionCompletion >= 40 ? 'warning' : 'error'} label={`${missionCompletion} %`} />
            </Stack>
          </Paper>
        ) : null}

        {workspaceTab !== 'sauvegardes' && questionCourante ? (
          <Paper
            variant="outlined"
            sx={{ p: 1.25, borderLeft: '6px solid #6a1b9a', bgcolor: '#fbf7ff' }}
          >
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.25} alignItems={{ lg: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" sx={{ fontWeight: 900, color: '#6a1b9a' }}>
                  Exploration guidée · question {questionIndex + 1} sur {questionsEntretien.length}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.25 }}>
                  {questionCourante}
                </Typography>
              </Box>
              {!questionCouranteOuverte ? (
                <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap">
                  {['Oui', 'Non', 'À vérifier', 'Non concerné'].map((reponse) => (
                    <Button
                      key={reponse}
                      size="small"
                      variant={assistantAnswers[questionCourante] === reponse ? 'contained' : 'outlined'}
                      color={reponse === 'Non' ? 'error' : reponse === 'À vérifier' ? 'warning' : 'primary'}
                      onClick={() => repondreEtContinuer(reponse)}
                    >
                      {reponse}
                    </Button>
                  ))}
                </Stack>
              ) : null}
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={0.75} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                label={questionCouranteOuverte ? 'Votre réponse' : 'Précision facultative'}
                placeholder={questionCouranteOuverte ? 'Saisissez les éléments donnés par la personne…' : ''}
                helperText={questionCouranteOuverte ? aideQuestionCourante : ''}
                value={questionCouranteOuverte ? assistantAnswers[questionCourante] || '' : questionPrecisions[questionCourante] || ''}
                onChange={(event) => (
                  questionCouranteOuverte
                    ? onAssistantAnswer(questionCourante, event.target.value)
                    : setQuestionPrecisions((prev) => ({ ...prev, [questionCourante]: event.target.value }))
                )}
              />
              <Button
                size="small"
                variant="text"
                disabled={questionIndex <= 0}
                onClick={() => setQuestionIndex((prev) => Math.max(0, prev - 1))}
              >
                Précédente
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={questionCouranteOuverte && !`${assistantAnswers[questionCourante] || ''}`.trim()}
                onClick={() => setQuestionIndex((prev) => Math.min(questionsEntretien.length - 1, prev + 1))}
              >
                {questionCouranteOuverte ? 'Enregistrer et continuer' : 'Suivante'}
              </Button>
            </Stack>
          </Paper>
        ) : null}

        {workspaceTab !== 'sauvegardes' ? (
          <CockpitBlockCard
            title="Listes du diagnostic — sélection multiple"
            subtitle="Ouvrez chaque menu puis cochez autant d’éléments que nécessaire. Vos choix alimentent immédiatement le diagnostic et les recommandations."
            sx={{ borderTop: '6px solid #ed6c02', bgcolor: '#fffdf8' }}
            detailsSx={{ p: { xs: 1.25, md: 2 } }}
          >
            <Grid container spacing={1.25}>
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <SituationMultiSelect
                  label="Situation administrative"
                  value={situationAdministrative}
                  onChange={setSituationAdministrative}
                  options={SITUATION_ADMINISTRATIVE_OPTIONS}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <SituationMultiSelect
                  label="Situation personnelle"
                  value={situationPersonnelle}
                  onChange={setSituationPersonnelle}
                  options={SITUATION_PERSONNELLE_OPTIONS}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <SituationMultiSelect
                  label="Parcours professionnel"
                  value={parcoursProfessionnel}
                  onChange={setParcoursProfessionnel}
                  options={PARCOURS_PROFESSIONNEL_OPTIONS}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CockpitBadgeGroup
                  title="Freins à prendre en compte"
                  options={FREINS_OPTIONS}
                  selected={freinsSelectionnes}
                  onToggle={onToggleFrein}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CockpitBadgeGroup
                  title="Ressources et points d’appui"
                  options={RESSOURCES_OPTIONS}
                  selected={ressourcesSelectionnees}
                  onToggle={onToggleBadge(setRessourcesSelectionnees)}
                />
              </Grid>
            </Grid>
          </CockpitBlockCard>
        ) : null}

        {workspaceTab !== 'sauvegardes' ? (
          <OrientationReseauCard
            value={orientationReseau}
            onChange={setOrientationReseau}
            obligatoire={estEntretienOrientation(typeEntretien)}
          />
        ) : null}

        {workspaceTab !== 'sauvegardes' ? (
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

        {workspaceTab === 'sauvegardes' ? null : (<>
        <Box id="section-prescriptions" sx={{ scrollMarginTop: '90px' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#244d78', mb: 1 }}>
            Offre de services
          </Typography>
          <CockpitBlockCard
            title="Tableau de bord de l’offre de services"
            subtitle="Toute l'offre de service, les alertes et les conditions de prescription visibles sur un seul écran."
            detailsSx={{ p: { xs: 1, md: 1.5 } }}
          >
            <PrescriptionDashboard
              items={offreServiceCorse}
              recommendedNames={prescriptionsDetaillees.map((item) => item.nom)}
              alerts={alertesPrescriptions}
              onSelect={(item) => {
                setActionsRetenues((current) => (
                  current.some((action) => action.nom === item.nom)
                    ? current
                    : [...current, normaliserSuiviAction(item)]
                ))
              }}
            />
          </CockpitBlockCard>
        </Box>

        <Box id="section-synthese" sx={{ scrollMarginTop: '90px' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#244d78', mb: 1 }}>
            Synthèse d’entretien
          </Typography>
          <CockpitBlockCard
            title="Synthèse automatique à destination de la personne accompagnée"
            subtitle="Le texte se met à jour automatiquement à partir des informations saisies pendant l’entretien."
            sx={{ minHeight: 520 }}
            detailsSx={{ px: { xs: 1.5, md: 3 }, pb: 3 }}
          >
            <Typography variant="body2" color="text.secondary">
              Relisez la synthèse avant son envoi. Elle est rédigée à la deuxième personne et ne remplace pas la validation du conseiller.
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: formalitesCompletes ? '#f1f8f3' : '#fff8e8' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                Formalités de fin d’entretien à confirmer
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Le texte ne mentionne que les informations que vous confirmez ci-dessous.
              </Typography>
              {!formalitesCompletes ? (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  Confirmez les quatre éléments avant de copier ou de clôturer la synthèse.
                </Alert>
              ) : (
                <Alert severity="success" sx={{ mb: 1 }}>
                  Formalités confirmées : la conclusion de la synthèse est prête.
                </Alert>
              )}
              <Grid container spacing={1.25} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={formalitesEntretien.presenceRappelee}
                        onChange={onFormaliteChange('presenceRappelee')}
                      />
                    )}
                    label="J’ai rappelé que la présence aux rendez-vous fixés est obligatoire"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Situation PIX"
                    value={formalitesEntretien.pixStatut}
                    onChange={onFormaliteChange('pixStatut')}
                  >
                    <MenuItem value="a-confirmer">À confirmer</MenuItem>
                    <MenuItem value="invite">Test PIX proposé à domicile</MenuItem>
                    <MenuItem value="deja-realise">Test PIX déjà réalisé</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={formalitesEntretien.contratPresente}
                        onChange={onFormaliteChange('contratPresente')}
                      />
                    )}
                    label="J’ai présenté le contrat d’engagement, les droits et les obligations"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Situation du contrat d’engagement"
                    value={formalitesEntretien.contratStatut}
                    onChange={onFormaliteChange('contratStatut')}
                  >
                    <MenuItem value="a-confirmer">À confirmer</MenuItem>
                    <MenuItem value="signe-ce-jour">Signé ce jour</MenuItem>
                    <MenuItem value="deja-signe">Déjà signé</MenuItem>
                    <MenuItem value="signature-a-finaliser">Signature à finaliser</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Organisme référent du contrat"
                    value={contratEngagementDetails.organismeReferent}
                    onChange={(event) => setContratEngagementDetails((prev) => ({
                      ...prev,
                      organismeReferent: event.target.value,
                    }))}
                    placeholder="France Travail, Cap emploi, Mission locale…"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Intensité hebdo"
                    value={contratEngagementDetails.intensiteHebdomadaire}
                    onChange={(event) => setContratEngagementDetails((prev) => ({
                      ...prev,
                      intensiteHebdomadaire: event.target.value,
                    }))}
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    helperText="Heures convenues"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Date de signature"
                    value={contratEngagementDetails.dateSignature}
                    onChange={(event) => setContratEngagementDetails((prev) => ({
                      ...prev,
                      dateSignature: event.target.value,
                    }))}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Dernière actualisation"
                    value={contratEngagementDetails.dateActualisation}
                    onChange={(event) => setContratEngagementDetails((prev) => ({
                      ...prev,
                      dateActualisation: event.target.value,
                    }))}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ py: 0 }}>
                    L’intensité saisie est un élément du contrat. Elle ne déclenche ici ni qualification automatique, ni sanction ; confirmez les règles applicables dans les procédures internes.
                  </Alert>
                </Grid>
              </Grid>
            </Paper>
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
                  lineHeight: 1.3,
                },
              }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <Button variant="contained" size="large" onClick={copierSynthese} disabled={!formalitesCompletes}>
                Copier la synthèse
              </Button>
              <Button variant="outlined" component="a" href="#section-entretien">
                Retour à l’entretien
              </Button>
              {copyStatus ? (
                <Typography variant="body2" color={copyStatus.startsWith('Synthèse copiée') ? 'success.main' : 'warning.main'}>
                  {copyStatus}
                </Typography>
              ) : null}
            </Stack>
          </CockpitBlockCard>
        </Box>

        <Box id="section-portefeuille-mutualise" sx={{ scrollMarginTop: '90px' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#244d78', mb: 1 }}>
            Portefeuille mutualisé
          </Typography>
          <PortefeuilleMutualiseCard
            value={suiviPortefeuilleMutualise}
            onChange={setSuiviPortefeuilleMutualise}
            codeSituationOp2={codeSituationOp2}
            onCodeSituationOp2Change={setCodeSituationOp2}
            onOpenSuiviM6={() => {
              const target = document.getElementById('section-suivi-obligations')
              if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          />
        </Box>

        <Box id="section-suivi-obligations" sx={{ scrollMarginTop: '90px' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#244d78', mb: 1 }}>
            Suivi obligations
          </Typography>
          <SuiviObligationsCard value={suiviObligations} onChange={setSuiviObligations} />
        </Box>

        <Box id="section-remobilisation" sx={{ scrollMarginTop: '90px' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#244d78', mb: 1 }}>
            Faisceau CRE
          </Typography>
          <SuiviRemobilisationCard value={suiviRemobilisation} onChange={setSuiviRemobilisation} />
        </Box>
        </>)}

        {workspaceTab !== 'sauvegardes' && (ceQueDitLaPersonne.trim() || besoinIdentifieConseiller.trim()) ? (
          <CockpitBlockCard
            title="Diagnostic automatique et plan proposé"
            subtitle="Résultat produit à partir du récit saisi."
            sx={{ borderTop: '6px solid #0b6fb8', boxShadow: '0 4px 16px rgba(15,35,65,0.12)' }}
          >
            <Box>
            {alertesDiagnosticAutonome.length > 0 ? (
              <Alert
                severity={alertesDiagnosticAutonome.some((item) => item.severity === 'error') ? 'error' : 'warning'}
                variant="filled"
                sx={{ py: 0.35, fontWeight: 800 }}
              >
                {alertesDiagnosticAutonome.length} point(s) de vigilance détecté(s) — priorité :{' '}
                {alertesDiagnosticAutonome[0].texte}
              </Alert>
            ) : null}
            <Grid container spacing={1.25}>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Box sx={{ height: '100%', p: 1.25, bgcolor: '#eef6ff', borderRadius: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#174f86' }}>Diagnostic</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700 }}>
                    {diagnosticAutonome.conclusion}
                  </Typography>
                  <Stack spacing={0.35} sx={{ mt: 0.75 }}>
                    {analyseDemandeAutomatique.constats.slice(0, 3).map((constat) => (
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
                    Voir les explications et toutes les alertes
                  </Typography>
                  <Typography variant="caption">
                    Éléments détectés, règles appliquées et points à vérifier.
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1.25 }}>
                <Box sx={{ p: 1, mb: 1, bgcolor: '#f5f8fc', borderRadius: 1.5, border: '1px solid #c7d5e5' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#244d78' }}>
                    Lecture selon le Référentiel de diagnostic du Réseau pour l’emploi
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: 0.15 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 900 }}>Projet professionnel</Typography>
                      <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.35 }}>
                        {analyseReferentielReseauEmploi.objectifs.length > 0
                          ? analyseReferentielReseauEmploi.objectifs.map((item) => (
                            <Chip key={item.id} size="small" color="primary" variant="outlined" label={item.label} />
                          ))
                          : <Typography variant="body2">Objectif professionnel à préciser.</Typography>}
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 900 }}>Contraintes personnelles</Typography>
                      <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.35 }}>
                        {analyseReferentielReseauEmploi.contraintes.length > 0
                          ? analyseReferentielReseauEmploi.contraintes.map((item) => (
                            <Chip key={item.id} size="small" color="warning" variant="outlined" label={item.label} />
                          ))
                          : <Typography variant="body2">Aucune contrainte détectée dans le récit actuel.</Typography>}
                      </Stack>
                    </Grid>
                  </Grid>
                  {analyseReferentielReseauEmploi.questions.length > 0 ? (
                    <Typography variant="body2" sx={{ mt: 0.75, fontWeight: 700 }}>
                      Question prioritaire : {analyseReferentielReseauEmploi.questions[0]}
                    </Typography>
                  ) : null}
                </Box>
                <Stack spacing={0.65} sx={{ mb: 1 }}>
                  {alertesDiagnosticAutonome.map((alerte) => (
                    <Alert key={alerte.texte} severity={alerte.severity} sx={{ py: 0.15 }}>
                      {alerte.texte}
                    </Alert>
                  ))}
                </Stack>
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
            </Box>
            <Box
              sx={{
                p: 1.25,
                border: '2px solid',
                borderColor: controleDecision.statut === 'Décision à différer'
                  ? '#d32f2f'
                  : controleDecision.statut === 'Décision possible sous réserve'
                    ? '#ed6c02'
                    : '#2e7d32',
                borderRadius: 1.5,
                bgcolor: controleDecision.statut === 'Décision à différer'
                  ? '#fff1f1'
                  : controleDecision.statut === 'Décision possible sous réserve'
                    ? '#fff8e8'
                    : '#edf7ed',
              }}
            >
              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} alignItems={{ lg: 'center' }}>
                <Chip
                  color={controleDecision.niveauRisque === 'Élevé' ? 'error' : controleDecision.niveauRisque === 'Modéré' ? 'warning' : 'success'}
                  label={`${controleDecision.couleur === 'rouge' ? '🔴' : controleDecision.couleur === 'orange' ? '🟠' : '🟢'} ${controleDecision.statut} · Risque ${controleDecision.niveauRisque}`}
                  sx={{ fontWeight: 900, fontSize: '0.9rem' }}
                />
                <Typography variant="body1" sx={{ flex: 1, fontWeight: 900 }}>
                  À faire maintenant : {controleDecision.prochaineAction}
                </Typography>
                <Accordion
                  disableGutters
                  elevation={0}
                  sx={{ bgcolor: 'transparent', minWidth: { lg: 210 }, '&::before': { display: 'none' } }}
                >
                  <AccordionSummary sx={{ minHeight: 34, p: 0.25 }}>
                    <Typography variant="button" sx={{ fontWeight: 900 }}>Voir les contrôles ({controleDecision.manquants.length + controleDecision.contradictions.length + controleDecision.vigilances.length})</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0.5 }}>
                    <Stack spacing={0.35}>
                      {controleDecision.manquants.map((item) => (
                        <Typography key={item} variant="caption">● Manque : {item}</Typography>
                      ))}
                      {controleDecision.contradictions.map((item) => (
                        <Typography key={item} variant="caption">● Contradiction : {item}</Typography>
                      ))}
                      {controleDecision.vigilances.map((item) => (
                        <Typography key={item} variant="caption">● À vérifier : {item}</Typography>
                      ))}
                      {controleDecision.confirmations.map((item) => (
                        <Typography key={item} variant="caption" color="success.main">✓ Conforme : {item}</Typography>
                      ))}
                      {controleDecision.manquants.length === 0
                        && controleDecision.contradictions.length === 0
                        && controleDecision.vigilances.length === 0 ? (
                          <Typography variant="caption">✓ Aucune incohérence détectée</Typography>
                        ) : null}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Stack>
            </Box>
            <Box sx={{ p: 1.25, bgcolor: '#fff', border: '2px solid #1f7a3f', borderRadius: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1f6b36' }}>
                Décision à enregistrer
              </Typography>
              <Box sx={{ mt: 0.5, mb: 1, border: '1px solid #b9cbe0', borderRadius: 1.5, overflow: 'hidden' }}>
                <Tabs
                  value={classementTab}
                  onChange={(_, value) => setClassementTab(value)}
                  variant="fullWidth"
                  sx={{ minHeight: 36, bgcolor: '#f5f8fc', '& .MuiTab-root': { minHeight: 36, py: 0.5, fontWeight: 900 } }}
                >
                  <Tab value="maintenant" label={`Recommandées maintenant (${actionsClassees.filter((item) => item.categorieClassement === 'maintenant' && !actionsEcartees.includes(item.nom)).length})`} />
                  <Tab value="conditions" label={`Sous conditions (${actionsClassees.filter((item) => item.categorieClassement === 'conditions' && !actionsEcartees.includes(item.nom)).length})`} />
                  <Tab value="prematuree" label={`Prématurées (${actionsClassees.filter((item) => item.categorieClassement === 'prematuree' && !actionsEcartees.includes(item.nom)).length})`} />
                </Tabs>
                <Grid container spacing={0.75} sx={{ p: 0.75 }}>
                  {actionsClassees
                    .filter((item) => item.categorieClassement === classementTab && !actionsEcartees.includes(item.nom))
                    .slice(0, 4)
                    .map((item) => {
                      const retenue = actionsRetenues.some((action) => action.nom === item.nom)
                      return (
                        <Grid key={`classement-${item.type}-${item.nom}`} size={{ xs: 12, md: 6 }}>
                          <Box sx={{ height: '100%', p: 0.8, border: '1px solid #d3dce7', borderRadius: 1, bgcolor: '#fff' }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 900 }}>{item.nom}</Typography>
                              {item.interne ? <Chip size="small" color="success" label="Interne" /> : null}
                            </Stack>
                            <Typography variant="body2" sx={{ mt: 0.4 }}>{item.raisonClassement}</Typography>
                            {item.conditionsClassement[0] ? (
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.35, color: 'warning.dark' }}>
                                À vérifier : {item.conditionsClassement[0]}
                              </Typography>
                            ) : null}
                            <Stack direction="row" spacing={0.5} sx={{ mt: 0.65 }}>
                              <Button
                                size="small"
                                variant={retenue ? 'contained' : 'outlined'}
                                color="success"
                                onClick={() => {
                                  const option = toutesActionsDisponibles.find((candidate) => candidate.nom === item.nom) || item
                                  setActionsRetenues((prev) => retenue ? prev.filter((action) => action.nom !== item.nom) : [...prev, option])
                                }}
                              >
                                {retenue ? 'Retenue' : 'Retenir'}
                              </Button>
                              <Button
                                size="small"
                                color="inherit"
                                onClick={() => {
                                  setActionsEcartees((prev) => [...new Set([...prev, item.nom])])
                                  setActionsRetenues((prev) => prev.filter((action) => action.nom !== item.nom))
                                }}
                              >
                                Écarter
                              </Button>
                            </Stack>
                          </Box>
                        </Grid>
                      )
                    })}
                  {actionsClassees.filter((item) => item.categorieClassement === classementTab && !actionsEcartees.includes(item.nom)).length === 0 ? (
                    <Grid size={12}>
                      <Typography variant="body2" color="text.secondary">Aucune proposition dans cette catégorie.</Typography>
                    </Grid>
                  ) : null}
                </Grid>
                {actionsEcartees.length > 0 ? (
                  <Button size="small" sx={{ ml: 0.5, mb: 0.5 }} onClick={() => setActionsEcartees([])}>
                    Réafficher les {actionsEcartees.length} proposition(s) écartée(s)
                  </Button>
                ) : null}
              </Box>
              <Grid container spacing={1.25} alignItems="center" sx={{ mt: 0.25 }}>
                <Grid size={{ xs: 12, lg: 6 }}>
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
                            : item.categorieDecision === 'Atelier'
                              ? 'Ateliers externes'
                              : 'Prestations externes'
                    )}
                    getOptionLabel={(item) => `${item.code ? `${item.code} - ` : ''}${item.nom}`}
                    isOptionEqualToValue={(option, value) => (
                      option.nom === value.nom && option.categorieDecision === (value.categorieDecision || value.type)
                    )}
                    renderOption={(props, item) => (
                      <li {...props} key={`${item.categorieDecision}-${item.id || item.nom}`}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: item.suggeree ? 900 : 600 }}>
                            {item.suggeree ? '★ ' : ''}{item.code ? `${item.code} - ` : ''}{item.nom}
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
                        label={`${item.interne ? 'Interne' : item.categorieDecision || item.type} · ${item.code ? `${item.code} - ` : ''}${item.nom}`}
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
                        <Accordion
                          key={`suivi-${action.categorieDecision || action.type}-${action.nom}`}
                          disableGutters
                          elevation={0}
                          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px !important', '&::before': { display: 'none' } }}
                        >
                          <AccordionSummary sx={{ minHeight: 38, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ width: '100%', minWidth: 0 }}>
                              <Typography variant="body2" noWrap sx={{ flex: 1, fontWeight: 800 }}>
                                {action.code ? `${action.code} - ` : ''}{action.nom}
                              </Typography>
                              <Chip
                                size="small"
                                color={action.suiviStatut === 'Réalisé' ? 'success' : action.echeanceAction ? 'info' : 'warning'}
                                label={action.suiviStatut || 'Suivi à compléter'}
                              />
                            </Stack>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0.5 }}>
                            <Grid container spacing={1}>
                              <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  label="Responsable"
                                  value={action.responsableAction || 'Conseiller et personne accompagnée'}
                                  onChange={(event) => setActionsRetenues((prev) => prev.map((item, itemIndex) => (
                                    itemIndex === index ? { ...item, responsableAction: event.target.value } : item
                                  )))}
                                >
                                  {RESPONSABLES_ACTION.map((responsable) => (
                                    <MenuItem key={responsable} value={responsable}>{responsable}</MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 12, md: 2 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="date"
                                  label="Échéance"
                                  value={action.echeanceAction || ''}
                                  onChange={(event) => setActionsRetenues((prev) => prev.map((item, itemIndex) => (
                                    itemIndex === index ? { ...item, echeanceAction: event.target.value } : item
                                  )))}
                                  InputLabelProps={{ shrink: true }}
                                />
                              </Grid>
                              <Grid size={{ xs: 12, md: 2 }}>
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  label="État"
                                  value={action.suiviStatut || 'À prescrire'}
                                  onChange={(event) => setActionsRetenues((prev) => prev.map((item, itemIndex) => (
                                    itemIndex === index ? { ...item, suiviStatut: event.target.value } : item
                                  )))}
                                >
                                  {STATUTS_PRESCRIPTION.map((statut) => (
                                    <MenuItem key={statut} value={statut}>{statut}</MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 12, md: 5 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Résultat attendu"
                                  value={action.resultatAttendu || action.objectif || ''}
                                  onChange={(event) => setActionsRetenues((prev) => prev.map((item, itemIndex) => (
                                    itemIndex === index ? { ...item, resultatAttendu: event.target.value } : item
                                  )))}
                                />
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  ) : null}
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Portefeuille"
                    value="Portefeuille mutualisé"
                    slotProps={{ input: { readOnly: true } }}
                    helperText="Organisation de travail"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 2 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Code situation OP2"
                    value={codeSituationOp2}
                    onChange={(event) => setCodeSituationOp2(normaliserCodeSituationOp2(event.target.value))}
                    helperText="Situation de la personne"
                  >
                    <MenuItem value="">À renseigner</MenuItem>
                    {CODES_SITUATION_OP2.map((item) => (
                      <MenuItem key={item.code} value={item.code}>
                        {item.code} — {item.label}
                      </MenuItem>
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
              <Box sx={{ mt: 1.25, p: 1, borderRadius: 1.5, bgcolor: dossierCoherentEtComplet ? '#edf7ed' : '#fff5e6', border: '1px solid', borderColor: dossierCoherentEtComplet ? '#8bc593' : '#efb45d' }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.25} alignItems={{ lg: 'center' }} justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: dossierCoherentEtComplet ? '#1f6b36' : '#9a5100' }}>
                      {dossierCoherentEtComplet
                        ? '✓ Dossier complet, cohérent et prêt à être clôturé'
                        : controleDecision.bloquants > 0
                          ? `⛔ ${controleDecision.bloquants} incohérence(s) ou manque(s) bloquant(s)`
                        : `${controleCloture.filter((item) => !item.ok).length} élément(s) à compléter avant clôture`}
                    </Typography>
                    {!dossierCoherentEtComplet ? (
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        À faire maintenant : {controleDecision.bloquants > 0
                          ? controleDecision.prochaineAction
                          : controleCloture.find((item) => !item.ok)?.label}.
                      </Typography>
                    ) : null}
                    <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent', '&::before': { display: 'none' } }}>
                      <AccordionSummary sx={{ minHeight: 30, px: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900 }}>Voir la checklist complète</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap">
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
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.75} sx={{ minWidth: { lg: 420 } }}>
                    <Button variant="outlined" fullWidth onClick={enregistrerAnalyse}>
                      Enregistrer le brouillon
                    </Button>
                    <Button variant="contained" fullWidth onClick={enregistrerEtPasserAuSuivant} disabled={!identifiantDemandeur.trim()}>
                      Enregistrer et dossier suivant
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      disabled={!dossierCoherentEtComplet}
                      onClick={cloturerEtPasserAuSuivant}
                    >
                      Clôturer et dossier suivant
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </CockpitBlockCard>
        ) : null}

        <Grid container spacing={1} alignItems="flex-start" sx={{ display: workspaceTab !== 'sauvegardes' ? 'flex' : 'none' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack
  spacing={1}
  sx={{
    display: { xs: 'flex', xl: 'grid' },
    gridTemplateColumns: {
      xl: '0.9fr 1.1fr',
    },
    gap: { xl: 1 },
    alignItems: 'start',
  }}
>
              <CockpitBlockCard title="1. Analyse de la situation" sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '3px solid #1976d2' }}>
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

              <CockpitBlockCard title="3. Freins identifiés" sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '3px solid #ed6c02', bgcolor: '#fffaf2' }}>
                  <CockpitBadgeGroup
                    title="Freins a prendre en compte"
                    options={FREINS_OPTIONS}
                    selected={freinsSelectionnes}
                    onToggle={onToggleFrein}
                  />
              </CockpitBlockCard>

              <CockpitBlockCard title="5. ADVP" sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '3px solid #7b1fa2' }}>
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
                sx={{ minHeight: CARD_MIN_HEIGHT, bgcolor: '#faf7fc', borderColor: '#d5dde8', borderTop: '3px solid #7b1fa2' }}
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
              <CockpitBlockCard title="2. Demande exprimée" sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '3px solid #1976d2' }}>
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
                    helperText=""
                  />
                  <TextField
                      label="Besoin identifié par le conseiller"
                      value={besoinIdentifieConseiller}
                      onChange={(event) => setBesoinIdentifieConseiller(event.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                      size="small"
                    />
                </CockpitBlockCard>

              {!ceQueDitLaPersonne.trim() && !besoinIdentifieConseiller.trim() ? (
                <CockpitBlockCard
                  title="Commencez ici"
                  subtitle="Décrivez librement la situation dans la zone de gauche. Le logiciel réalisera ensuite le diagnostic et le plan."
                  sx={{ minHeight: CARD_MIN_HEIGHT, gridColumn: { xl: 'span 2' }, borderTop: '3px solid #0b6fb8', bgcolor: '#eef6ff' }}
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

              <CockpitBlockCard title="4. Ressources et points d’appui" sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '3px solid #ed6c02', bgcolor: '#fffaf2' }}>
                  <CockpitBadgeGroup
                    title="Ressources mobilisables"
                    options={RESSOURCES_OPTIONS}
                    selected={ressourcesSelectionnees}
                    onToggle={onToggleBadge(setRessourcesSelectionnees)}
                  />
                </CockpitBlockCard>

              <CockpitBlockCard title="6. Capacité à agir" sx={{ minHeight: CARD_MIN_HEIGHT, ...capaciteFondSx, borderTop: '3px solid #7b1fa2' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{capaciteAAgir.statut}</Typography>
                  <Stack spacing={0.25}>
                    {capaciteAAgir.observations.map((line) => (
                      <Typography key={line} variant="body2">{line}</Typography>
                    ))}
                  </Stack>
                  <Typography variant="body2">Consequence pour l accompagnement: {capaciteAAgir.consequence}</Typography>
                </CockpitBlockCard>

              <CockpitBlockCard title="8. Recommandations" sx={{ minHeight: CARD_MIN_HEIGHT, borderTop: '3px solid #7b1fa2' }}>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    <Chip
                      size="small"
                      color={niveauConfianceAffiche === 'Élevé' ? 'success' : niveauConfianceAffiche === 'Moyen' ? 'warning' : 'error'}
                      label={`Confiance : ${niveauConfianceAffiche}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Orientation : ${orientationPrioritaire}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Portefeuille : ${recommandationsMoteur.portefeuille || 'À préciser'}${confianceSousReserve ? ' · sous réserve' : ''}`}
                    />
                  </Stack>
                  {confianceSousReserve ? (
                    <Alert severity={niveauConfianceAffiche === 'Faible' ? 'warning' : 'info'} sx={{ py: 0 }}>
                      Diagnostic provisoire : complétez l’exploration avant de valider l’orientation ou une formation.
                    </Alert>
                  ) : null}
                  {!ceQueDitLaPersonne.trim() && !besoinIdentifieConseiller.trim() ? (
                    <Alert severity="warning" sx={{ py: 0 }}>
                      Complétez d’abord la demande exprimée pour fiabiliser les recommandations.
                    </Alert>
                  ) : confianceSousReserve ? (
                    <Alert severity="info" sx={{ py: 0 }}>
                      Premières pistes calculées à partir des informations disponibles — à confirmer pendant l’exploration.
                    </Alert>
                  ) : (
                    <Alert severity="success" sx={{ py: 0 }}>
                      Recommandations suffisamment étayées par les informations confirmées pendant l’entretien.
                    </Alert>
                  )}
                  {recommandationsMoteur.diagnostic?.propositionIAE?.pertinente ? (
                    <Alert severity="info" sx={{ py: 0.25 }}>
                      <strong>Piste IAE à étudier.</strong>{' '}
                      {recommandationsMoteur.diagnostic.propositionIAE.motifs.slice(0, 3).join(' ')}
                      {' '}Les structures, l’éligibilité, les postes disponibles et le circuit doivent être confirmés selon les procédures internes France Travail.
                    </Alert>
                  ) : null}
                  <Tabs
                    value={recommandationTab}
                    onChange={(_, value) => setRecommandationTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ minHeight: 30, '& .MuiTab-root': { minHeight: 30, py: 0 } }}
                  >
                    {recommandationsService
                      .filter((item) => (
                        ['orientation', 'ateliers', 'prestations', 'partenaires', 'formation', 'actions'].includes(item.key)
                        || (item.key === 'iae' && recommandationsMoteur.diagnostic?.propositionIAE?.pertinente)
                      ))
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
                      actionLabel={recommandationActive.key === 'orientation'
                        ? 'Commencer la clarification du projet'
                        : recommandationActive.key === 'iae'
                          ? 'Ajouter la piste IAE aux actions'
                        : recommandationActive.key === 'ateliers'
                          ? 'Voir et choisir les ateliers'
                          : recommandationActive.key === 'prestations'
                            ? 'Voir et choisir les prestations'
                            : recommandationActive.key === 'partenaires'
                              ? 'Voir et choisir les partenaires'
                              : recommandationActive.key === 'formation'
                                ? 'Examiner les pistes de formation'
                                : 'Ajouter au plan d’action'}
                    />
                  ) : null}
                </CockpitBlockCard>
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={1} alignItems="flex-start" sx={{ display: workspaceTab !== 'sauvegardes' ? 'flex' : 'none' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CockpitBlockCard title="9. MAP" defaultExpanded sx={{ minHeight: 0, borderTop: '3px solid #2e7d32', bgcolor: '#f4fbf6' }}>
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

          <Grid size={{ xs: 12, md: 6 }}>
            <CockpitBlockCard title="10. Actions immédiates" defaultExpanded sx={{ minHeight: 0, borderTop: '3px solid #2e7d32', bgcolor: '#f4fbf6' }}>
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

          <Grid size={{ xs: 12, md: 6 }}>
            <CockpitBlockCard title="Conduite d’entretien" defaultExpanded={false} sx={{ minHeight: 0, borderTop: '3px solid #2e7d32', bgcolor: '#f4fbf6' }}>
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
            <CockpitBlockCard title="Actions du dossier" defaultExpanded={false} sx={{ minHeight: 0, borderTop: '3px solid #2e7d32', bgcolor: '#f4fbf6' }}>
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

      </Stack>
    </Box>
  )
}

export default AssistantMissionPage
