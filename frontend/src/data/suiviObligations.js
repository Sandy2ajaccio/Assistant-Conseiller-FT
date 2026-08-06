export const DATE_ENTREE_VIGUEUR_SANCTIONS = '2025-06-01'

export const SOURCES_SANCTIONS = [
  {
    label: 'Décret n° 2025-478 du 30 mai 2025',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000051672648/',
  },
  {
    label: 'Code du travail — articles R. 5412-1 à R. 5412-3-4',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/LEGISCTA000051678147/',
  },
  {
    label: 'Code de l’action sociale et des familles — article R. 262-68',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000028251808',
  },
  {
    label: 'CASF — article R. 262-68-7 (RSA hors droits et devoirs)',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051678839',
  },
]

export const SITUATIONS_DROITS = [
  { value: 'a-confirmer', label: 'Situation à confirmer' },
  { value: 'droit-ouvert', label: 'Revenu de remplacement ou allocation ouvert' },
  { value: 'rsa-droits-devoirs', label: 'RSA soumis aux droits et devoirs' },
  { value: 'rsa-hors-droits-devoirs', label: 'RSA non soumis aux droits et devoirs' },
  { value: 'sans-droit', label: 'Sans revenu de remplacement, allocation ni RSA' },
]

export const FAITS_SUIVI = [
  { value: 'aucun', label: 'Aucun fait à signaler', codeInterne: '' },
  {
    value: 'obligations-contrat',
    label: 'Manquement possible aux obligations du contrat d’engagement',
    codeInterne: 'M6_1',
  },
  {
    value: 'refus-contrat',
    label: 'Refus possible d’élaborer ou d’actualiser le contrat d’engagement',
    codeInterne: 'M6_3 / M6_4',
  },
  {
    value: 'non-respect-prp',
    label: 'Non-respect possible du projet de reconversion professionnelle',
    codeInterne: 'M6_2',
  },
  {
    value: 'second-refus-ore',
    label: 'Second refus possible d’une offre raisonnable d’emploi',
    codeInterne: 'M6_6',
  },
  {
    value: 'fraude-fausse-declaration',
    label: 'Suspicion de fraude ou de fausse déclaration',
    codeInterne: 'M6_5',
  },
  {
    value: 'activite-courte-non-declaree',
    label: 'Activité de très courte durée possiblement non déclarée',
    codeInterne: 'M6_7',
  },
]

export const RECURRENCES = [
  { value: 'a-confirmer', label: 'Rang à confirmer' },
  { value: 'premier', label: 'Premier fait constaté' },
  { value: 'persistance-reiteration', label: 'Persistance ou réitération' },
]

export const MOTIFS_LEGITIMES = [
  { value: 'a-evaluer', label: 'Motif légitime à rechercher' },
  { value: 'signale', label: 'Motif légitime signalé — à instruire' },
  { value: 'non-signale', label: 'Aucun motif légitime signalé à ce stade' },
]

export const DEFAULT_SUIVI_OBLIGATIONS = {
  fait: 'aucun',
  situationDroits: 'a-confirmer',
  recurrence: 'a-confirmer',
  motifLegitime: 'a-evaluer',
  dateConstat: '',
  elementsFactuels: '',
  procedureInterneConfirmee: false,
}

const faitExiste = (value) => FAITS_SUIVI.some((item) => item.value === value)
const situationExiste = (value) => SITUATIONS_DROITS.some((item) => item.value === value)
const recurrenceExiste = (value) => RECURRENCES.some((item) => item.value === value)
const motifExiste = (value) => MOTIFS_LEGITIMES.some((item) => item.value === value)

export const normaliserSuiviObligations = (value = {}) => ({
  ...DEFAULT_SUIVI_OBLIGATIONS,
  ...value,
  fait: faitExiste(value?.fait) ? value.fait : DEFAULT_SUIVI_OBLIGATIONS.fait,
  situationDroits: situationExiste(value?.situationDroits)
    ? value.situationDroits
    : DEFAULT_SUIVI_OBLIGATIONS.situationDroits,
  recurrence: recurrenceExiste(value?.recurrence)
    ? value.recurrence
    : DEFAULT_SUIVI_OBLIGATIONS.recurrence,
  motifLegitime: motifExiste(value?.motifLegitime)
    ? value.motifLegitime
    : DEFAULT_SUIVI_OBLIGATIONS.motifLegitime,
  dateConstat: String(value?.dateConstat || '').trim(),
  elementsFactuels: String(value?.elementsFactuels || '').trim(),
  procedureInterneConfirmee: value?.procedureInterneConfirmee === true,
})

export const getFaitSuivi = (value) => (
  FAITS_SUIVI.find((item) => item.value === value) || FAITS_SUIVI[0]
)

const reperesJuridiques = {
  'obligations-contrat': {
    texte: 'Le droit national prévoit une suspension-remobilisation graduée, sauf motif légitime. Le taux et la durée dépendent des faits et de la situation ; aucune valeur ne doit être déduite automatiquement.',
    references: 'C. trav., R. 5412-1 ; CASF, R. 262-68-1',
  },
  'refus-contrat': {
    texte: 'Le refus d’élaborer ou d’actualiser le contrat d’engagement relève d’un régime distinct. Vérifier les démarches déjà accomplies et les réponses aux sollicitations.',
    references: 'C. trav., R. 5412-2 ; CASF, R. 262-68',
  },
  'non-respect-prp': {
    texte: 'Le projet de reconversion professionnelle relève d’un cas spécifique. Confirmer préalablement que le régime PRP est réellement applicable au dossier.',
    references: 'C. trav., R. 5412-1',
  },
  'second-refus-ore': {
    texte: 'Le régime suppose deux refus d’offres raisonnables d’emploi et l’absence de motif légitime. Les deux offres et leur caractère raisonnable doivent être vérifiés.',
    references: 'C. trav., R. 5412-3 ; CASF, R. 262-68-2',
  },
  'fraude-fausse-declaration': {
    texte: 'Une suspicion ne suffit pas à qualifier une fraude ou une fausse déclaration. Transmettre les faits au circuit compétent et ne pas conclure automatiquement.',
    references: 'C. trav., R. 5412-3-1',
  },
  'activite-courte-non-declaree': {
    texte: 'L’activité non déclarée de très courte durée relève d’un régime particulier. Vérifier la durée, la déclaration, la réitération et le circuit compétent.',
    references: 'C. trav., R. 5412-3-2 et R. 5412-3-3',
  },
}

export const genererAlertesSuivi = (value = {}) => {
  const suivi = normaliserSuiviObligations(value)
  if (suivi.fait === 'aucun') return []

  const alertes = []
  const repere = reperesJuridiques[suivi.fait]

  if (repere) {
    alertes.push({
      id: 'repere-juridique',
      niveau: 'info',
      titre: `Repère juridique — ${repere.references}`,
      message: repere.texte,
    })
  }

  if (suivi.situationDroits === 'a-confirmer') {
    alertes.push({
      id: 'droits-a-confirmer',
      niveau: 'warning',
      titre: 'Situation de droits à confirmer',
      message: 'Vérifier le revenu de remplacement, les allocations et le RSA avant d’identifier le circuit compétent.',
    })
  }

  if (suivi.situationDroits === 'rsa-hors-droits-devoirs') {
    alertes.push({
      id: 'rsa-hors-droits-devoirs',
      niveau: 'error',
      titre: 'Ne pas appliquer le circuit de sanctions RSA du contrat',
      message: 'L’article R. 262-68-7 exclut ce régime pour une personne RSA non soumise aux droits et devoirs. Confirmer tout autre traitement avec la procédure interne.',
    })
  }

  if (suivi.recurrence === 'a-confirmer') {
    alertes.push({
      id: 'recurrence-a-confirmer',
      niveau: 'warning',
      titre: 'Rang du fait à confirmer',
      message: 'Vérifier s’il s’agit d’un premier fait, d’une persistance ou d’une réitération et contrôler les dates des décisions antérieures.',
    })
  }

  if (suivi.motifLegitime === 'a-evaluer') {
    alertes.push({
      id: 'motif-legitime',
      niveau: 'warning',
      titre: 'Motif légitime à rechercher',
      message: 'Recueillir les explications de la personne et les justificatifs avant toute transmission ou qualification.',
    })
  }

  if (!suivi.dateConstat) {
    alertes.push({
      id: 'date-manquante',
      niveau: 'warning',
      titre: 'Date du fait manquante',
      message: 'La date est nécessaire pour vérifier la règle applicable et le caractère répété du fait.',
    })
  }

  if (!suivi.elementsFactuels) {
    alertes.push({
      id: 'faits-manquants',
      niveau: 'warning',
      titre: 'Éléments factuels à documenter',
      message: 'Décrire uniquement les faits constatés, les échanges, les convocations, les réponses et les pièces disponibles.',
    })
  }

  if (!suivi.procedureInterneConfirmee) {
    alertes.push({
      id: 'procedure-interne',
      niveau: 'error',
      titre: 'Procédure interne France Travail non confirmée',
      message: 'Consulter la procédure M6 en vigueur et le barème Corse actualisé avant toute action. Le support fourni est daté du 1er juin 2025.',
    })
  }

  return alertes
}

export const compterAlertesActionnables = (value = {}) => (
  genererAlertesSuivi(value).filter((alerte) => alerte.niveau !== 'info').length
)
