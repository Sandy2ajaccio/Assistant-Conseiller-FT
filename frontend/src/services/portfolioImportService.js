import * as XLSX from 'xlsx'
import { syncPortfolioToCloud } from './cloudPersistenceService.js'

const IMPORT_STORAGE_KEY = 'cap-decision:portefeuille-imports'
const portefeuilleInitial = []

export const MON_PORTEFEUILLE_LABEL = 'Mon portefeuille'

export const PORTFOLIO_TRACKING_STATUS_OPTIONS = [
  { id: 'a_qualifier', label: 'Non traité / à qualifier', color: '#64748b', background: '#f1f5f9' },
  { id: 'en_cours', label: 'En cours · convocation envoyée', color: '#735c00', background: '#fff7b2' },
  { id: 'realise', label: 'Démarche réalisée', color: '#176b35', background: '#d9f5e3' },
  { id: 'action_requise', label: 'Action requise · choisir la suite', color: '#a32121', background: '#ffe0e0' },
  { id: 'a_reconvoquer', label: 'À reconvoquer', color: '#a32121', background: '#ffe0e0' },
  { id: 'a_avertir', label: 'À avertir · procédure à confirmer', color: '#a32121', background: '#ffe0e0' },
  { id: 'a_signaler_cre', label: 'À signaler au CRE', color: '#a32121', background: '#ffe0e0' },
  { id: 'a_recontacter', label: 'À recontacter', color: '#176b87', background: '#d9f2fc' },
]

export const trackingStatusOption = (status) => PORTFOLIO_TRACKING_STATUS_OPTIONS
  .find((option) => option.id === status) || PORTFOLIO_TRACKING_STATUS_OPTIONS[0]

const normalizeTrackingStatus = (value) => {
  const raw = String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (PORTFOLIO_TRACKING_STATUS_OPTIONS.some((option) => option.id === value)) return value
  if (/reconvoquer/.test(raw)) return 'a_reconvoquer'
  if (/avertir/.test(raw)) return 'a_avertir'
  if (/signaler.*cre/.test(raw)) return 'a_signaler_cre'
  if (/recontacter/.test(raw)) return 'a_recontacter'
  if (/realise/.test(raw)) return 'realise'
  if (/action requise/.test(raw)) return 'action_requise'
  if (/en cours|convocation envoyee/.test(raw)) return 'en_cours'
  return 'a_qualifier'
}

const hexToRgb = (value) => {
  const hex = String(value || '').replace(/^#/, '').slice(-6)
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

export const trackingStatusFromCellStyle = (style = {}) => {
  const fill = style?.fill || style || {}
  const rgb = hexToRgb(fill?.fgColor?.rgb)
  if (rgb) {
    const { r, g, b } = rgb
    if (r >= 190 && g >= 170 && b <= 130) return 'en_cours'
    if (r >= 170 && g <= 130 && b <= 130) return 'action_requise'
    if (b >= 170 && b > r * 1.1 && b >= g) return 'a_recontacter'
    if (g >= 120 && g > r * 1.15 && g > b * 0.8) return 'realise'
  }
  if (fill?.fgColor?.theme === 7) return 'a_recontacter'
  return 'a_qualifier'
}

const trackingStatusForSheetRow = (sheet, rowNumber) => {
  const firstCell = sheet?.[XLSX.utils.encode_cell({ r: rowNumber - 1, c: 0 })]
  return trackingStatusFromCellStyle(firstCell?.s)
}

const rattacherAMonPortefeuille = (record = {}) => ({
  ...record,
  appartientMonPortefeuille: true,
  portefeuilleRattachement: MON_PORTEFEUILLE_LABEL,
})

export const PORTFOLIO_PROFILE_OPTIONS = [
  { id: 'rqth', label: 'RQTH / situation de handicap', group: 'Statuts et indemnisation' },
  { id: 'rsa', label: 'Bénéficiaire du RSA', group: 'Statuts et indemnisation' },
  { id: 'are', label: 'Bénéficiaire de l’ARE', group: 'Statuts et indemnisation' },
  { id: 'ass', label: 'Bénéficiaire de l’ASS', group: 'Statuts et indemnisation' },
  { id: 'non_indemnise', label: 'Non indemnisé', group: 'Statuts et indemnisation' },
  { id: 'csp', label: 'Contrat de sécurisation professionnelle (CSP)', group: 'Statuts et indemnisation' },
  { id: 'brsa_sans_orientation', label: 'BRSA sans orientation enregistrée', group: 'Statuts et indemnisation' },
  { id: 'categorie_1', label: 'Catégorie 1', group: 'Statuts et indemnisation' },
  { id: 'categorie_2', label: 'Catégorie 2', group: 'Statuts et indemnisation' },
  { id: 'categorie_3', label: 'Catégorie 3', group: 'Statuts et indemnisation' },
  { id: 'jeune_moins_26', label: 'Jeune de moins de 26 ans', group: 'Publics et territoires' },
  { id: 'senior_50_plus', label: 'Senior de 50 ans ou plus', group: 'Publics et territoires' },
  { id: 'primo_inscrit', label: 'Primo-inscrit', group: 'Publics et territoires' },
  { id: 'reinscrit_10_ans', label: 'Réinscrit après plus de 10 ans', group: 'Publics et territoires' },
  { id: 'orientation_collectivite', label: 'Orientation Collectivité / Conseil départemental', group: 'Publics et territoires' },
  { id: 'parent_isole', label: 'Parent isolé', group: 'Publics et territoires' },
  { id: 'qpv', label: 'Résident d’un QPV', group: 'Publics et territoires' },
  { id: 'frr', label: 'Résident d’une zone FRR / rurale', group: 'Publics et territoires' },
  { id: 'refugie', label: 'Bénéficiaire d’une protection internationale', group: 'Publics et territoires' },
  { id: 'primo_arrivant', label: 'Primo-arrivant', group: 'Publics et territoires' },
  { id: 'justice', label: 'Public sous main de justice / sortant de détention', group: 'Publics et territoires' },
  { id: 'iae', label: 'Parcours insertion par l’activité économique (IAE)', group: 'Publics et territoires' },
  { id: 'cadre', label: 'Cadre', group: 'Publics et territoires' },
  { id: 'intermittent', label: 'Intermittent du spectacle', group: 'Publics et territoires' },
  { id: 'saisonnier', label: 'Travailleur saisonnier', group: 'Publics et territoires' },
  { id: 'mobilite', label: 'Besoin ou frein de mobilité', group: 'Freins et besoins' },
  { id: 'sante', label: 'Problématique de santé', group: 'Freins et besoins' },
  { id: 'logement', label: 'Difficulté de logement', group: 'Freins et besoins' },
  { id: 'garde_enfants', label: 'Besoin de garde d’enfants', group: 'Freins et besoins' },
  { id: 'numerique', label: 'Difficulté numérique', group: 'Freins et besoins' },
  { id: 'francais', label: 'Besoin en français / FLE', group: 'Freins et besoins' },
  { id: 'confiance', label: 'Manque de confiance en soi', group: 'Freins et besoins' },
  { id: 'psychologue_travail', label: 'Besoin d’un regard de psychologue du travail', group: 'Freins et besoins' },
  { id: 'formation', label: 'Projet de formation', group: 'Projets professionnels' },
  { id: 'reconversion', label: 'Projet de reconversion', group: 'Projets professionnels' },
  { id: 'creation_entreprise', label: 'Création ou reprise d’entreprise', group: 'Projets professionnels' },
  { id: 'international', label: 'Projet de mobilité internationale', group: 'Projets professionnels' },
  { id: 'projet_a_confirmer', label: 'Projet professionnel à confirmer', group: 'Projets professionnels' },
  { id: 'decouverte_metier', label: 'Découverte d’un métier ou secteur', group: 'Projets professionnels' },
  { id: 'immersion_recrutement', label: 'Immersion en vue d’un recrutement', group: 'Projets professionnels' },
  { id: 'metier_tension', label: 'Projet vers un métier en tension', group: 'Projets professionnels' },
  { id: 'contrats_courts', label: 'Enchaînement de contrats courts', group: 'Projets professionnels' },
]

const normalizeHeader = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]/g, '')
  .toLowerCase()

const text = (value) => String(value ?? '').trim()

export const inferImportMotifFromFilename = (filename) => {
  let candidate = text(filename)
    .replace(/\.(?:xlsx?|xlsm|csv)$/i, '')
    .replace(/\s*\(\d+\)\s*$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const genericPrefix = /^(?:convo(?:cation)?s?|liste|fichier|export|import|suivi|portefeuille|demandeurs?(?: d['’]emploi)?|de)\b[\s:.-]*/i
  let previous = ''
  while (candidate && candidate !== previous) {
    previous = candidate
    candidate = candidate.replace(genericPrefix, '').trim()
  }

  const normalized = candidate
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

  if (!normalized || /^(?:r\d+|general|tous|tout)$/.test(normalized)) return ''
  return candidate
}
const normalizeIdentifier = (value) => text(value).toUpperCase().replace(/[^A-Z0-9]/g, '')

export const anonymiserPortfolioRecord = (record = {}) => {
  const {
    nom: _nom,
    prenom: _prenom,
    prénom: _prenomAccentue,
    name: _name,
    firstName: _firstName,
    lastName: _lastName,
    ...recordAnonymise
  } = record || {}
  return recordAnonymise
}
const numberOrEmpty = (value) => {
  const raw = text(value).replace(',', '.')
  if (!raw) return ''
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : ''
}

const readValue = (row, header) => {
  const key = Object.keys(row).find((candidate) => normalizeHeader(candidate) === normalizeHeader(header))
  return key ? text(row[key]) : ''
}

const readFirstValue = (row, headers = []) => {
  for (const header of headers) {
    const value = readValue(row, header)
    if (value) return value
  }
  return ''
}

const cleanImportedValue = (value) => {
  const raw = text(value)
  return /^(?:24|0|n\/a)$/i.test(raw) ? '' : raw
}

const toIsoDate = (year, month, day) => {
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  if (Number.isNaN(date.getTime())
    || date.getUTCFullYear() !== Number(year)
    || date.getUTCMonth() !== Number(month) - 1
    || date.getUTCDate() !== Number(day)) return ''
  return date.toISOString().slice(0, 10)
}

const normalizeImportedDate = (value) => {
  const raw = cleanImportedValue(value)
  if (!raw) return ''
  if (/^\d{5}(?:[.,]\d+)?$/.test(raw)) {
    const serial = Number(raw.replace(',', '.'))
    const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000)
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
  }
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) return toIsoDate(iso[1], iso[2], iso[3])
  const french = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (french) {
    const year = french[3].length === 2 ? `20${french[3]}` : french[3]
    return toIsoDate(year, french[2], french[1])
  }
  return ''
}

const isAffirmative = (value) => /^(oui|o|yes|true|vrai|1|x|bénéficiaire|beneficiaire)$/i.test(text(value))

const PROFILE_IMPORT_COLUMNS = [
  ['rqth', ['RQTH', 'Handicap', 'Situation de handicap']],
  ['rsa', ['RSA', 'Bénéficiaire RSA']],
  ['are', ['ARE', 'Bénéficiaire ARE']],
  ['ass', ['ASS', 'Bénéficiaire ASS']],
  ['non_indemnise', ['Non indemnisé', 'Sans indemnisation']],
  ['csp', ['CSP']],
  ['brsa_sans_orientation', ['BRSA sans orientation', 'RSA sans orientation']],
  ['categorie_1', ['Catégorie 1', 'Cat 1']],
  ['categorie_2', ['Catégorie 2', 'Cat 2']],
  ['categorie_3', ['Catégorie 3', 'Cat 3']],
  ['primo_inscrit', ['Primo-inscrit', 'Primo inscrit']],
  ['reinscrit_10_ans', ['Réinscrit 10 ans', 'Réinscrit après 10 ans']],
  ['orientation_collectivite', ['Orientation Collectivité', 'Orientation Conseil départemental', 'Orientation CTC']],
  ['parent_isole', ['Parent isolé']],
  ['qpv', ['QPV']],
  ['frr', ['FRR', 'ZRR', 'Zone rurale']],
  ['refugie', ['Réfugié', 'Protection internationale', 'BPI']],
  ['primo_arrivant', ['Primo-arrivant']],
  ['justice', ['Main de justice', 'Sortant de détention', 'Justice']],
  ['iae', ['IAE']],
  ['cadre', ['Cadre']],
  ['intermittent', ['Intermittent']],
  ['saisonnier', ['Saisonnier']],
  ['mobilite', ['Mobilité']],
  ['sante', ['Santé']],
  ['logement', ['Logement']],
  ['garde_enfants', ["Garde d'enfants", 'Garde enfants']],
  ['numerique', ['Numérique', 'Illectronisme']],
  ['francais', ['Français', 'FLE']],
  ['confiance', ['Manque de confiance', 'Confiance en soi']],
  ['psychologue_travail', ['Psychologue du travail', 'Regards croisés', 'RGC']],
  ['formation', ['Projet formation']],
  ['reconversion', ['Reconversion']],
  ['creation_entreprise', ['Création entreprise', "Création d'entreprise", 'Reprise entreprise']],
  ['international', ['Mobilité internationale']],
  ['projet_a_confirmer', ['Projet à confirmer', 'Projet non défini']],
  ['decouverte_metier', ['Découverte métier', 'Découverte secteur']],
  ['immersion_recrutement', ['Immersion recrutement', 'Recrutement par immersion']],
  ['metier_tension', ['Métier en tension']],
  ['contrats_courts', ['Contrats courts', 'Petits contrats']],
]

const profileIdsFromText = (value) => {
  const tokens = text(value).split(/[;,|]/).map(normalizeHeader).filter(Boolean)
  return PORTFOLIO_PROFILE_OPTIONS
    .filter((option) => tokens.some((token) => {
      const id = normalizeHeader(option.id)
      const label = normalizeHeader(option.label)
      return token === id || label.includes(token) || token.includes(label)
    }))
    .map((option) => option.id)
}

const readProfiles = (row) => {
  const profiles = new Set(profileIdsFromText(
    readValue(row, 'Profils') || readValue(row, 'Profils et situations') || readValue(row, 'Situation DE'),
  ))
  PROFILE_IMPORT_COLUMNS.forEach(([id, headers]) => {
    if (headers.some((header) => isAffirmative(readValue(row, header)))) profiles.add(id)
  })
  return [...profiles]
}

const normaliserCivilite = (value) => {
  const raw = text(value).toLowerCase()
  if (!raw) return ''
  if (raw.startsWith('mme') || raw.startsWith('mad')) return 'Mme'
  if (raw.startsWith('mr') || raw.startsWith('m.') || raw.startsWith('mons')) return 'Mr'
  return ''
}

export const mapPortfolioRow = (row) => {
  const categorieActuelle = cleanImportedValue(readFirstValue(row, ['Cat.', 'Catégorie', 'Catégorie actuelle']))
  const importedProfiles = new Set(readProfiles(row))
  if (/^[123]$/.test(categorieActuelle)) importedProfiles.add(`categorie_${categorieActuelle}`)
  const prochainJalonBrut = cleanImportedValue(readFirstValue(row, ['Prochain jalon perso.', 'Prochain jalon personnel', 'Prochain jalon']))
  const dateProchainJalon = normalizeImportedDate(prochainJalonBrut)
  const motifProchainJalon = cleanImportedValue(readFirstValue(row, ['Motif prochain jalon', 'Motif du prochain jalon']))
  const dateRappelImportee = normalizeImportedDate(readValue(row, 'Date rappel'))
  const statutSuiviImport = normalizeTrackingStatus(
    readFirstValue(row, ['Statut de suivi', 'Statut import']) || row.__statutSuiviImport,
  )

  return ({
    appartientMonPortefeuille: true,
    portefeuilleRattachement: MON_PORTEFEUILLE_LABEL,
    motifImport: readFirstValue(row, ['Motif particulier (facultatif)', "Objet de l'import", 'Objet import', 'Campagne']) || row.__motifImport || '',
    fichierImport: row.__fichierImport || '',
    statutSuiviImport,
    actionSuiviImport: readFirstValue(row, ['Suite de suivi', 'Action de suivi import']),
    commentaireSuiviImport: readFirstValue(row, ['Commentaire de suivi import', 'Commentaire import']),
    dateSuiviImport: normalizeImportedDate(readFirstValue(row, ['Date de suivi import', 'Date suivi import'])),
    priorite: readValue(row, 'Priorité'),
    civilite: normaliserCivilite(readValue(row, 'Civilité') || readValue(row, 'Civilite')),
    identifiant: normalizeIdentifier(readValue(row, 'Identifiant')),
    age: numberOrEmpty(readValue(row, 'Age') || readValue(row, 'Âge')),
    profils: [...importedProfiles],
    dateNaissance: normalizeImportedDate(readValue(row, 'Date de naissance')),
    dateInscription: normalizeImportedDate(readValue(row, "Date d'inscription")),
    ancienneteInscription: readValue(row, "Ancienneté d'inscription")
      || readValue(row, 'Ancienneté inscription'),
    ancienneteModaliteMois: numberOrEmpty(readValue(row, 'Ancienneté dans la modalité en cours (DE) (mois)')),
    dateDernierContact: normalizeImportedDate(readValue(row, 'Date dernier contact')),
    prochainJalon: dateProchainJalon || prochainJalonBrut,
    dateProchainJalon,
    motifProchainJalon,
    dateConvocation: normalizeImportedDate(readFirstValue(row, ['Date convoc.', 'Date convocation'])),
    nombreActionsConseillees: numberOrEmpty(readValue(row, 'Nb actions conseillées')),
    nombreActionsEnCoursOuTerminees: numberOrEmpty(readValue(row, 'Nb actions en cours ou terminées')),
    statutProfil: cleanImportedValue(readValue(row, 'Statut du profil')),
    dateDerniereModification: normalizeImportedDate(readValue(row, 'Date dernière modification')),
    acteurDerniereModification: cleanImportedValue(readValue(row, 'Acteur dernière modification')),
    oreAContractualiser: cleanImportedValue(readValue(row, 'ORE à contractualiser')),
    consentementPromotionProfil: cleanImportedValue(readValue(row, 'Consentement promotion de profil')),
    commune: cleanImportedValue(readValue(row, 'Commune')),
    canton: cleanImportedValue(readValue(row, 'Canton')),
    categorieActuelle,
    indisponibiliteEnCours: cleanImportedValue(readFirstValue(row, ['Indispo. en cours', 'Indisponibilité en cours'])),
    deldDetld: cleanImportedValue(readFirstValue(row, ['DELD / DETLD', 'DELD/DETLD'])),
    dateRetraitePrevisionnelle: normalizeImportedDate(readValue(row, 'Date de retraite prévisionnelle')
      || readValue(row, 'Date de départ en retraite')),
    telephone: readValue(row, 'Téléphone'),
    aRappeler: readValue(row, 'À rappeler') || (dateRappelImportee ? 'Oui' : ''),
    dateRappel: dateRappelImportee,
  contratEngagement: readValue(row, "Contrat d'engagement"),
  prestation: readValue(row, 'Prestation'),
  atelier: readValue(row, 'Atelier'),
  formation: readValue(row, 'Formation'),
  echeance: readValue(row, 'Échéance'),
  joursRestants: readValue(row, 'Jours restants'),
  alerte: readValue(row, 'Alerte'),
  actionRealisee: readValue(row, 'Action réalisée'),
  historiqueAppels: readValue(row, 'Historique appels'),
  historiqueMails: readValue(row, 'Historique mails'),
  historiqueEntretiens: readValue(row, 'Historique entretiens'),
  historiqueCourriers: readValue(row, 'Historique courriers'),
  dateManquement: readValue(row, 'Date manquement'),
    motif: readValue(row, 'Motif') || motifProchainJalon,
  action: readValue(row, 'Action'),
  statut: readValue(row, 'Statut'),
  decision: readValue(row, 'Décision'),
  commentaires: readValue(row, 'Commentaires'),
  ceQueDitLaPersonne: readValue(row, 'Demande exprimée') || readValue(row, 'Demande du DE'),
  besoinIdentifieConseiller: readValue(row, 'Besoin conseiller') || readValue(row, 'Besoin identifié'),
  situationAdministrative: readValue(row, 'Situation administrative'),
  situationPersonnelle: readValue(row, 'Situation personnelle'),
  parcoursProfessionnel: readValue(row, 'Parcours professionnel') || readValue(row, 'Parcours'),
    projet: readValue(row, 'Projet professionnel') || readValue(row, 'Projet'),
  })
}

const mergeNonEmptyFields = (existing = {}, incoming = {}) => {
  const merged = { ...anonymiserPortfolioRecord(existing) }
  Object.entries(anonymiserPortfolioRecord(incoming)).forEach(([key, value]) => {
    if (key === 'statutSuiviImport'
      && value === 'a_qualifier'
      && text(merged.statutSuiviImport)
      && merged.statutSuiviImport !== 'a_qualifier') return
    if (key === 'identifiant' || text(value)) merged[key] = value
  })
  return anonymiserPortfolioRecord(merged)
}

const hasUsefulChange = (existing = {}, incoming = {}) => Object.entries(mergeNonEmptyFields(existing, incoming))
  .some(([key, value]) => key !== 'identifiant' && text(existing[key]) !== text(value))

const deduplicateRecords = (records) => {
  const byId = new Map()
  records.forEach((record) => {
    const recordAnonymise = anonymiserPortfolioRecord(record)
    const identifiant = normalizeIdentifier(recordAnonymise.identifiant)
    if (!identifiant) return
    byId.set(identifiant, mergeNonEmptyFields(byId.get(identifiant), { ...recordAnonymise, identifiant }))
  })
  return [...byId.values()]
}

const readImportedRecords = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(IMPORT_STORAGE_KEY) || '[]')
    return Array.isArray(parsed)
      ? parsed.map((record) => {
        const recordAnonymise = anonymiserPortfolioRecord(record)
        return recordAnonymise.importedAt
          ? rattacherAMonPortefeuille(recordAnonymise)
          : recordAnonymise
      })
      : []
  } catch {
    return []
  }
}

export const listPortfolioRecords = () => {
  const byId = new Map()
  deduplicateRecords([...portefeuilleInitial, ...readImportedRecords()]).forEach((record) => {
    byId.set(record.identifiant, record)
  })
  return [...byId.values()].sort((a, b) =>
    text(a.identifiant).localeCompare(text(b.identifiant), 'fr'),
  )
}

export const savePortfolioRecord = async (record) => {
  const identifiant = normalizeIdentifier(record?.identifiant)
  const civilite = text(record?.civilite)
  const age = numberOrEmpty(record?.age)

  if (!identifiant) throw new Error('Le numéro France Travail est obligatoire.')

  const previous = deduplicateRecords(readImportedRecords())
  const byId = new Map(previous.map((item) => [item.identifiant, item]))
  const existing = byId.get(identifiant)
  if (!existing && !civilite) throw new Error('La civilité (Mr ou Mme) est obligatoire pour un nouveau demandeur.')
  if (!existing && (age === '' || age < 16 || age > 100)) {
    throw new Error('Indiquez un âge compris entre 16 et 100 ans pour un nouveau demandeur.')
  }
  if (age !== '' && (age < 16 || age > 100)) throw new Error('Indiquez un âge compris entre 16 et 100 ans.')
  const savedRecord = anonymiserPortfolioRecord({
    ...existing,
    ...anonymiserPortfolioRecord(record),
    identifiant,
    civilite,
    age,
    updatedAt: new Date().toISOString(),
    source: existing?.source || 'saisie-manuelle',
  })
  byId.set(identifiant, savedRecord)

  const mergedRecords = deduplicateRecords([...byId.values()])
  localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(mergedRecords))
  let cloudSynced = true
  try {
    await syncPortfolioToCloud(mergedRecords)
  } catch {
    cloudSynced = false
  }

  return { record: savedRecord, created: !existing, cloudSynced }
}

export const buildPortfolioPatchFromDossier = (dossier = {}) => ({
  civilite: text(dossier.civilite),
  situationAdministrative: text(dossier.situationAdministrative),
  situationPersonnelle: text(dossier.situationPersonnelle),
  parcoursProfessionnel: text(dossier.parcoursProfessionnel),
  ceQueDitLaPersonne: text(dossier.ceQueDitLaPersonne),
  besoinIdentifieConseiller: text(dossier.besoinIdentifieConseiller),
  projet: text(dossier.projet),
  formation: text(dossier.formation),
  freinsSelectionnes: Array.isArray(dossier.freinsSelectionnes) ? dossier.freinsSelectionnes : [],
  ressourcesSelectionnees: Array.isArray(dossier.ressourcesSelectionnees) ? dossier.ressourcesSelectionnees : [],
  categorieActuelle: text(dossier.categorieActuelle),
  categorieDemandee: text(dossier.categorieDemandee),
  codeSituationOp2: text(dossier.codeSituationOp2),
  suiviAccompagnementChoisi: text(dossier.suiviAccompagnementChoisi),
})

export const updatePortfolioRecordFromDossier = async (identifiantSource, dossier = {}) => {
  const identifiant = normalizeIdentifier(identifiantSource)
  if (!identifiant) return { updated: false, reason: 'missing-id' }

  const previous = deduplicateRecords(readImportedRecords())
  const byId = new Map(previous.map((item) => [item.identifiant, item]))
  const existing = byId.get(identifiant)
  if (!existing?.appartientMonPortefeuille) return { updated: false, reason: 'not-imported' }

  const updatedRecord = rattacherAMonPortefeuille({
    ...existing,
    ...buildPortfolioPatchFromDossier(dossier),
    identifiant,
    source: existing.source || 'import-excel',
    parcoursUpdatedAt: new Date().toISOString(),
  })
  byId.set(identifiant, anonymiserPortfolioRecord(updatedRecord))

  const mergedRecords = deduplicateRecords([...byId.values()])
  localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(mergedRecords))
  let cloudSynced = true
  try {
    await syncPortfolioToCloud(mergedRecords)
  } catch {
    cloudSynced = false
  }

  return { updated: true, record: updatedRecord, cloudSynced }
}

const parseDate = (value) => {
  const raw = text(value)
  if (!raw) return null
  const frenchDate = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  const parsed = frenchDate
    ? new Date(Number(frenchDate[3]), Number(frenchDate[2]) - 1, Number(frenchDate[1]))
    : new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const elapsedMonths = (from, to = new Date()) => {
  const date = parseDate(from)
  if (!date) return null
  let months = (to.getFullYear() - date.getFullYear()) * 12 + to.getMonth() - date.getMonth()
  if (to.getDate() < date.getDate()) months -= 1
  return months
}

const monthsUntil = (value, from = new Date()) => {
  const date = parseDate(value)
  if (!date) return null
  let months = (date.getFullYear() - from.getFullYear()) * 12 + date.getMonth() - from.getMonth()
  if (date.getDate() < from.getDate()) months -= 1
  return months
}

const seniorityMonths = (record) => {
  const fromDate = elapsedMonths(record.dateInscription)
  if (fromDate !== null) return fromDate
  const raw = text(record.ancienneteInscription).toLowerCase()
  if (!raw) return null
  const years = Number(raw.match(/(\d+(?:[.,]\d+)?)\s*(?:an|année)/)?.[1]?.replace(',', '.') || 0)
  const months = Number(raw.match(/(\d+(?:[.,]\d+)?)\s*mois/)?.[1]?.replace(',', '.') || 0)
  if (years || months) return Math.floor(years * 12 + months)
  const numeric = Number(raw.replace(',', '.'))
  return Number.isFinite(numeric) ? numeric : null
}

const profileIdsForRecord = (record) => {
  const profiles = new Set(
    Array.isArray(record.profils) ? record.profils : profileIdsFromText(record.profils),
  )
  const age = numberOrEmpty(record.age)
  if (age !== '' && age < 26) profiles.add('jeune_moins_26')
  if (age !== '' && age >= 50) profiles.add('senior_50_plus')
  if (record.rqth === true || isAffirmative(record.rqth)) profiles.add('rqth')
  if (record.rsa === true || isAffirmative(record.rsa)) profiles.add('rsa')
  if (record.are === true || isAffirmative(record.are)) profiles.add('are')
  if (record.ass === true || isAffirmative(record.ass)) profiles.add('ass')
  return profiles
}

const recordMatchesExportFilters = (record, filters = {}) => {
  const age = numberOrEmpty(record.age)
  const minimum = numberOrEmpty(filters.ageMin)
  const maximum = numberOrEmpty(filters.ageMax)
  if (minimum !== '' && (age === '' || age < minimum)) return false
  if (maximum !== '' && (age === '' || age > maximum)) return false

  const inscriptionMonths = seniorityMonths(record)
  if (filters.dureeInscription === 'deld' && (inscriptionMonths === null || inscriptionMonths < 12 || inscriptionMonths >= 24)) {
    return false
  }
  if (filters.dureeInscription === 'detld' && (inscriptionMonths === null || inscriptionMonths < 24)) {
    return false
  }

  if (filters.procheRetraite) {
    const retirementMonths = monthsUntil(record.dateRetraitePrevisionnelle)
    if (retirementMonths === null || retirementMonths < 6 || retirementMonths > 12) return false
  }

  const selectedProfiles = Array.isArray(filters.profils) ? filters.profils : []
  if (selectedProfiles.length) {
    const recordProfiles = profileIdsForRecord(record)
    const profileMatch = filters.profileMode === 'all'
      ? selectedProfiles.every((profile) => recordProfiles.has(profile))
      : selectedProfiles.some((profile) => recordProfiles.has(profile))
    if (!profileMatch) return false
  }
  return true
}

export const getRetirementAlertLevel = (record) => {
  const months = monthsUntil(record?.dateRetraitePrevisionnelle)
  if (months === null) return null
  if (months < 0) return 'depassee'
  if (months <= 12 && months >= 6) return 'proche'
  if (months < 6) return 'imminente'
  return null
}

export const countPortfolioRecordsForExport = (filters = {}) =>
  listPortfolioRecords().filter((record) => recordMatchesExportFilters(record, filters)).length

export const exportPortfolioWorkbook = (filters = {}) => {
  const records = listPortfolioRecords().filter((record) => recordMatchesExportFilters(record, filters))
  if (!records.length) throw new Error('Aucun demandeur ne correspond aux filtres sélectionnés.')

  const rows = records.map((record) => ({
    Identifiant: record.identifiant,
    "Motif particulier (facultatif)": record.motifImport,
    "Statut de suivi": trackingStatusOption(record.statutSuiviImport).label,
    "Suite de suivi": record.actionSuiviImport,
    "Commentaire de suivi import": record.commentaireSuiviImport,
    "Date de suivi import": record.dateSuiviImport,
    Civilité: record.civilite,
    Âge: record.age,
    "Profils et situations": [...profileIdsForRecord(record)]
      .map((id) => PORTFOLIO_PROFILE_OPTIONS.find((option) => option.id === id)?.label || id)
      .join(' ; '),
    "Date d'inscription": record.dateInscription,
    "Ancienneté d'inscription": record.ancienneteInscription,
    "Date de retraite prévisionnelle": record.dateRetraitePrevisionnelle,
    "Ancienneté dans la modalité en cours (DE) (mois)": record.ancienneteModaliteMois,
    "Date dernier contact": record.dateDernierContact,
    "Prochain jalon perso.": record.prochainJalon,
    "Motif prochain jalon": record.motifProchainJalon,
    "Date convoc.": record.dateConvocation,
    "Nb actions conseillées": record.nombreActionsConseillees,
    "Nb actions en cours ou terminées": record.nombreActionsEnCoursOuTerminees,
    "Statut du profil": record.statutProfil,
    "Date dernière modification": record.dateDerniereModification,
    "Acteur dernière modification": record.acteurDerniereModification,
    "ORE à contractualiser": record.oreAContractualiser,
    "Consentement promotion de profil": record.consentementPromotionProfil,
    Commune: record.commune,
    Canton: record.canton,
    "Cat.": record.categorieActuelle,
    "Indispo. en cours": record.indisponibiliteEnCours,
    "DELD / DETLD": record.deldDetld,
    Téléphone: record.telephone,
    Priorité: record.priorite,
    "Contrat d'engagement": record.contratEngagement,
    Prestation: record.prestation,
    Atelier: record.atelier,
    Formation: record.formation,
    Échéance: record.echeance,
    Alerte: record.alerte,
    Statut: record.statut,
    Commentaires: record.commentaires,
  }))
  const worksheet = XLSX.utils.json_to_sheet(rows)
  worksheet['!cols'] = Object.keys(rows[0] || {}).map((header) => ({
    wch: Math.min(48, Math.max(12, header.length + 2)),
  }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Portefeuille filtré')
  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `portefeuille-cap-decision-${date}.xlsx`)
  return records.length
}

export const importPortfolioWorkbook = async (file, options = {}) => {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, cellStyles: true })
  const sheetName = workbook.SheetNames.includes('Suivi DE') ? 'Suivi DE' : workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) throw new Error('Le classeur ne contient aucune feuille exploitable.')

  const fichierImport = text(file.name).replace(/[^\p{L}\p{N} ._()-]/gu, '')
  const motifImportSaisi = text(options.motifImport)
  const motifImport = motifImportSaisi || inferImportMotifFromFilename(fichierImport)
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false }).map((row, index) => ({
    ...row,
    __motifImport: motifImport,
    __fichierImport: fichierImport,
    __statutSuiviImport: trackingStatusForSheetRow(sheet, index + 2),
  }))
  const mapped = rows.map(mapPortfolioRow).filter((record) => record.identifiant)
  if (mapped.length === 0) {
    throw new Error('Aucun demandeur reconnu. Vérifiez la colonne Identifiant (numéro France Travail).')
  }

  const previous = deduplicateRecords(readImportedRecords())
  const byId = new Map(previous.map((record) => [record.identifiant, record]))
  const incomingById = new Map()
  let duplicatesMerged = 0
  mapped.forEach((record) => {
    if (incomingById.has(record.identifiant)) duplicatesMerged += 1
    incomingById.set(
      record.identifiant,
      mergeNonEmptyFields(incomingById.get(record.identifiant), record),
    )
  })
  let created = 0
  let updated = 0
  let unchanged = 0
  incomingById.forEach((record) => {
    const existing = byId.get(record.identifiant)
      || portefeuilleInitial.find((item) => normalizeIdentifier(item.identifiant) === record.identifiant)
    if (!existing) created += 1
    else if (hasUsefulChange(existing, record)) updated += 1
    else unchanged += 1

    byId.set(record.identifiant, rattacherAMonPortefeuille({
      ...mergeNonEmptyFields(existing, record),
      identifiant: record.identifiant,
      importedAt: new Date().toISOString(),
      source: 'import-excel',
    }))
  })
  const mergedRecords = deduplicateRecords([...byId.values()])
  localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(mergedRecords))
  let cloudSynced = true
  try {
    await syncPortfolioToCloud(mergedRecords)
  } catch {
    cloudSynced = false
  }

  return {
    total: incomingById.size,
    created,
    updated,
    unchanged,
    duplicatesMerged,
    ignored: rows.length - mapped.length,
    sheetName,
    cloudSynced,
    rattachesPortefeuille: incomingById.size,
    motifImport,
    motifImportAutomatique: !motifImportSaisi && Boolean(motifImport),
    libelleImport: motifImport || fichierImport || 'Import général',
    suiviCouleurs: {
      aQualifier: mapped.filter((record) => record.statutSuiviImport === 'a_qualifier').length,
      enCours: mapped.filter((record) => record.statutSuiviImport === 'en_cours').length,
      realises: mapped.filter((record) => record.statutSuiviImport === 'realise').length,
      actionsRequises: mapped.filter((record) => record.statutSuiviImport === 'action_requise').length,
      aRecontacter: mapped.filter((record) => record.statutSuiviImport === 'a_recontacter').length,
    },
  }
}

export const portfolioRecordToDossier = (record) => ({
  ...anonymiserPortfolioRecord(record),
  appartientMonPortefeuille: Boolean(record?.appartientMonPortefeuille),
  portefeuilleRattachement: record?.appartientMonPortefeuille ? MON_PORTEFEUILLE_LABEL : '',
  dossierStatut: record.statut || 'importé',
  situationAdministrative: record.situationAdministrative || '',
  situationPersonnelle: record.situationPersonnelle || '',
  parcoursProfessionnel: record.parcoursProfessionnel || '',
  besoinIdentifieConseiller: record.besoinIdentifieConseiller
    || [record.prestation, record.atelier, record.formation].filter(Boolean).join(' · '),
  ceQueDitLaPersonne: record.ceQueDitLaPersonne || record.commentaires || record.motif || '',
  projet: record.projet || record.action || record.decision || '',
  formation: record.formation || '',
  freinsSelectionnes: Array.isArray(record.freinsSelectionnes)
    ? record.freinsSelectionnes
    : record.alerte ? [record.alerte] : [],
  ressourcesSelectionnees: Array.isArray(record.ressourcesSelectionnees) ? record.ressourcesSelectionnees : [],
})
