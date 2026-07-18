const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null)

const asString = (value, fallback = '') => {
  if (value === undefined || value === null) return fallback
  return String(value)
}

const asBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'oui' || normalized === 'true') return true
    if (normalized === 'non' || normalized === 'false') return false
  }
  return Boolean(value)
}

const asNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return fallback
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

const asArray = (value) => (Array.isArray(value) ? value : [])
const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const normalizeVersionHistoryItem = (item, fallback = {}) => {
  const source = isPlainObject(item) ? item : {}
  return {
    version: asNumber(source.version, asNumber(fallback.version, 1)),
    createdAt: asString(source.createdAt, asString(fallback.createdAt, '')),
    updatedAt: asString(source.updatedAt, asString(fallback.updatedAt, '')),
    auteur: asString(source.auteur, asString(fallback.auteur, 'Conseiller FT')),
    source: asString(source.source, asString(fallback.source, 'local')),
  }
}

export const buildVersionnementModel = ({
  current = {},
  fallbackVersion = 1,
  fallbackCreatedAt = '',
  fallbackUpdatedAt = '',
  fallbackAuteur = 'Conseiller FT',
  fallbackSource = 'local',
} = {}) => {
  const source = isPlainObject(current) ? current : {}
  const versionCandidate = Number(firstDefined(source.version, fallbackVersion))

  const version = Number.isFinite(versionCandidate) && versionCandidate > 0 ? Math.floor(versionCandidate) : 1
  const createdAt = asString(firstDefined(source.createdAt, fallbackCreatedAt, fallbackUpdatedAt), '')
  const updatedAt = asString(firstDefined(source.updatedAt, fallbackUpdatedAt, createdAt), '')
  const auteur = asString(firstDefined(source.auteur, fallbackAuteur), 'Conseiller FT')
  const sourceLabel = asString(firstDefined(source.source, fallbackSource), 'local')
  const historique = asArray(source.historique).map((item) =>
    normalizeVersionHistoryItem(item, {
      version,
      createdAt,
      updatedAt,
      auteur,
      source: sourceLabel,
    })
  )

  return {
    version,
    createdAt,
    updatedAt,
    auteur,
    source: sourceLabel,
    historique,
  }
}

const normalizeSimulateurDecision = (value) => {
  if (!value || typeof value !== 'object') return undefined

  return {
    scenarioId: asString(firstDefined(value.scenarioId, value.scenario_id), ''),
    scenarioNom: asString(firstDefined(value.scenarioNom, value.scenario_nom), ''),
    map: asString(firstDefined(value.map, value.mapTexte), ''),
    frequenceSuivi: asString(firstDefined(value.frequenceSuivi, value.frequence_suivi), ''),
    echeance: asString(firstDefined(value.echeance, value.date_suivi), ''),
    partenaires: asArray(value.partenaires),
    typeAccompagnement: asString(firstDefined(value.typeAccompagnement, value.type_accompagnement), ''),
  }
}

export const normalizeDemandeurModel = (value) => {
  const source = value && typeof value === 'object' ? value : {}

  return {
    id: firstDefined(source.id, source.identifiant_ft, source.identifiantFt, null),
    nom: asString(source.nom, ''),
    prenom: asString(source.prenom, ''),
    dateNaissance: asString(firstDefined(source.dateNaissance, source.date_naissance), ''),
    identifiantFt: asString(firstDefined(source.identifiantFt, source.identifiant_ft), ''),
    organismeReferent: asString(firstDefined(source.organismeReferent, source.organisme_referent), ''),
    categorie: asString(source.categorie, ''),
    portefeuille: asString(firstDefined(source.portefeuille, source.type_accompagnement), ''),
    dateInscription: asString(firstDefined(source.dateInscription, source.date_inscription), ''),
    ancienneteInscription: asString(firstDefined(source.ancienneteInscription, source.anciennete_inscription), ''),
    rsa: asBoolean(source.rsa, false),
    are: asBoolean(source.are, false),
    dateFinAre: asString(firstDefined(source.dateFinAre, source.date_fin_are), ''),
    contratEngagement: asString(firstDefined(source.contratEngagement, source.contrat_engagement), ''),
    dpaRealisee: asBoolean(firstDefined(source.dpaRealisee, source.dpa_realisee), false),
    premierEntretienRealise: asBoolean(
      firstDefined(source.premierEntretienRealise, source.premier_entretien_realise),
      false,
    ),
    dernierEntretien: asString(firstDefined(source.dernierEntretien, source.dernier_entretien), ''),
    rechercheEmploi: asString(firstDefined(source.rechercheEmploi, source.recherche_emploi), ''),
    cvVisible: asBoolean(firstDefined(source.cvVisible, source.cv_visible), false),
    projetProfessionnel: asString(firstDefined(source.projetProfessionnel, source.projet_professionnel), ''),
    reconnaissanceTH: asBoolean(firstDefined(source.reconnaissanceTH, source.rqth), false),
    nombreFreins: asNumber(firstDefined(source.nombreFreins, source.nombre_freins), 0),
    mobilite: asString(source.mobilite, ''),
    prestations: asArray(source.prestations),
    ateliers: asArray(source.ateliers),
    formations: asArray(source.formations),
    convocations: asArray(source.convocations),
    simulateurDecision: normalizeSimulateurDecision(source.simulateurDecision),
  }
}

export const buildDemandeurContractSnapshot = (value) => {
  const d = normalizeDemandeurModel(value)
  const versionnement = buildVersionnementModel({
    current: value?.versionnement,
    fallbackSource: 'demandeur',
  })

  return {
    id: d.id,
    portefeuille: d.portefeuille,
    dateInscription: d.dateInscription,
    ancienneteInscription: d.ancienneteInscription,
    rsa: d.rsa,
    are: d.are,
    dateFinAre: d.dateFinAre,
    contratEngagement: d.contratEngagement,
    dpaRealisee: d.dpaRealisee,
    premierEntretienRealise: d.premierEntretienRealise,
    dernierEntretien: d.dernierEntretien,
    rechercheEmploi: d.rechercheEmploi,
    cvVisible: d.cvVisible,
    projetProfessionnel: d.projetProfessionnel,
    reconnaissanceTH: d.reconnaissanceTH,
    nombreFreins: d.nombreFreins,
    mobilite: d.mobilite,
    prestations: d.prestations,
    ateliers: d.ateliers,
    formations: d.formations,
    convocations: d.convocations,
    simulateurDecision: d.simulateurDecision,
    versionnement,
  }
}

export const toBackendDossierPayload = (value) => {
  const d = normalizeDemandeurModel(value)

  return {
    nom: d.nom,
    prenom: d.prenom,
    date_naissance: d.dateNaissance || undefined,
    identifiant_ft: d.identifiantFt || (d.id ? String(d.id) : undefined),
    organisme_referent: d.organismeReferent || undefined,
    rsa: d.rsa,
    rqth: d.reconnaissanceTH,
    categorie: d.categorie || undefined,
  }
}

export const normalizeDossierModel = ({ identifiant, source, updatedAt = '' }) => {
  const raw = isPlainObject(source) ? { ...source } : {}
  const canonicalIdentifiant = asString(firstDefined(raw.identifiant, raw.demandeur?.identifiant, identifiant), '').trim()
  const historique = asArray(firstDefined(raw.historique, raw.historiqueEntretiens))

  const normalized = {
    ...raw,
    identifiant: canonicalIdentifiant,
    demandeur: isPlainObject(raw.demandeur)
      ? {
          ...raw.demandeur,
          identifiant: asString(firstDefined(raw.demandeur.identifiant, canonicalIdentifiant), canonicalIdentifiant),
        }
      : { identifiant: canonicalIdentifiant },
    analyse: isPlainObject(raw.analyse) ? raw.analyse : {},
    synthese: isPlainObject(raw.synthese)
      ? {
          ...raw.synthese,
          contenu: asString(raw.synthese.contenu, ''),
          versions: asArray(raw.synthese.versions),
        }
      : { contenu: '', versions: [] },
    compteRendu: isPlainObject(raw.compteRendu)
      ? {
          ...raw.compteRendu,
          contenu: asString(raw.compteRendu.contenu, ''),
          versions: asArray(raw.compteRendu.versions),
        }
      : { contenu: '', versions: [] },
    historique,
    historiqueEntretiens: asArray(raw.historiqueEntretiens).length > 0 ? asArray(raw.historiqueEntretiens) : historique,
    scenarios: asArray(raw.scenarios),
    versionnement: buildVersionnementModel({
      current: raw.versionnement,
      fallbackVersion: asNumber(firstDefined(raw.versionnement?.version, raw.version), 1),
      fallbackCreatedAt: asString(firstDefined(raw.versionnement?.createdAt, raw.createdAt, raw.updatedAt), ''),
      fallbackUpdatedAt: asString(firstDefined(raw.versionnement?.updatedAt, updatedAt, raw.updatedAt), ''),
      fallbackAuteur: asString(firstDefined(raw.versionnement?.auteur, raw.auteur), 'Conseiller FT'),
      fallbackSource: asString(firstDefined(raw.versionnement?.source, raw.source), 'local'),
    }),
    dossierStatut: raw.dossierStatut === 'termine' ? 'termine' : 'brouillon',
  }

  return normalized
}

export const mapStoredDossierPayload = ({ identifiant, payload }) => {
  if (!isPlainObject(payload)) {
    return {
      ok: false,
      code: 'invalid-structure',
      message: 'Structure de dossier invalide (payload non conforme).',
    }
  }

  const snapshotLikeKeys = ['mission', 'situationProfessionnelle', 'droits', 'freins', 'decisions']
  const hasLegacySnapshot = !isPlainObject(payload.data) && snapshotLikeKeys.some((key) => Object.prototype.hasOwnProperty.call(payload, key))

  if (payload.data != null && !isPlainObject(payload.data) && !hasLegacySnapshot) {
    return {
      ok: false,
      code: 'invalid-structure',
      message: 'Structure de dossier invalide (bloc data non conforme).',
    }
  }

  const candidateData = hasLegacySnapshot
    ? Object.keys(payload).reduce((acc, key) => {
        if (key !== 'version' && key !== 'updatedAt') {
          acc[key] = payload[key]
        }
        return acc
      }, {})
    : payload.data || {}

  const canonicalIdentifiant = asString(firstDefined(identifiant, candidateData.identifiant), '').trim()
  if (!canonicalIdentifiant) {
    return {
      ok: false,
      code: 'invalid-structure',
      message: 'Structure de dossier invalide (identifiant manquant).',
    }
  }

  const versionCandidate = Number(payload.version)
  const version = Number.isFinite(versionCandidate) && versionCandidate > 0 ? Math.floor(versionCandidate) : 1
  const updatedAt = asString(payload.updatedAt, '')

  const dossier = normalizeDossierModel({
    identifiant: canonicalIdentifiant,
    source: {
      ...candidateData,
      versionnement: buildVersionnementModel({
        current: candidateData.versionnement,
        fallbackVersion: version,
        fallbackCreatedAt: asString(firstDefined(candidateData.createdAt, updatedAt), ''),
        fallbackUpdatedAt: updatedAt,
        fallbackAuteur: asString(candidateData.auteur, 'Conseiller FT'),
        fallbackSource: asString(candidateData.source, 'local'),
      }),
    },
    updatedAt,
  })

  const canonicalPayloadUpdatedAt = asString(dossier.versionnement.updatedAt, updatedAt)
  const canonicalPayloadVersion = asNumber(dossier.versionnement.version, version)

  return {
    ok: true,
    payload: {
      ...payload,
      version: canonicalPayloadVersion,
      updatedAt: canonicalPayloadUpdatedAt,
      data: dossier,
    },
    dossier,
  }
}

export const normalizeDashboardDossierRecord = ({ identifiant, parsed, fallback = {} }) => {
  const normalized = mapStoredDossierPayload({
    identifiant,
    payload: parsed && typeof parsed === 'object' ? parsed : { data: fallback, updatedAt: fallback.updatedAt || '' },
  })

  const data = normalized.ok ? normalized.dossier : normalizeDossierModel({ identifiant, source: fallback })
  const historique = asArray(data.historiqueEntretiens)
  const dernierEntretien = historique[0] || null

  return {
    identifiant: data.identifiant || identifiant,
    updatedAt:
      data.versionnement?.updatedAt ||
      (normalized.ok ? normalized.payload.updatedAt : fallback.updatedAt || ''),
    statut: data.dossierStatut === 'termine' ? 'termine' : 'brouillon',
    dateDernierEntretien: dernierEntretien?.date || fallback.dateDernierEntretien || '--/--/---- --:--',
    typeEntretien: dernierEntretien?.typeEntretien || fallback.typeEntretien || 'Non renseigne',
    decisions: data.decisions || fallback.decisions || {},
    mapTexte: String(data.mapTexte || fallback.mapTexte || '').trim(),
    historique,
  }
}
