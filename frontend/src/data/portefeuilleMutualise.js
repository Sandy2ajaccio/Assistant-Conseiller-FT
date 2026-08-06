export const NOM_PORTEFEUILLE_MUTUALISE = 'Mutualisé'
export const DATE_CONSIGNES_PORTEFEUILLE = '2026-08-06'

export const ACTIONS_MUTUALISEES = {
  rdvVisio: 'Programmer le rendez-vous en visioconférence',
  emailRdvEnLigne: 'Envoyer l’information sur la prise de rendez-vous en ligne',
  contactAjaccioEmSite: 'Préciser le contact Ajaccio EM et le passage par le site',
  gpfCollective: 'Programmer la GPF collective en visio tous les 15 jours (durée 1 heure)',
  accompagnementPresente: 'Présenter l’accompagnement et le PRDVL',
  cvmPresente: 'Présenter le CVM',
  droitsEngagementsPresentes: 'Présenter les droits et les engagements',
  edpSaisi: 'Saisir un entretien EDP type',
  contratEngagementSaisi: 'Saisir ou actualiser le contrat d’engagement',
  atelierOdsSas: 'Proposer l’atelier ODS puis SAS',
  prdvlVerifie: 'Vérifier le PRDVL',
  cessationInscriptionVerifiee: 'Vérifier la cessation d’inscription',
  mecMerRealisee: 'Réaliser la MEC/MER adaptée (offre d’emploi ou IA selon la situation)',
  pointTelephonique: 'Réaliser un point téléphonique',
  orientationCessation: 'Orienter vers la cessation d’inscription si elle est confirmée',
  rdvAnnulesTraites: 'Traiter ensuite les rendez-vous annulés au cas par cas',
  ceSigneVerifie: 'Vérifier que le contrat d’engagement est signé',
  parcoursRenseigne: 'Mettre à jour le parcours manquant',
  sireaConsulte: 'Consulter SIREA',
  activiteDistribuee: 'Distribuer ou affecter l’activité appropriée',
  escaladeTracee: 'Tracer et transmettre l’escalade',
  faitDocumente: 'Documenter le fait et les éléments disponibles',
  excuseVerifiee: 'Vérifier l’excuse ou le motif légitime',
  commentaireDecision: 'Renseigner le commentaire demandé',
  rdvRemobilisation: 'Programmer ou tracer la remobilisation',
  suiviM6Ouvert: 'Ouvrir et compléter le suivi M6',
  reponseAvertissement: 'Analyser et tracer la réponse à l’avertissement',
  suiviM6Actualise: 'Actualiser le suivi M6 après la réponse ou l’échéance',
}

export const FILES_PORTEFEUILLE_MUTUALISE = [
  {
    value: 'a-examiner',
    label: 'À examiner / à traiter',
    description: 'Dossier entrant dont la file de travail reste à déterminer.',
    actions: [],
  },
  {
    value: 'rdvl',
    label: 'RDVL',
    description: 'Rendez-vous en visio et information sur la prise de rendez-vous en ligne.',
    actions: ['rdvVisio', 'emailRdvEnLigne', 'contactAjaccioEmSite'],
    convocation: true,
  },
  {
    value: 'attente-premier-entretien',
    label: 'En attente de premier entretien',
    description: 'GPF collective en visio et formalisation du premier entretien.',
    actions: [
      'gpfCollective',
      'accompagnementPresente',
      'cvmPresente',
      'droitsEngagementsPresentes',
      'edpSaisi',
      'contratEngagementSaisi',
    ],
    convocation: true,
  },
  {
    value: 'sans-entretien-action-activite',
    label: 'Sans entretien, sans action et sans activité',
    description: 'Sécuriser la situation, engager une action et vérifier la cessation d’inscription.',
    actions: [
      'atelierOdsSas',
      'prdvlVerifie',
      'cessationInscriptionVerifiee',
      'contratEngagementSaisi',
      'mecMerRealisee',
      'pointTelephonique',
      'orientationCessation',
      'rdvAnnulesTraites',
    ],
    convocation: true,
  },
  {
    value: 'parcours-a-mettre-a-jour',
    label: 'Parcours à mettre à jour',
    description: 'Contrat d’engagement signé mais parcours non renseigné.',
    actions: ['ceSigneVerifie', 'parcoursRenseigne'],
  },
  {
    value: 'a-p',
    label: 'A&P / activités diverses',
    description: 'Consulter SIREA et distribuer l’activité sur les conseillers concernés.',
    actions: ['sireaConsulte', 'activiteDistribuee'],
  },
  {
    value: 'escalade',
    label: 'Escalade',
    description: 'Tracer l’objet, le destinataire et la transmission de l’escalade.',
    actions: ['escaladeTracee'],
  },
  {
    value: 'a-avertir',
    label: 'Focale — personne à avertir',
    description: 'Absence, fin de sanction sans remobilisation ou contrat non signé : instruire avant toute action.',
    actions: ['faitDocumente', 'excuseVerifiee', 'commentaireDecision', 'rdvRemobilisation', 'suiviM6Ouvert'],
    convocation: true,
    suiviM6: true,
  },
  {
    value: 'attente-suite-avertissement',
    label: 'Focale — attente après avertissement',
    description: 'Avertissement envoyé : attendre, analyser et tracer la réponse ou l’absence de réponse.',
    actions: ['reponseAvertissement', 'suiviM6Actualise'],
    suiviM6: true,
  },
  {
    value: 'termine',
    label: 'Traité',
    description: 'Toutes les actions utiles ont été réalisées et tracées.',
    actions: [],
  },
]

export const MOTIFS_FOCALE = [
  { value: 'a-confirmer', label: 'Motif à confirmer' },
  { value: 'absence-rdv', label: 'Absence à un rendez-vous' },
  { value: 'fin-sanction-sans-remobilisation', label: 'Fin de sanction sans remobilisation' },
  { value: 'contrat-non-signe', label: 'Contrat d’engagement non signé' },
  { value: 'autre', label: 'Autre situation à instruire' },
]

export const STATUTS_ABSENCE = [
  { value: 'non-concerne', label: 'Non concerné' },
  { value: 'a-verifier', label: 'Absence ou justification à vérifier' },
  { value: 'excusee', label: 'Absence excusée — nouveau rendez-vous à organiser' },
  { value: 'non-justifiee', label: 'Absence non justifiée à ce stade — procédure à instruire' },
]

export const DEFAULT_SUIVI_PORTEFEUILLE_MUTUALISE = {
  file: 'a-examiner',
  dateConvocation: '',
  dateRendezVous: '',
  modaliteRendezVous: 'visio',
  motifFocale: 'a-confirmer',
  statutAbsence: 'non-concerne',
  dateAvertissement: '',
  commentaire: '',
  actionsRealisees: {},
  procedureInterneConfirmee: false,
}

export const getFilePortefeuilleMutualise = (value) => (
  FILES_PORTEFEUILLE_MUTUALISE.find((item) => item.value === value)
  || FILES_PORTEFEUILLE_MUTUALISE[0]
)

export const normaliserSuiviPortefeuilleMutualise = (value = {}) => {
  const file = getFilePortefeuilleMutualise(value?.file)
  return {
    ...DEFAULT_SUIVI_PORTEFEUILLE_MUTUALISE,
    ...value,
    file: file.value,
    dateConvocation: String(value?.dateConvocation || '').trim(),
    dateRendezVous: String(value?.dateRendezVous || '').trim(),
    dateAvertissement: String(value?.dateAvertissement || '').trim(),
    commentaire: String(value?.commentaire || '').trim(),
    actionsRealisees: Object.fromEntries(
      Object.entries(value?.actionsRealisees || {}).map(([key, checked]) => [key, checked === true]),
    ),
    procedureInterneConfirmee: value?.procedureInterneConfirmee === true,
  }
}

const calculerDelaiJours = (dateDebut, dateFin) => {
  if (!dateDebut || !dateFin) return null
  const debut = new Date(`${dateDebut}T12:00:00`)
  const fin = new Date(`${dateFin}T12:00:00`)
  if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime())) return null
  return Math.round((fin.getTime() - debut.getTime()) / (24 * 60 * 60 * 1000))
}

export const genererAlertesPortefeuilleMutualise = (value = {}) => {
  const suivi = normaliserSuiviPortefeuilleMutualise(value)
  const file = getFilePortefeuilleMutualise(suivi.file)
  if (file.value === 'a-examiner') {
    return [{
      id: 'file-a-definir',
      niveau: 'warning',
      titre: 'File de travail à définir',
      message: 'Classer le dossier dans une file du portefeuille mutualisé avant de le clôturer.',
    }]
  }
  if (file.value === 'termine') return []

  const alertes = []
  file.actions.forEach((actionId) => {
    if (suivi.actionsRealisees[actionId] !== true) {
      alertes.push({
        id: `action-${actionId}`,
        niveau: 'warning',
        titre: 'Action à réaliser',
        message: ACTIONS_MUTUALISEES[actionId],
      })
    }
  })

  if (file.convocation) {
    const delai = calculerDelaiJours(suivi.dateConvocation, suivi.dateRendezVous)
    if (delai === null) {
      alertes.push({
        id: 'dates-convocation',
        niveau: 'warning',
        titre: 'Dates de convocation à renseigner',
        message: 'Renseigner la date d’envoi et la date du rendez-vous pour vérifier le délai de 10 à 15 jours.',
      })
    } else if (delai < 10 || delai > 15) {
      alertes.push({
        id: 'delai-convocation',
        niveau: 'warning',
        titre: `Délai de convocation : ${delai} jour(s)`,
        message: 'La consigne interne reçue prévoit une convocation 10 à 15 jours avant le rendez-vous. Confirmer toute dérogation.',
      })
    }
  }

  if (file.value === 'rdvl' && suivi.modaliteRendezVous !== 'visio') {
    alertes.push({
      id: 'rdvl-visio',
      niveau: 'warning',
      titre: 'Modalité RDVL à vérifier',
      message: 'La consigne du portefeuille mutualisé prévoit les RDVL en visioconférence.',
    })
  }

  if (file.suiviM6) {
    alertes.push({
      id: 'aucune-sanction-automatique',
      niveau: 'info',
      titre: 'Aucune sanction automatique',
      message: 'Documenter les faits, rechercher le motif légitime, organiser la remobilisation et utiliser le suivi M6 avant toute transmission.',
    })
    if (!suivi.procedureInterneConfirmee) {
      alertes.push({
        id: 'procedure-interne',
        niveau: 'error',
        titre: 'Procédure interne à confirmer',
        message: 'Vérifier la consigne M6 et le circuit applicable avant toute action liée à un avertissement ou à une sanction.',
      })
    }
  }

  if (file.value === 'a-avertir') {
    if (suivi.motifFocale === 'a-confirmer') {
      alertes.push({
        id: 'motif-focale',
        niveau: 'warning',
        titre: 'Motif de la focale à confirmer',
        message: 'Préciser s’il s’agit d’une absence, d’une fin de sanction sans remobilisation, d’un contrat non signé ou d’un autre fait.',
      })
    }
    if (suivi.statutAbsence === 'a-verifier') {
      alertes.push({
        id: 'absence-a-verifier',
        niveau: 'warning',
        titre: 'Excuse et motif légitime à vérifier',
        message: 'Si l’absence est excusée, organiser un nouveau rendez-vous ; sinon instruire les faits dans le suivi M6.',
      })
    }
    if (suivi.motifFocale === 'absence-rdv' && suivi.statutAbsence === 'non-concerne') {
      alertes.push({
        id: 'statut-absence',
        niveau: 'warning',
        titre: 'Statut de l’absence à renseigner',
        message: 'Préciser si l’absence est excusée ou reste non justifiée à ce stade.',
      })
    }
  }

  if (file.value === 'attente-suite-avertissement' && !suivi.dateAvertissement) {
    alertes.push({
      id: 'date-avertissement',
      niveau: 'warning',
      titre: 'Date d’avertissement manquante',
      message: 'Renseigner la date d’envoi afin de suivre la réponse attendue et les échéances internes.',
    })
  }

  if (['a-avertir', 'attente-suite-avertissement', 'escalade'].includes(file.value) && !suivi.commentaire) {
    alertes.push({
      id: 'commentaire-manquant',
      niveau: 'warning',
      titre: 'Commentaire de suivi à renseigner',
      message: 'Tracer les faits, la décision humaine, le destinataire et la prochaine action.',
    })
  }

  return alertes
}

export const compterAlertesPortefeuilleMutualise = (value = {}) => (
  genererAlertesPortefeuilleMutualise(value).filter((alerte) => alerte.niveau !== 'info').length
)
