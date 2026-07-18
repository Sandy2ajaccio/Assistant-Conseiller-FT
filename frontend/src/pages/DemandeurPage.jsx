import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import SectionCard from '../components/SectionCard'
import AssistantExpert from '../components/AssistantExpert'
import Analyse360Section from '../components/Analyse360Section'
import SimulateurSection from '../components/SimulateurSection'
import SyntheseSection from '../components/SyntheseSection'
import CompteRenduSection from '../components/CompteRenduSection'
import AssistantExpertSection from '../components/AssistantExpertSection'
import { analyserDemandeur } from '../services/moteurExpert'
import { generateDemandeurInsights, normalizePartenaire, normalizePrestation } from '../services/demandeurInsights'
import {
  buildVersionContentSignature,
  createVersionEntry,
  isVersionContentEmpty,
  nextVersionNumber,
  VERSION_TYPES,
} from '../services/versioningEngine'
import { buildDemandeurContractSnapshot, buildVersionnementModel, normalizeDemandeurModel } from '../types/dossierContract'
import { demandeurs } from '../data/ateliers'
import { partenairesCorse, portefeuillesCorse, prestationsCorse } from '../data/configurationCorse'

const cloneDemandeur = (source) => {
  const normalized = normalizeDemandeurModel(source)
  if (!normalized.id && !normalized.identifiantFt) return null

  return {
    ...normalized,
    prestations: [...(normalized.prestations || [])],
    ateliers: [...(normalized.ateliers || [])],
    formations: [...(normalized.formations || [])],
    convocations: [...(normalized.convocations || [])],
    simulateurDecision: normalized.simulateurDecision
      ? {
          ...normalized.simulateurDecision,
          partenaires: [...(normalized.simulateurDecision.partenaires || [])],
        }
      : undefined,
  }
}

function DemandeurPage() {
  const { id } = useParams()
  const sourceDemandeur = useMemo(
    () => demandeurs.find((item) => String(item.id) === id),
    [id]
  )
  const [demandeur, setDemandeur] = useState(() => cloneDemandeur(sourceDemandeur))
  const [activeTab, setActiveTab] = useState('Historique')
  const [scenarios, setScenarios] = useState([])
  const [showComparison, setShowComparison] = useState(false)
  const [selectedScenarioId, setSelectedScenarioId] = useState('')
  const [decisionFinaleMessage, setDecisionFinaleMessage] = useState('')
  const [syntheseEntretien, setSyntheseEntretien] = useState('')
  const [historiqueVersions, setHistoriqueVersions] = useState([])
  const [messageSynthese, setMessageSynthese] = useState('')
  const [derniereVersionSauvegardee, setDerniereVersionSauvegardee] = useState('')
  const [compteRenduSections, setCompteRenduSections] = useState({})
  const [compteRenduBaseAuto, setCompteRenduBaseAuto] = useState({})
  const [compteRenduVerrouille, setCompteRenduVerrouille] = useState(false)
  const [compteRenduMessage, setCompteRenduMessage] = useState('')
  const [compteRenduVersionCourante, setCompteRenduVersionCourante] = useState(1)
  const [assistantExpertAnalyse, setAssistantExpertAnalyse] = useState({})
  const [assistantExpertExpanded, setAssistantExpertExpanded] = useState({})
  const [assistantExpertMessage, setAssistantExpertMessage] = useState('')
  const [assistantMetierExpanded, setAssistantMetierExpanded] = useState({})
  const [entretienQuestionIndex, setEntretienQuestionIndex] = useState(0)
  const [entretienReponses, setEntretienReponses] = useState({})
  const [entretienNotes, setEntretienNotes] = useState('')
  const [, setDossierVersion] = useState(0)
  const scenarioIdCounterRef = useRef(0)
  const versionCountersRef = useRef({
    [VERSION_TYPES.SYNTHESE]: 0,
    [VERSION_TYPES.COMPTE_RENDU]: 0,
  })
  const analyse = demandeur ? analyserDemandeur(demandeur) : null

  useEffect(() => {
    setDemandeur(cloneDemandeur(sourceDemandeur))
  }, [sourceDemandeur])

  const buildScenario = () => {
    scenarioIdCounterRef.current += 1
    const scenarioNumber = scenarioIdCounterRef.current

    return {
      id: `scenario-${scenarioNumber}`,
      nom: `Scénario ${scenarioNumber}`,
    typeAccompagnement: demandeur?.portefeuille || portefeuillesCorse[0],
    prestations: [],
    partenaires: [],
    formation: '',
    map: '',
    frequenceSuivi: 'Hebdomadaire',
    echeance: '',
    }
  }

  useEffect(() => {
    scenarioIdCounterRef.current = 0
    versionCountersRef.current = {
      [VERSION_TYPES.SYNTHESE]: 0,
      [VERSION_TYPES.COMPTE_RENDU]: 0,
    }
    setScenarios([buildScenario()])
    setShowComparison(false)
    setSelectedScenarioId('')
    setDecisionFinaleMessage('')
    setSyntheseEntretien('')
    setHistoriqueVersions([])
    setMessageSynthese('')
    setDerniereVersionSauvegardee('')
    setCompteRenduSections({})
    setCompteRenduBaseAuto({})
    setCompteRenduVerrouille(false)
    setCompteRenduMessage('')
    setCompteRenduVersionCourante(1)
    setAssistantExpertAnalyse({})
    setAssistantExpertExpanded({})
    setAssistantExpertMessage('')
    setAssistantMetierExpanded({})
    setEntretienQuestionIndex(0)
    setEntretienReponses({})
    setEntretienNotes('')
    setActiveTab('Historique')
  }, [id])

  const tabs = [
    'Historique',
    'DPA',
    'Actions',
    'Prestations',
    'Ateliers',
    'Formations',
    'Convocations',
    'Analyse 360°',
    'Simulateur',
    'Synthèse',
    'Compte rendu',
    'Assistant Expert',
    'Notes',
  ]

  const tabsLigne4 = ['Historique', 'Synthèse', 'Compte rendu', 'MAP', 'Actions', 'Documents']

  const TYPES_ACCOMPAGNEMENT = portefeuillesCorse
  const FREQUENCES_SUIVI = ['Hebdomadaire', 'Toutes les 2 semaines', 'Mensuel']
  const FORMATIONS_OPTIONS = ['Formation transversale', 'Formation certifiante', 'Pré-qualification', 'Aucune']
  const MAP_OPTIONS = ['MAP standard', 'MAP renforcée', 'MAP emploi durable', 'MAP levée de freins']
  const ASSISTANT_EXPERT_SECTIONS = [
    { key: 'analyseGlobale', title: '1. Analyse globale' },
    { key: 'pointsForts', title: '2. Points forts' },
    { key: 'freinsPrincipaux', title: '3. Freins principaux' },
    { key: 'pointsVigilance', title: '4. Points de vigilance' },
    { key: 'opportunites', title: '5. Opportunités' },
    { key: 'prestationsEnvisageables', title: '6. Prestations envisageables' },
    { key: 'partenairesMobilisables', title: '7. Partenaires mobilisables' },
    { key: 'pistesAccompagnement', title: "8. Pistes d'accompagnement" },
    { key: 'questionsApprofondir', title: "9. Questions à approfondir pendant l'entretien" },
    { key: 'controlesAvantCloture', title: '10. Contrôles à effectuer avant clôture' },
  ]
  const COMPTE_RENDU_STRUCTURE = [
    { key: 'objetEntretien', label: "Objet de l'entretien" },
    { key: 'situationDemandeur', label: 'Situation du demandeur' },
    { key: 'elementsNouveaux', label: 'Éléments nouveaux depuis le dernier entretien' },
    { key: 'diagnostic', label: 'Diagnostic' },
    { key: 'freins', label: 'Freins' },
    { key: 'atouts', label: 'Atouts' },
    { key: 'projetProfessionnel', label: 'Projet professionnel' },
    { key: 'decisionsPrises', label: 'Décisions prises' },
    { key: 'prestationsPrescrites', label: 'Prestations prescrites' },
    { key: 'partenairesMobilises', label: 'Partenaires mobilisés' },
    { key: 'actionsDemandeur', label: 'Actions du demandeur' },
    { key: 'actionsConseiller', label: 'Actions du conseiller' },
    { key: 'map', label: 'MAP' },
    { key: 'dateProchainRdv', label: 'Date du prochain rendez-vous' },
  ]

  const insights = useMemo(
    () => generateDemandeurInsights({ demandeur, analyse }),
    [demandeur, analyse]
  )

  const {
    freins,
    atouts,
    prestationsDossier,
    prestationsAnalyse,
    actionsAnalyse,
    partenairesDecision,
    partenairesMobilises,
    analyse360Cards,
    syntheseAnalyse360,
    syntheseComplete,
    compteRenduAuto,
    assistantExpertAnalyse: assistantExpertAnalyseAuto,
  } = insights

  const historiqueSynthese = useMemo(
    () =>
      historiqueVersions
        .filter((item) => item.type === VERSION_TYPES.SYNTHESE)
        .map((item) => ({
          ...item,
          texte: String(item.contenu || ''),
        })),
    [historiqueVersions]
  )

  const compteRenduHistorique = useMemo(
    () =>
      historiqueVersions
        .filter((item) => item.type === VERSION_TYPES.COMPTE_RENDU)
        .map((item) => ({
          ...item,
          sections: item.contenu || {},
          finale: Boolean(item.finale),
        })),
    [historiqueVersions]
  )

  const archiverVersion = (type, contenu, options = {}) => {
    if (isVersionContentEmpty(type, contenu)) return null

    const signature = buildVersionContentSignature(type, contenu)
    const existeDeja = historiqueVersions.some(
      (item) => item.type === type && buildVersionContentSignature(type, item.contenu) === signature
    )

    if (existeDeja && !options.allowDuplicate) {
      return null
    }

    const version = nextVersionNumber(versionCountersRef.current, type)
    versionCountersRef.current = {
      ...versionCountersRef.current,
      [type]: version,
    }

    const entry = createVersionEntry({
      type,
      version,
      content: contenu,
      extra: options.extra || {},
    })

    setHistoriqueVersions((prev) => [entry, ...prev])
    return entry
  }

  const prochaineVersion = (type) => nextVersionNumber(versionCountersRef.current, type)

  const updateScenario = (scenarioId, field, value) => {
    setScenarios((prev) => prev.map((item) => (item.id === scenarioId ? { ...item, [field]: value } : item)))
  }

  const addScenario = () => {
    setScenarios((prev) => {
      if (prev.length >= 3) return prev
      return [...prev, buildScenario()]
    })
  }

  const removeScenario = (scenarioId) => {
    setScenarios((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((item) => item.id !== scenarioId)
    })
    if (selectedScenarioId === scenarioId) {
      setSelectedScenarioId('')
    }
  }

  const normaliserFreinsRestants = (scenario) => {
    const baseFreins = [...freins]
    const scenarioPrestations = (scenario.prestations || []).map((item, index) =>
      normalizePrestation(item, index, 'scenario')
    )
    const scenarioPartenaires = (scenario.partenaires || []).map((item, index) =>
      normalizePartenaire(item, index, 'scenario')
    )

    if (
      scenarioPrestations.some((item) => item.libelle === 'Aide à la mobilité') ||
      scenarioPartenaires.some((item) => item.nom === 'Collectivité de Corse')
    ) {
      return baseFreins.filter((item) => !item.toLowerCase().includes('mobilité'))
    }

    if (scenarioPrestations.some((item) => item.libelle === "Activ'Projet") || scenario.formation) {
      return baseFreins.filter((item) => !item.toLowerCase().includes('projet professionnel'))
    }

    return baseFreins
  }

  const calculerResultatScenario = (scenario) => {
    const avantages = []
    const pointsVigilance = []
    const prestationsScenario = (scenario.prestations || []).map((item, index) =>
      normalizePrestation(item, index, 'scenario')
    )
    const partenairesMobilisesScenario = (scenario.partenaires || []).map((item, index) =>
      normalizePartenaire(item, index, 'scenario')
    )
    const freinsRestants = normaliserFreinsRestants(scenario)
    const prochainesActions = []

    if (scenario.typeAccompagnement) {
      avantages.push(`Accompagnement ${scenario.typeAccompagnement} ciblé sur le profil.`)
    }
    if (prestationsScenario.length > 0) {
      avantages.push(`${prestationsScenario.length} prestation(s) planifiée(s).`)
      prochainesActions.push(`Lancer la prescription des prestations : ${prestationsScenario.map((item) => item.libelle).join(', ')}.`)
    } else {
      pointsVigilance.push('Aucune prestation sélectionnée : risque de plan peu opérationnel.')
    }

    if (partenairesMobilisesScenario.length > 0) {
      avantages.push(`${partenairesMobilisesScenario.length} partenaire(s) mobilisé(s).`)
      prochainesActions.push(`Contacter les partenaires : ${partenairesMobilisesScenario.map((item) => item.nom).join(', ')}.`)
    } else {
      pointsVigilance.push('Aucun partenaire mobilisé pour la levée de freins externes.')
    }

    if (scenario.formation && scenario.formation !== 'Aucune') {
      avantages.push(`Formation prévue : ${scenario.formation}.`)
      prochainesActions.push(`Vérifier l'éligibilité et le financement de la formation ${scenario.formation}.`)
    }

    if (!scenario.map) {
      pointsVigilance.push('MAP non définie : préciser la stratégie d\'accompagnement.')
    } else {
      prochainesActions.push(`Formaliser la ${scenario.map} dans le dossier.`)
    }

    if (!scenario.echeance) {
      pointsVigilance.push('Aucune échéance définie : difficulté de pilotage.')
    } else {
      prochainesActions.push(`Programmer un suivi ${scenario.frequenceSuivi.toLowerCase()} jusqu'au ${scenario.echeance}.`)
    }

    if (scenario.frequenceSuivi === 'Mensuel' && freins.length >= 2) {
      pointsVigilance.push('Fréquence mensuelle potentiellement insuffisante au regard des freins identifiés.')
    }

    if (avantages.length === 0) {
      avantages.push('Pas d\'avantage identifié tant que le scénario n\'est pas complété.')
    }
    if (prochainesActions.length === 0) {
      prochainesActions.push('Compléter les paramètres du scénario pour générer un plan d\'actions précis.')
    }

    return {
      avantages,
      pointsVigilance,
      freinsRestants,
      partenairesMobilises: partenairesMobilisesScenario,
      prochainesActions,
    }
  }

  const scenarioComparaisonRows = [
    {
      label: 'Avantages',
      getter: (resultat) => resultat.avantages.join(' | '),
    },
    {
      label: 'Points de vigilance',
      getter: (resultat) => resultat.pointsVigilance.join(' | '),
    },
    {
      label: 'Freins restant à lever',
      getter: (resultat) =>
        resultat.freinsRestants.length > 0 ? resultat.freinsRestants.join(' | ') : 'Aucun frein résiduel critique.',
    },
    {
      label: 'Partenaires mobilisés',
      getter: (resultat) =>
        resultat.partenairesMobilises.length > 0
          ? resultat.partenairesMobilises.map((item) => item.nom).join(' | ')
          : 'Aucun partenaire sélectionné.',
    },
    {
      label: 'Prochaines actions',
      getter: (resultat) => resultat.prochainesActions.join(' | '),
    },
  ]

  const dossierVersionnement = useMemo(() => {
    const sorted = [...historiqueVersions].sort((a, b) => b.version - a.version)
    const latest = sorted[0] || null

    return buildVersionnementModel({
      current: {
        version: latest?.version || 1,
        createdAt: sorted[sorted.length - 1]?.date || '',
        updatedAt: latest ? `${latest.date || ''} ${latest.heure || ''}`.trim() : '',
        auteur: latest?.auteur || 'Conseiller FT',
        source: 'demandeur',
        historique: sorted.map((entry) => ({
          version: entry.version,
          createdAt: `${entry.date || ''} ${entry.heure || ''}`.trim(),
          updatedAt: `${entry.date || ''} ${entry.heure || ''}`.trim(),
          auteur: entry.auteur || 'Conseiller FT',
          source: entry.type || 'demandeur',
        })),
      },
      fallbackSource: 'demandeur',
    })
  }, [historiqueVersions])

  const dossierSignature = useMemo(
    () => JSON.stringify(buildDemandeurContractSnapshot({ ...demandeur, versionnement: dossierVersionnement })),
    [demandeur, dossierVersionnement]
  )

  const genererOuRegenererSynthese = (origine = 'Générée') => {
    const nouvelleSynthese = syntheseComplete
    setSyntheseEntretien(nouvelleSynthese)
    setDerniereVersionSauvegardee(nouvelleSynthese)
    archiverVersion(VERSION_TYPES.SYNTHESE, nouvelleSynthese, { allowDuplicate: true })
    setMessageSynthese(`${origine} le ${new Date().toLocaleString('fr-FR')} par Conseiller FT.`)
  }

  useEffect(() => {
    if (!demandeur) return
    const syntheseAuto = syntheseComplete

    if (!syntheseEntretien.trim()) {
      setSyntheseEntretien(syntheseAuto)
      setDerniereVersionSauvegardee(syntheseAuto)
      archiverVersion(VERSION_TYPES.SYNTHESE, syntheseAuto)
      setMessageSynthese('Synthèse initialisée automatiquement à partir du dossier.')
      return
    }

    if (syntheseAuto !== syntheseEntretien) {
      setSyntheseEntretien(syntheseAuto)
      setDerniereVersionSauvegardee(syntheseAuto)
      archiverVersion(VERSION_TYPES.SYNTHESE, syntheseAuto)
      setMessageSynthese('Synthèse régénérée automatiquement suite à une modification importante du dossier.')
    }
  }, [dossierSignature, syntheseComplete])

  const sauvegarderVersionEditee = () => {
    if (!syntheseEntretien.trim()) return
    if (syntheseEntretien === derniereVersionSauvegardee) return

    archiverVersion(VERSION_TYPES.SYNTHESE, syntheseEntretien)
    setDerniereVersionSauvegardee(syntheseEntretien)
    setMessageSynthese('Version éditée enregistrée dans l\'historique.')
  }

  const copierSyntheseEntretien = async () => {
    if (!syntheseEntretien.trim()) return
    await navigator.clipboard.writeText(syntheseEntretien)
    setMessageSynthese('Synthèse copiée dans le presse-papiers.')
  }

  const restaurerVersion = (version) => {
    if (syntheseEntretien.trim()) {
      archiverVersion(VERSION_TYPES.SYNTHESE, syntheseEntretien)
    }
    setSyntheseEntretien(version.texte)
    setDerniereVersionSauvegardee(version.texte)
    setMessageSynthese(`Version restaurée (${version.date} ${version.heure}, ${version.auteur}).`)
  }

  const updateCompteRenduSection = (key, value) => {
    setCompteRenduSections((prev) => ({ ...prev, [key]: value }))
  }

  const archiverCompteRenduVersion = (finale = false, contenu = compteRenduSections) =>
    archiverVersion(VERSION_TYPES.COMPTE_RENDU, { ...(contenu || {}) }, { extra: { finale }, allowDuplicate: finale })

  useEffect(() => {
    if (!demandeur) return
    const auto = compteRenduAuto
    const baseAutoSignature = buildVersionContentSignature(VERSION_TYPES.COMPTE_RENDU, compteRenduBaseAuto)
    const autoSignature = buildVersionContentSignature(VERSION_TYPES.COMPTE_RENDU, auto)
    let sectionsMisesAJour = auto

    setCompteRenduSections((prev) => {
      if (!prev || Object.keys(prev).length === 0) {
        sectionsMisesAJour = auto
        return auto
      }

      const next = { ...prev }
      COMPTE_RENDU_STRUCTURE.forEach(({ key }) => {
        const valeurActuelle = String(prev[key] || '')
        const valeurAutoPrecedente = String(compteRenduBaseAuto[key] || '')
        if (!valeurActuelle.trim() || valeurActuelle === valeurAutoPrecedente) {
          next[key] = auto[key]
        }
      })
      sectionsMisesAJour = next
      return next
    })

    setCompteRenduBaseAuto(auto)

    if (baseAutoSignature !== autoSignature) {
      const version = archiverCompteRenduVersion(false, sectionsMisesAJour)
      if (version) {
        setCompteRenduVersionCourante(version.version)
      }
    }
  }, [dossierSignature, compteRenduAuto])

  const analyseCompteRendu = useMemo(() => {
    const champsManquants = COMPTE_RENDU_STRUCTURE
      .filter(({ key }) => !String(compteRenduSections[key] || '').trim())
      .map(({ label }) => label)

    const incoherences = []
    const mapTexte = String(compteRenduSections.map || '').toLowerCase()
    const dateTexte = String(compteRenduSections.dateProchainRdv || '').toLowerCase()
    const projetTexte = String(compteRenduSections.projetProfessionnel || '').toLowerCase()
    const freinsTexte = String(compteRenduSections.freins || '').toLowerCase()
    const decisionsTexte = String(compteRenduSections.decisionsPrises || '').toLowerCase()
    const partenairesTexte = String(compteRenduSections.partenairesMobilises || '').toLowerCase()

    if (!mapTexte.trim() || mapTexte.includes('pas encore')) {
      incoherences.push('MAP absente')
    }
    if (!dateTexte.trim() || dateTexte.includes('pas encore')) {
      incoherences.push('Date de suivi absente')
    }
    if (!projetTexte.trim() || projetTexte.includes('reste à formaliser')) {
      incoherences.push('Projet professionnel non renseigné')
    }
    if (!freinsTexte.trim() || freinsTexte.includes('aucun frein majeur')) {
      incoherences.push('Freins non identifiés')
    }
    if (decisionsTexte.trim() && !/(car|afin|justifi|motif)/.test(decisionsTexte)) {
      incoherences.push('Décision sans justification')
    }
    if (partenairesTexte.trim() && !/(motif|car|afin|pour|:)/.test(partenairesTexte)) {
      incoherences.push('Partenaire proposé sans motif')
    }

    const pointsAVerifier = [
      ...(analyse?.verifications || []),
      'Vérifier la cohérence entre décisions, prestations et échéance.',
      'Contrôler que les actions du demandeur sont mesurables et datées.',
    ]

    const total = COMPTE_RENDU_STRUCTURE.length
    const remplis = total - champsManquants.length
    const scoreBrut = Math.round((remplis / total) * 100)
    const scoreFinal = Math.max(0, Math.min(100, scoreBrut - incoherences.length * 5))

    return {
      score: scoreFinal,
      champsManquants,
      incoherences,
      pointsAVerifier,
    }
  }, [compteRenduSections, analyse])

  const verifierCompteRendu = () => {
    setCompteRenduMessage(`Vérification effectuée le ${new Date().toLocaleString('fr-FR')} par Conseiller FT.`)
  }

  const versionFinaleCompteRendu = () => {
    const version = archiverCompteRenduVersion(true)
    setCompteRenduVerrouille(true)
    const numero = version?.version || compteRenduVersionCourante
    setCompteRenduVersionCourante(numero)
    setCompteRenduMessage(`Version ${numero} finalisée et verrouillée.`)
  }

  const creerNouvelleVersionCompteRendu = () => {
    setCompteRenduVerrouille(false)
    setCompteRenduVersionCourante(prochaineVersion(VERSION_TYPES.COMPTE_RENDU))
    setCompteRenduMessage('Nouvelle version ouverte à partir de la version finale précédente.')
  }

  const restaurerVersionCompteRendu = (version) => {
    setCompteRenduSections({ ...version.sections })
    setCompteRenduVerrouille(Boolean(version.finale))
    setCompteRenduVersionCourante((prev) => Math.max(prev, prochaineVersion(VERSION_TYPES.COMPTE_RENDU)))
    setCompteRenduMessage(`Version ${version.version} restaurée (${version.date} ${version.heure}, ${version.auteur}).`)
  }

  const confidenceColor = (niveau) => {
    if (niveau === 'Élevé') return 'success'
    if (niveau === 'Faible') return 'warning'
    return 'default'
  }

  const actualiserAssistantExpertAnalyse = () => {
    setAssistantExpertAnalyse(assistantExpertAnalyseAuto)
    setAssistantExpertExpanded((prev) => {
      if (Object.keys(prev).length > 0) return prev
      return ASSISTANT_EXPERT_SECTIONS.reduce((acc, section) => ({ ...acc, [section.key]: true }), {})
    })
    setAssistantExpertMessage(`Analyse actualisée le ${new Date().toLocaleString('fr-FR')} (assistant d'aide, sans prise de décision).`)
  }

  useEffect(() => {
    if (!demandeur) return
    actualiserAssistantExpertAnalyse()
  }, [dossierSignature, assistantExpertAnalyseAuto])

  const questionsEntretien = useMemo(() => {
    const base = [
      'Quels sont les objectifs prioritaires du prochain entretien ?',
      'Quels freins doivent être levés en priorité avant le prochain suivi ?',
    ]
    const questionsMetier = (analyse?.questions || []).filter(Boolean)
    return Array.from(new Set([...questionsMetier, ...base]))
  }, [analyse])

  const questionCourante = questionsEntretien[entretienQuestionIndex] || questionsEntretien[0] || ''

  const assistantMetierCards = useMemo(
    () => [
      {
        key: 'diagnostic',
        title: 'Diagnostic',
        content: [
          `Priorité: ${analyse?.priorite || 'Non définie'}`,
          `Score métier: ${analyse?.score ?? 0}`,
          analyse?.synthese || 'Aucun diagnostic détaillé disponible.',
        ],
      },
      {
        key: 'orientation',
        title: 'Orientation',
        content: [
          `Portefeuille conseillé: ${analyse?.portefeuilleConseille || demandeur?.portefeuille || 'Non déterminé'}`,
          demandeur?.simulateurDecision?.typeAccompagnement
            ? `Type d'accompagnement: ${demandeur.simulateurDecision.typeAccompagnement}`
            : 'Type d\'accompagnement non défini.',
        ],
      },
      {
        key: 'prestations',
        title: 'Prestations',
        content:
          prestationsAnalyse.length > 0
            ? prestationsAnalyse.map((item) => item.libelle)
            : ['Aucune prestation recommandée.'],
      },
      {
        key: 'ateliers',
        title: 'Ateliers',
        content: analyse?.ateliers?.length > 0 ? analyse.ateliers : ['Aucun atelier recommandé.'],
      },
      {
        key: 'partenaires',
        title: 'Partenaires',
        content:
          partenairesMobilises.length > 0
            ? partenairesMobilises
            : ['Aucun partenaire mobilisé à ce stade.'],
      },
      {
        key: 'vigilances',
        title: 'Points de vigilance',
        content:
          analyse?.alertes?.length > 0
            ? analyse.alertes
            : freins.length > 0
              ? freins
              : ['Aucun point de vigilance bloquant.'],
      },
      {
        key: 'justification',
        title: 'Justification métier',
        content: [analyse?.pourquoi || 'Aucune justification disponible.'],
      },
    ],
    [analyse, demandeur, prestationsAnalyse, partenairesMobilises, freins]
  )

  const renderLigne4Content = () => {
    if (!demandeur) return null

    switch (activeTab) {
      case 'Historique':
        return (
          <Stack spacing={1.25}>
            <Typography variant="body2">Dernier entretien : {demandeur.dernierEntretien || 'Non réalisé'}</Typography>
            <Typography variant="body2">Contrat d'engagement : {demandeur.contratEngagement || 'Non renseigné'}</Typography>
            <Typography variant="body2">Ateliers : {demandeur.ateliers.length > 0 ? demandeur.ateliers.join(', ') : 'Aucun atelier enregistré.'}</Typography>
            <Typography variant="body2">Convocations : {demandeur.convocations.length > 0 ? demandeur.convocations.join(', ') : 'Aucune convocation enregistrée.'}</Typography>
          </Stack>
        )
      case 'Synthèse':
        return (
          <SyntheseSection
            genererOuRegenererSynthese={genererOuRegenererSynthese}
            copierSyntheseEntretien={copierSyntheseEntretien}
            syntheseEntretien={syntheseEntretien}
            setSyntheseEntretien={setSyntheseEntretien}
            sauvegarderVersionEditee={sauvegarderVersionEditee}
            messageSynthese={messageSynthese}
            historiqueSynthese={historiqueSynthese}
            restaurerVersion={restaurerVersion}
          />
        )
      case 'Compte rendu':
        return (
          <CompteRenduSection
            verifierCompteRendu={verifierCompteRendu}
            versionFinaleCompteRendu={versionFinaleCompteRendu}
            compteRenduVerrouille={compteRenduVerrouille}
            creerNouvelleVersionCompteRendu={creerNouvelleVersionCompteRendu}
            compteRenduMessage={compteRenduMessage}
            compteRenduVersionCourante={compteRenduVersionCourante}
            COMPTE_RENDU_STRUCTURE={COMPTE_RENDU_STRUCTURE}
            compteRenduSections={compteRenduSections}
            updateCompteRenduSection={updateCompteRenduSection}
            compteRenduHistorique={compteRenduHistorique}
            restaurerVersionCompteRendu={restaurerVersionCompteRendu}
            analyseCompteRendu={analyseCompteRendu}
          />
        )
      case 'MAP':
        return (
          <Stack spacing={1.25}>
            <Typography variant="body2">MAP : {demandeur.simulateurDecision?.map || 'Non renseignée'}</Typography>
            <Typography variant="body2">Fréquence de suivi : {demandeur.simulateurDecision?.frequenceSuivi || 'Non renseignée'}</Typography>
            <Typography variant="body2">Échéance : {demandeur.simulateurDecision?.echeance || 'Non renseignée'}</Typography>
            <Typography variant="body2">Partenaires : {demandeur.simulateurDecision?.partenaires?.length > 0 ? demandeur.simulateurDecision.partenaires.join(', ') : 'Aucun partenaire sélectionné.'}</Typography>
          </Stack>
        )
      case 'Actions':
        return (
          <Stack spacing={0.75}>
            {actionsAnalyse.length > 0 ? (
              actionsAnalyse.map((action) => (
                <Typography key={action.id} variant="body2">• {action.libelle}</Typography>
              ))
            ) : (
              <Typography variant="body2">Aucune action prioritaire identifiée.</Typography>
            )}
          </Stack>
        )
      case 'Documents':
        return (
          <Stack spacing={1.25}>
            <Typography variant="body2">Formations : {demandeur.formations.length > 0 ? demandeur.formations.join(', ') : 'Aucune formation en cours.'}</Typography>
            <Typography variant="body2">Convocations : {demandeur.convocations.length > 0 ? demandeur.convocations.join(', ') : 'Aucune convocation enregistrée.'}</Typography>
            <Typography variant="body2">Prestations : {prestationsDossier.length > 0 ? prestationsDossier.map((item) => item.libelle).join(', ') : 'Aucune prestation enregistrée.'}</Typography>
          </Stack>
        )
      default:
        return null
    }
  }

  const appliquerScenarioFinal = () => {
    if (!demandeur || !selectedScenarioId) return

    const scenario = scenarios.find((item) => item.id === selectedScenarioId)
    if (!scenario) return

    const scenarioPrestations = (scenario.prestations || []).map((item, index) =>
      normalizePrestation(item, index, 'scenario')
    )
    const scenarioPartenaires = (scenario.partenaires || []).map((item, index) =>
      normalizePartenaire(item, index, 'scenario')
    )

    setDemandeur((prev) => {
      if (!prev) return prev

      const notePartenaires = `Partenaires mobilisés (${scenario.nom}) : ${scenarioPartenaires.map((item) => item.nom).join(', ')}`
      const convocations =
        scenarioPartenaires.length > 0
          ? Array.from(new Set([...(prev.convocations || []), notePartenaires]))
          : [...(prev.convocations || [])]

      return {
        ...prev,
        portefeuille: scenario.typeAccompagnement,
        prestations: scenarioPrestations.map((item) => item.libelle),
        formations: scenario.formation && scenario.formation !== 'Aucune' ? [scenario.formation] : [],
        convocations,
        simulateurDecision: {
          scenarioId: scenario.id,
          scenarioNom: scenario.nom,
          map: scenario.map,
          frequenceSuivi: scenario.frequenceSuivi,
          echeance: scenario.echeance,
          partenaires: scenarioPartenaires.map((item) => item.nom),
          typeAccompagnement: scenario.typeAccompagnement,
        },
      }
    })

    setDossierVersion((previous) => previous + 1)
    setDecisionFinaleMessage(`${scenario.nom} appliqué comme décision finale. Dossier mis à jour automatiquement.`)
  }

  if (!id) {
    return (
      <section className="page-card">
        <div className="page-title">
          <div>
            <h2>Accueil & DPA</h2>
            <p>Liste des demandeurs et accès rapide aux fiches.</p>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Dossier</th>
                <th>Portefeuille</th>
                <th>Recherche d'emploi</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {demandeurs.map((item) => (
                <tr key={item.id}>
                  <td>Dossier anonyme #{String(item.id).padStart(3, '0')}</td>
                  <td>{item.portefeuille}</td>
                  <td>{item.rechercheEmploi}</td>
                  <td>
                    <Link to={`/demandeurs/${item.id}`}>Voir</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  if (!demandeur) {
    return (
      <section className="page-card">
        <div className="page-title">
          <div>
            <h2>Fiche demandeur</h2>
            <p>Demandeur introuvable dans les données fictives.</p>
          </div>
        </div>
        <div className="page-panel">
          <p>Veuillez sélectionner un demandeur valide depuis la liste.</p>
        </div>
      </section>
    )
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Stack spacing={2}>
        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
              <Stack spacing={0.5}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Fiche dossier demandeur</Typography>
                <Typography variant="body2" color="text.secondary">Analyse anonymisée - aide à la décision uniquement</Typography>
              </Stack>
              <Button component={Link} to="/demandeurs" variant="text">Retour à la liste</Button>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6} md={2.4}><Typography variant="caption" color="text.secondary">Identifiant FT</Typography><Typography variant="body2">{demandeur.identifiantFt || `ANON-${String(demandeur.id || '').padStart(3, '0')}`}</Typography></Grid>
              <Grid item xs={12} sm={6} md={2.4}><Typography variant="caption" color="text.secondary">Nom et prénom</Typography><Typography variant="body2">{`${demandeur.prenom || 'Non renseigné'} ${demandeur.nom || ''}`.trim()}</Typography></Grid>
              <Grid item xs={12} sm={6} md={2.4}><Typography variant="caption" color="text.secondary">Type d'entretien</Typography><Typography variant="body2">{demandeur.simulateurDecision?.scenarioNom || 'Suivi'}</Typography></Grid>
              <Grid item xs={12} sm={6} md={2.4}><Typography variant="caption" color="text.secondary">Durée de l'entretien</Typography><Typography variant="body2">{demandeur.simulateurDecision?.frequenceSuivi || '30 min'}</Typography></Grid>
              <Grid item xs={12} sm={6} md={2.4}><Typography variant="caption" color="text.secondary">Statut du dossier</Typography><Chip size="small" label={demandeur.contratEngagement === 'Oui' ? 'Actif' : 'À sécuriser'} /></Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Situation</Typography>
                <Stack spacing={0.75}>
                  <Typography variant="body2">RSA: {demandeur.rsa ? 'Oui' : 'Non'}</Typography>
                  <Typography variant="body2">Portefeuille: {demandeur.portefeuille || 'Non renseigné'}</Typography>
                  <Typography variant="body2">Situation actuelle: {demandeur.rechercheEmploi || 'Non renseignée'}</Typography>
                  <Typography variant="body2">Dernière actualisation: {demandeur.dernierEntretien || 'Non renseignée'}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Projet</Typography>
                <Stack spacing={0.75}>
                  <Typography variant="body2">Projet professionnel: {demandeur.projetProfessionnel || 'À définir'}</Typography>
                  <Typography variant="body2">Métier recherché: {demandeur.projetProfessionnel || 'Non renseigné'}</Typography>
                  <Typography variant="body2">Formation: {demandeur.formations.length > 0 ? demandeur.formations.join(', ') : 'Aucune'}</Typography>
                  <Typography variant="body2">Niveau d'autonomie: {demandeur.cvVisible ? 'Autonome' : 'À renforcer'}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Vigilances</Typography>
                <Stack spacing={0.75}>
                  <Typography variant="body2">Mobilité: {demandeur.mobilite || 'Non renseignée'}</Typography>
                  <Typography variant="body2">Santé: {demandeur.reconnaissanceTH ? 'Signalée' : 'Non renseignée'}</Typography>
                  <Typography variant="body2">Numérique: {freins.find((item) => item.toLowerCase().includes('numérique')) || 'RAS'}</Typography>
                  <Typography variant="body2">Freins prioritaires: {freins.length > 0 ? freins.slice(0, 2).join(' | ') : 'Aucun'}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Assistant d'entretien</Typography>
                <Typography variant="body2" sx={{ mb: 1.25 }}>
                  {questionCourante || 'Aucune question disponible.'}
                </Typography>
                <TextField
                  label="Réponse"
                  value={entretienReponses[entretienQuestionIndex] || ''}
                  onChange={(event) =>
                    setEntretienReponses((prev) => ({
                      ...prev,
                      [entretienQuestionIndex]: event.target.value,
                    }))
                  }
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  sx={{ mb: 1.25 }}
                />
                <TextField
                  label="Notes"
                  value={entretienNotes}
                  onChange={(event) => setEntretienNotes(event.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setEntretienQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={entretienQuestionIndex === 0}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setEntretienQuestionIndex((prev) => Math.min(questionsEntretien.length - 1, prev + 1))}
                    disabled={questionsEntretien.length === 0 || entretienQuestionIndex >= questionsEntretien.length - 1}
                  >
                    Suivant
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Assistant métier</Typography>
                {assistantMetierCards.map((card) => (
                  <Accordion
                    key={card.key}
                    disableGutters
                    expanded={Boolean(assistantMetierExpanded[card.key])}
                    onChange={(_, expanded) =>
                      setAssistantMetierExpanded((prev) => ({ ...prev, [card.key]: expanded }))
                    }
                    sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 1 }}
                  >
                    <AccordionSummary>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{card.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={0.5}>
                        {card.content.map((line, index) => (
                          <Typography key={`${card.key}-${index}`} variant="caption">{line}</Typography>
                        ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 1.5 }}
            >
              {tabsLigne4.map((tab) => (
                <Tab key={tab} label={tab} value={tab} />
              ))}
            </Tabs>
            <Box>{renderLigne4Content()}</Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  )
}

export default DemandeurPage
