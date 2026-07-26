export const prestations = {
  orientation: [
    {
      nom: "Activ'Projet",
      public: ['DE', 'RSA', 'Jeunes', 'Adultes'],
      conditions: ['Projet professionnel à définir', 'Reconversion', 'Hésitation métier'],
    },
    {
      nom: 'Parcours Emploi Santé',
      public: ['DE', 'RSA', 'Adultes'],
      conditions: ['Frein santé', 'Parcours de soin en cours', 'Retour progressif vers l emploi'],
    },
    {
      nom: 'Bilan de compétences',
      public: ['DE', 'Adultes', 'Salariés'],
      conditions: ['Besoin de clarification du projet', 'Évolution professionnelle', 'Transition de carrière'],
    },
  ],

  emploi: [
    {
      nom: 'Atelier CV',
      public: ['DE', 'Jeunes', 'Adultes'],
      conditions: ['CV à actualiser', 'Candidatures insuffisantes', 'Retour négatif employeurs'],
    },
    {
      nom: 'Atelier Lettre de motivation',
      public: ['DE', 'Jeunes', 'Adultes'],
      conditions: ['Candidature ciblée', 'Besoin de personnalisation', 'Réponse aux offres'],
    },
    {
      nom: 'Atelier Entretien',
      public: ['DE', 'Jeunes', 'Adultes'],
      conditions: ['Entretien à préparer', 'Manque d aisance orale', 'Mise en situation RH'],
    },
    {
      nom: 'Valoriser son image professionnelle',
      public: ['DE', 'Jeunes', 'Adultes'],
      conditions: ['Confiance professionnelle à renforcer', 'Présentation de soi', 'Posture en recrutement'],
    },
    {
      nom: "Techniques de recherche d'emploi",
      public: ['DE', 'Jeunes', 'Adultes'],
      conditions: ['Recherche active', 'Méthode de prospection', 'Ciblage entreprises'],
    },
  ],

  formation: [
    {
      nom: 'Prépa Compétences',
      public: ['DE', 'Jeunes', 'Adultes'],
      conditions: ['Entrée en formation', 'Remise à niveau', 'Compétences de base'],
    },
    {
      nom: 'Préparation à la formation',
      public: ['DE', 'Jeunes', 'Adultes'],
      conditions: ['Projet validé', 'Besoin de sécuriser le parcours', 'Pré-requis à consolider'],
    },
    {
      nom: 'Immersion professionnelle PMSMP',
      public: ['DE', 'Jeunes', 'Adultes', 'Entreprises'],
      conditions: ['Validation de projet', 'Découverte métier', 'Test en situation réelle'],
    },
  ],

  handicap: [
    {
      nom: 'Emploi accompagné',
      public: ['RQTH'],
      conditions: ['RQTH', 'Besoin d accompagnement renforcé', 'Maintien dans l emploi'],
    },
    {
      nom: 'Prestations Cap Emploi',
      public: ['RQTH', 'DE'],
      conditions: ['RQTH ou demande RQTH', 'Restriction médicale', 'Adaptation de poste'],
    },
  ],

  creation: [
    {
      nom: "Activ'Créa",
      public: ['Créateur', 'Repreneur'],
      conditions: ["Création d'entreprise", 'Projet entrepreneurial'],
    },
    {
      nom: 'BGE Corse',
      public: ['Créateur', 'Repreneur', 'DE'],
      conditions: ['Structuration du projet', 'Business plan', 'Accompagnement à la création'],
    },
    {
      nom: 'ADIE',
      public: ['Créateur', 'Repreneur', 'DE'],
      conditions: ['Besoin de microcrédit', 'Lancement activité', 'Public éloigné du financement bancaire'],
    },
  ],

  entreprise: [
    {
      nom: 'Méthode de Recrutement par Simulation (MRS)',
      public: ['DE', 'Entreprises'],
      conditions: ['Recrutement sans CV', 'Évaluation des habiletés', 'Besoin entreprise locale'],
    },
    {
      nom: 'Immersion PMSMP',
      public: ['DE', 'Entreprises'],
      conditions: ['Découverte poste', 'Validation candidat entreprise', 'Période de mise en situation'],
    },
  ],

  iae: [
    {
      nom: 'PASS IAE',
      public: ['RSA', 'IAE'],
      conditions: ['Projet insertion', 'Validation orientation IAE', 'Freins socio-professionnels'],
    },
    {
      nom: 'Orientation SIAE',
      public: ['RSA', 'IAE', 'DE'],
      conditions: ['Cumul de freins', 'Besoin de remobilisation', 'Accompagnement renforcé emploi'],
    },
  ],

  social: [
    {
      nom: 'Parcours Emploi Santé',
      public: ['RSA', 'DE', 'Adultes'],
      conditions: ['Frein santé', 'Coordination socio-professionnelle', 'Retour progressif à l emploi'],
    },
    {
      nom: 'Accompagnement global',
      public: ['RSA', 'DE'],
      conditions: ['RSA', 'Freins sociaux', 'Besoin de coordination avec travailleur social'],
    },
  ],
}

// Exports de compatibilité pour les écrans existants.
const flatPrestations = Object.entries(prestations).flatMap(([domaine, items]) =>
  items.map((item, index) => ({
    id: `PR-${domaine.toUpperCase()}-${index + 1}`,
    nom: item.nom,
    conditions: item.conditions,
    objectif: `Prestations du domaine ${domaine}.`,
    public: domaine,
    vigilance: `Vérifier la pertinence de ${item.nom} selon la situation.`,
    description: domaine,
  })),
)

export const connaissancesPrestations = flatPrestations.map((item) => ({
  id: item.id,
  nom: item.nom,
  description: item.description,
}))

export const prestationsCorse = flatPrestations
