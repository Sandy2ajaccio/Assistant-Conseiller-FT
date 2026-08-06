export const VERSION_GRILLE_FAISCEAU = 'Mars 2025'
export const VERSION_GRILLE_REMOBILISATION = 'Décembre 2025'

export const INDICES_CRE = [
  { id: 'contraintes-personnelles', domaine: 'situation-personnelle', domaineLabel: 'Situation personnelle', label: 'Contraintes personnelles ou freins périphériques', importance: 'Forte' },
  { id: 'obligation-emploi', domaine: 'situation-personnelle', domaineLabel: 'Situation personnelle', label: "Bénéficiaire de l'obligation d'emploi", importance: 'Modérée' },
  { id: 'proche-retraite', domaine: 'situation-personnelle', domaineLabel: 'Situation personnelle', label: 'Proximité de la retraite', importance: 'Modérée' },
  { id: 'activites-declarees', domaine: 'situation-financiere', domaineLabel: 'Situation financière', label: 'Activités déclarées ou activité conservée', importance: 'Forte' },
  { id: 'creation-entreprise', domaine: 'situation-financiere', domaineLabel: 'Situation financière', label: "Création, reprise ou développement d'entreprise", importance: 'Forte' },
  { id: 'opportunites-emploi', domaine: 'recherche-emploi', domaineLabel: "Recherche d'emploi", label: "Opportunités d'emploi dans le métier recherché", importance: 'Forte' },
  { id: 'profil-cv', domaine: 'recherche-emploi', domaineLabel: "Recherche d'emploi", label: 'CV, profil de compétences et carte de visite', importance: 'Modérée' },
  { id: 'ore', domaine: 'recherche-emploi', domaineLabel: "Recherche d'emploi", label: "Cohérence et actualisation de l'ORE", importance: 'Forte' },
  { id: 'autonomie-numerique', domaine: 'recherche-emploi', domaineLabel: "Recherche d'emploi", label: 'Autonomie numérique mobilisée dans les démarches', importance: 'Modérée' },
  { id: 'candidatures', domaine: 'recherche-emploi', domaineLabel: "Recherche d'emploi", label: 'Candidatures et mises en relation', importance: 'Forte' },
  { id: 'odd-jre', domaine: 'recherche-emploi', domaineLabel: "Recherche d'emploi", label: "Renseignement de l'outil d'organisation des démarches", importance: 'Modérée' },
  { id: 'prestations', domaine: 'actions-parcours', domaineLabel: 'Actions et parcours', label: "Prestations et actions d'aide à la recherche", importance: 'Forte' },
  { id: 'formations', domaine: 'actions-parcours', domaineLabel: 'Actions et parcours', label: 'Formation en cours, interrompue ou abandonnée', importance: 'Forte' },
  { id: 'projet-evolution', domaine: 'actions-parcours', domaineLabel: 'Actions et parcours', label: "Projet d'évolution professionnelle", importance: 'Modérée' },
  { id: 'contacts-conseiller', domaine: 'relation-ft', domaineLabel: 'Relation avec France Travail', label: 'Contacts avec le conseiller référent', importance: 'Modérée' },
  { id: 'coordonnees', domaine: 'relation-ft', domaineLabel: 'Relation avec France Travail', label: 'Coordonnées renseignées et à jour', importance: 'Modérée' },
  { id: 'controle-precedent', domaine: 'relation-ft', domaineLabel: 'Relation avec France Travail', label: "Contrôle de la recherche d'emploi antérieur", importance: 'Modérée' },
  { id: 'duree-inscription', domaine: 'contrat-engagement', domaineLabel: "Contrat d'engagement", label: "Durée d'inscription mise en regard des autres indices", importance: 'Modérée' },
  { id: 'activite-hebdomadaire', domaine: 'contrat-engagement', domaineLabel: "Contrat d'engagement", label: "Activité hebdomadaire prévue par le contrat d'engagement", importance: 'Forte' },
  { id: 'actions-autonomes', domaine: 'contrat-engagement', domaineLabel: "Contrat d'engagement", label: 'Actions réalisées en autonomie', importance: 'Modérée' },
  { id: 'indisponibilite', domaine: 'contrat-engagement', domaineLabel: "Contrat d'engagement", label: "Indisponibilité avant l'entretien CRE", importance: 'Forte' },
  { id: 'presence-entretien-cre', domaine: 'contrat-engagement', domaineLabel: "Contrat d'engagement", label: "Présence à l'entretien CRE", importance: 'Forte' },
]

export const CONCLUSIONS_CRE = [
  { value: 'a-instruire', label: 'Analyse en cours — aucune conclusion' },
  { value: 'effectivite', label: "Effectivité de la recherche constatée par le conseiller" },
  { value: 'redynamisation', label: 'Besoin de redynamisation retenu par le conseiller' },
  { value: 'dynamique-faible', label: 'Dynamique faible ou insuffisante retenue par le conseiller' },
  { value: 'hors-grille', label: 'Situation non couverte par la grille — analyse spécifique' },
]

export const ACTIONS_REMOBILISATION = [
  {
    id: 'candidatures-mer',
    label: 'Candidatures et mises en relation',
    exemples: "Candidatures ciblées, mises en relation, auto-positionnement, agence d'intérim, mise à jour du profil.",
    preuves: 'Candidatures déposées, CV et lettres, courriels, captures, mises à jour du dossier de démarches.',
  },
  {
    id: 'atelier-prestation',
    label: 'Atelier ou prestation adapté au besoin réévalué',
    exemples: "Atelier ou prestation d'aide à la recherche, inscription ou participation avec objectif précis.",
    preuves: "Justificatif d'inscription ou de participation, information de l'organisme, compte rendu.",
  },
  {
    id: 'formation-projet',
    label: 'Formation ou réévaluation du projet',
    exemples: "Réinscription, enquête métier, immersion, réévaluation du projet avec le conseiller.",
    preuves: "Inscription, rendez-vous, enquêtes métiers, immersion ou information transmise par l'organisme.",
  },
  {
    id: 'actions-positives',
    label: "Actions positives favorisant le retour à l'emploi",
    exemples: 'Enquêtes métiers, PMSMP, publication du profil, CV ou carte de visite actualisés.',
    preuves: 'Pièces des démarches, éléments mis à jour dans le dossier, justificatifs des contacts.',
  },
  {
    id: 'reprise-contact',
    label: 'Reprise de contact et rendez-vous',
    exemples: "Reprise de contact, traitement d'un frein préalable et rendez-vous convenu avec le conseiller.",
    preuves: 'Justificatif recevable, demande de rendez-vous, rendez-vous convenu et éléments de contexte.',
  },
  {
    id: 'profil-visible',
    label: 'Profil à jour et visible des recruteurs',
    exemples: 'Actualisation du profil et atelier si nécessaire pour le rendre exploitable et visible.',
    preuves: "Mise à jour visible dans l'espace personnel et accord de promotion du profil.",
  },
  {
    id: 'creation-entreprise',
    label: "Création, reprise ou développement d'entreprise",
    exemples: "Accompagnement, étude de marché, modèle économique, immatriculation, financement ou prospection.",
    preuves: "Inscription à un parcours, modèle économique, Kbis, rendez-vous, financement, factures ou chiffre d'affaires.",
  },
  {
    id: 'numerique',
    label: 'Compétences numériques',
    exemples: 'PIX emploi, atelier numérique, APP ou certification CléA selon le besoin.',
    preuves: 'Inscription, convocation, participation, réussite ou validation de niveau.',
  },
  {
    id: 'mobilite-famille',
    label: 'Mobilité ou contraintes familiales',
    exemples: "Location, permis, prestation mobilité, prise de contact avec les solutions de garde ou démarche d'aidant.",
    preuves: 'Rendez-vous, convocations, justificatifs de participation et traces des démarches en ligne.',
  },
  {
    id: 'sante-logement',
    label: 'Santé ou logement',
    exemples: "Démarche RQTH, assistante sociale, Cap emploi, emploi-santé, psychologue du travail ou relais logement.",
    preuves: 'Prise de rendez-vous, convocation, rendez-vous honoré et trace de la démarche.',
  },
  {
    id: 'administratif-juridique',
    label: 'Difficultés administratives ou juridiques',
    exemples: 'Contact et rendez-vous avec un organisme identifié avec le conseiller, prestation ou changement de modalité.',
    preuves: 'Demande de contact, date du rendez-vous, convocation et trace de la démarche.',
  },
  {
    id: 'francais',
    label: 'Maîtrise du français',
    exemples: 'Évaluation du besoin, formation FLE ou remise à niveau, structure locale, OFII ou certification CléA.',
    preuves: 'Contact, rendez-vous, inscription, entrée en formation ou certification.',
  },
  {
    id: 'autre',
    label: 'Autre action individualisée',
    exemples: "Action concrète, réaliste et cohérente avec l'accompagnement ; la grille n'est pas exhaustive.",
    preuves: 'Modalité de constatation convenue et justificatif proportionné à la démarche.',
  },
]

export const DEFAULT_SUIVI_REMOBILISATION = {
  actif: false,
  indicesSelectionnes: [],
  justificatifsParIndice: {},
  conclusionHumaine: 'a-instruire',
  analyseGlobale: '',
  actionsCategories: [],
  actionCategorie: '',
  actionRetenue: '',
  dateEcheance: '',
  preuveAttendue: '',
  actionRealisee: false,
  preuveRealisation: '',
  contexteSuspension: false,
  procedureInterneConfirmee: false,
}

const indiceExiste = (id) => INDICES_CRE.some((item) => item.id === id)
const conclusionExiste = (value) => CONCLUSIONS_CRE.some((item) => item.value === value)
const actionExiste = (id) => ACTIONS_REMOBILISATION.some((item) => item.id === id)

export const normaliserSuiviRemobilisation = (value = {}) => {
  const indicesSelectionnes = Array.from(new Set(
    (Array.isArray(value?.indicesSelectionnes) ? value.indicesSelectionnes : []).filter(indiceExiste),
  ))
  const justificatifsSource = value?.justificatifsParIndice && typeof value.justificatifsParIndice === 'object'
    ? value.justificatifsParIndice
    : {}
  const justificatifsParIndice = Object.fromEntries(
    indicesSelectionnes.map((id) => [id, String(justificatifsSource[id] || '').trim()]),
  )
  const actionsCategories = Array.from(new Set(
    (Array.isArray(value?.actionsCategories)
      ? value.actionsCategories
      : value?.actionCategorie
        ? [value.actionCategorie]
        : []
    ).filter(actionExiste),
  ))

  return {
    ...DEFAULT_SUIVI_REMOBILISATION,
    ...value,
    actif: value?.actif === true,
    indicesSelectionnes,
    justificatifsParIndice,
    conclusionHumaine: conclusionExiste(value?.conclusionHumaine)
      ? value.conclusionHumaine
      : DEFAULT_SUIVI_REMOBILISATION.conclusionHumaine,
    analyseGlobale: String(value?.analyseGlobale || '').trim(),
    actionsCategories,
    actionCategorie: actionsCategories[0] || '',
    actionRetenue: String(value?.actionRetenue || '').trim(),
    dateEcheance: String(value?.dateEcheance || '').trim(),
    preuveAttendue: String(value?.preuveAttendue || '').trim(),
    actionRealisee: value?.actionRealisee === true,
    preuveRealisation: String(value?.preuveRealisation || '').trim(),
    contexteSuspension: value?.contexteSuspension === true,
    procedureInterneConfirmee: value?.procedureInterneConfirmee === true,
  }
}

export const getIndiceCre = (id) => INDICES_CRE.find((item) => item.id === id)
export const getActionRemobilisation = (id) => ACTIONS_REMOBILISATION.find((item) => item.id === id)

export const genererAlertesRemobilisation = (value = {}) => {
  const suivi = normaliserSuiviRemobilisation(value)
  if (!suivi.actif) return []

  const alertes = []
  const indices = suivi.indicesSelectionnes.map(getIndiceCre).filter(Boolean)
  const domaines = new Set(indices.map((item) => item.domaine))
  const sansJustificatif = indices.filter((item) => !suivi.justificatifsParIndice[item.id])

  if (indices.length < 2 || domaines.size < 2) {
    alertes.push({
      id: 'faisceau-insuffisant',
      niveau: 'error',
      titre: "Faisceau d'indices insuffisant",
      message: "Un indice isolé ne permet aucune conclusion. Documenter au moins deux indices appartenant à des domaines distincts et les mettre en regard.",
    })
  }

  if (sansJustificatif.length > 0) {
    alertes.push({
      id: 'justificatifs-indices',
      niveau: 'warning',
      titre: 'Constats ou pièces manquants',
      message: `Documenter chaque indice sélectionné. ${sansJustificatif.length} indice(s) reste(nt) sans constat factuel ni pièce associée.`,
    })
  }

  if (!suivi.analyseGlobale) {
    alertes.push({
      id: 'analyse-globale',
      niveau: 'warning',
      titre: 'Mise en regard des indices manquante',
      message: "Expliquer les convergences, contradictions et éléments de contexte. L'outil ne déduit aucune conclusion.",
    })
  }

  if (suivi.conclusionHumaine === 'a-instruire') {
    alertes.push({
      id: 'conclusion-humaine',
      niveau: 'warning',
      titre: 'Conclusion humaine à renseigner',
      message: "La conclusion appartient au conseiller compétent après examen global du dossier et des justificatifs.",
    })
  }

  if (['redynamisation', 'dynamique-faible'].includes(suivi.conclusionHumaine)) {
    if (suivi.actionsCategories.length === 0 || !suivi.actionRetenue) {
      alertes.push({
        id: 'action-remobilisation',
        niveau: 'warning',
        titre: 'Action de remobilisation à définir',
        message: "Choisir une action individualisée, concrète et cohérente avec l'accompagnement ; les exemples de la grille ne sont pas exhaustifs.",
      })
    }
    if (!suivi.dateEcheance) {
      alertes.push({
        id: 'echeance-action',
        niveau: 'warning',
        titre: "Échéance de l'action manquante",
        message: "Fixer une échéance réaliste et partagée pour permettre le suivi de l'action.",
      })
    }
    if (!suivi.preuveAttendue) {
      alertes.push({
        id: 'preuve-attendue',
        niveau: 'warning',
        titre: 'Modalité de constatation manquante',
        message: "Préciser dès maintenant comment la réalisation sera constatée, avec une preuve proportionnée à l'action.",
      })
    }
  }

  if (suivi.actionRealisee && !suivi.preuveRealisation) {
    alertes.push({
      id: 'preuve-realisation',
      niveau: 'warning',
      titre: 'Réalisation non documentée',
      message: "Renseigner la pièce, la trace ou le constat qui atteste la réalisation de l'action.",
    })
  }

  if (suivi.contexteSuspension) {
    alertes.push({
      id: 'aucune-levee-automatique',
      niveau: 'info',
      titre: 'Aucune levée de suspension automatique',
      message: "La réalisation d'une action ne produit ici aucun effet juridique automatique. L'autorité et la procédure compétentes doivent être vérifiées.",
    })
    if (!suivi.procedureInterneConfirmee) {
      alertes.push({
        id: 'procedure-interne',
        niveau: 'error',
        titre: 'Procédure interne France Travail à confirmer',
        message: "Avant toute incidence sur une suspension, vérifier la procédure interne en vigueur, l'autorité compétente et la traçabilité attendue.",
      })
    }
  }

  return alertes
}

export const compterAlertesRemobilisation = (value = {}) => (
  genererAlertesRemobilisation(value).filter((alerte) => alerte.niveau !== 'info').length
)
