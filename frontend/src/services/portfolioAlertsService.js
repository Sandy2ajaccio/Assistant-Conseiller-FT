const text = (value) => String(value ?? '').trim()

const normalize = (value) => text(value)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[’']/g, ' ')

const parseDate = (value) => {
  const raw = text(value)
  if (!raw) return null
  const french = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (french) {
    const year = Number(french[3].length === 2 ? `20${french[3]}` : french[3])
    const parsed = new Date(year, Number(french[2]) - 1, Number(french[1]), 12)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const daysUntil = (value, now = new Date()) => {
  const target = parseDate(value)
  if (!target) return null
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

const addAlert = (alerts, alert) => {
  if (!alerts.some((item) => item.id === alert.id)) alerts.push(alert)
}

const alertFromDate = ({ alerts, id, label, value, now }) => {
  const days = daysUntil(value, now)
  if (days === null || days > 7) return
  if (days < 0) {
    addAlert(alerts, {
      id: `${id}-overdue`,
      niveau: 'error',
      priorite: 100,
      titre: `${label} dépassé${label.endsWith('e') ? 'e' : ''} de ${Math.abs(days)} jour(s)`,
      action: 'Traiter le dossier et tracer immédiatement la suite donnée.',
    })
  } else if (days === 0) {
    addAlert(alerts, {
      id: `${id}-today`,
      niveau: 'error',
      priorite: 95,
      titre: `${label} aujourd’hui`,
      action: 'Réaliser l’action prévue ou reprogrammer une date et la tracer.',
    })
  } else {
    addAlert(alerts, {
      id: `${id}-soon`,
      niveau: 'warning',
      priorite: 75 - days,
      titre: `${label} dans ${days} jour(s)`,
      action: 'Préparer l’action et vérifier que les éléments nécessaires sont disponibles.',
    })
  }
}

const hasAction = (record) => [
  record.action,
  record.actionRealisee,
  record.prestation,
  record.atelier,
  record.formation,
  record.decision,
].some((value) => text(value))

const profiles = (record) => new Set(
  Array.isArray(record.profils)
    ? record.profils
    : text(record.profils).split(/[;,|]/).map((item) => item.trim()).filter(Boolean),
)

export const generatePortfolioAlerts = (record = {}, now = new Date()) => {
  const alerts = []
  const combined = normalize([
    record.alerte,
    record.motif,
    record.statut,
    record.commentaires,
    record.historiqueAppels,
    record.historiqueMails,
    record.historiqueEntretiens,
    record.historiqueCourriers,
  ].filter(Boolean).join(' '))
  const codeOp2 = text(record.codeSituationOp2).toUpperCase()
  const recordProfiles = profiles(record)

  if (codeOp2 === 'IA') {
    addAlert(alerts, {
      id: 'ia-ne-pas-convoquer',
      niveau: 'error',
      priorite: 120,
      titre: 'IA — ne jamais convoquer',
      action: 'Vérifier les informations dans l’accompagnement avant toute action.',
    })
  }

  if (/absence|avertissement|manquement|fin de sanction|sanction/.test(combined)) {
    addAlert(alerts, {
      id: 'm6-a-verifier',
      niveau: 'error',
      priorite: 115,
      titre: 'Situation M6 à vérifier',
      action: 'Documenter les faits, vérifier l’excuse et la procédure interne. Aucune sanction automatique.',
    })
  } else if (text(record.alerte)) {
    addAlert(alerts, {
      id: 'alerte-importee',
      niveau: 'warning',
      priorite: 85,
      titre: text(record.alerte),
      action: 'Ouvrir le dossier, vérifier l’alerte importée et tracer l’action retenue.',
    })
  }

  alertFromDate({ alerts, id: 'rappel', label: 'Rappel', value: record.dateRappel, now })
  alertFromDate({ alerts, id: 'echeance', label: 'Échéance', value: record.echeance, now })

  const remaining = Number(String(record.joursRestants ?? '').replace(',', '.'))
  if (Number.isFinite(remaining) && text(record.joursRestants)) {
    if (remaining <= 0) {
      addAlert(alerts, {
        id: 'delai-epuise',
        niveau: 'error',
        priorite: 98,
        titre: 'Délai arrivé à échéance',
        action: 'Vérifier l’action attendue et actualiser l’échéance du dossier.',
      })
    } else if (remaining <= 7) {
      addAlert(alerts, {
        id: 'delai-court',
        niveau: 'warning',
        priorite: 76 - remaining,
        titre: `${remaining} jour(s) restant(s)`,
        action: 'Préparer ou relancer l’action avant l’échéance.',
      })
    }
  }

  if (/^(oui|o|x|a rappeler|à rappeler)$/i.test(text(record.aRappeler)) && !text(record.dateRappel)) {
    addAlert(alerts, {
      id: 'rappel-sans-date',
      niveau: 'warning',
      priorite: 80,
      titre: 'Rappel demandé sans date',
      action: 'Fixer une date de rappel et préciser l’objectif du contact.',
    })
  }

  if (!text(record.civilite)) {
    addAlert(alerts, {
      id: 'civilite-manquante',
      niveau: 'warning',
      priorite: 84,
      titre: 'Civilité à renseigner',
      action: 'Choisir Mr ou Mme dans le dossier afin de compléter les renseignements du DE.',
    })
  }

  const contract = normalize(record.contratEngagement)
  if (!contract) {
    addAlert(alerts, {
      id: 'contrat-a-verifier',
      niveau: 'warning',
      priorite: 64,
      titre: 'Contrat d’engagement à vérifier',
      action: 'Vérifier s’il est signé, à actualiser ou à finaliser.',
    })
  } else if (/non signe|a signer|signature a finaliser|absent/.test(contract)) {
    addAlert(alerts, {
      id: 'contrat-incomplet',
      niveau: 'warning',
      priorite: 82,
      titre: 'Contrat d’engagement non finalisé',
      action: 'Présenter ou finaliser le contrat, puis tracer la situation.',
    })
  }

  if (!text(record.parcoursProfessionnel)) {
    addAlert(alerts, {
      id: 'parcours-manquant',
      niveau: 'warning',
      priorite: 62,
      titre: 'Parcours à mettre à jour',
      action: 'Compléter le parcours professionnel et le projet du DE.',
    })
  }

  if (!hasAction(record)) {
    addAlert(alerts, {
      id: 'action-manquante',
      niveau: 'warning',
      priorite: 60,
      titre: 'Aucune action tracée',
      action: 'Définir la prochaine action utile et son échéance.',
    })
  } else if ((record.prestation || record.atelier || record.formation) && !record.echeance && !record.statut) {
    addAlert(alerts, {
      id: 'action-suivi-incomplet',
      niveau: 'warning',
      priorite: 58,
      titre: 'Suivi de l’action à compléter',
      action: 'Renseigner le statut ou l’échéance de la prestation, de l’atelier ou de la formation.',
    })
  }

  const retirementDays = daysUntil(record.dateRetraitePrevisionnelle, now)
  if (retirementDays !== null && retirementDays >= 0 && retirementDays <= 365) {
    addAlert(alerts, {
      id: 'retraite-proche',
      niveau: retirementDays <= 183 ? 'error' : 'warning',
      priorite: retirementDays <= 183 ? 90 : 68,
      titre: retirementDays <= 183 ? 'Retraite prévue dans moins de 6 mois' : 'Retraite prévue dans 6 à 12 mois',
      action: 'Vérifier la date, la disponibilité et les actions adaptées à la période restante.',
    })
  }

  const importantBarriers = ['mobilite', 'sante', 'logement', 'garde_enfants', 'numerique', 'francais']
  if (importantBarriers.some((id) => recordProfiles.has(id)) && !hasAction(record)) {
    addAlert(alerts, {
      id: 'frein-sans-solution',
      niveau: 'warning',
      priorite: 72,
      titre: 'Frein déclaré sans solution tracée',
      action: 'Vérifier le frein avec la personne et noter la solution ou l’orientation retenue.',
    })
  }

  if (recordProfiles.has('rqth') && !/cap emploi|handicap|rqth/.test(normalize(`${record.action} ${record.prestation} ${record.commentaires}`))) {
    addAlert(alerts, {
      id: 'handicap-a-verifier',
      niveau: 'warning',
      priorite: 70,
      titre: 'Situation de handicap à actualiser',
      action: 'Vérifier les besoins, les aménagements et l’appui mobilisable, sans orientation automatique.',
    })
  }

  return alerts.sort((a, b) => b.priorite - a.priorite)
}

export const getPortfolioAlertSummary = (records = [], now = new Date()) => {
  const details = records.map((record) => ({ record, alerts: generatePortfolioAlerts(record, now) }))
  return {
    details,
    dossiersAvecAlertes: details.filter((item) => item.alerts.length > 0).length,
    dossiersUrgents: details.filter((item) => item.alerts.some((alert) => alert.niveau === 'error')).length,
    dossiersAJour: details.filter((item) => item.alerts.length === 0).length,
    totalAlertes: details.reduce((total, item) => total + item.alerts.length, 0),
  }
}

export default generatePortfolioAlerts
