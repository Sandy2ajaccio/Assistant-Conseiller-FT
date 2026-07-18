// Représente un critère de prescription métier.
// Le champ obligatoire permet de distinguer les points bloquants des points recommandés.
export interface CriterePrescription {
  id: string;
  libelle: string;
  obligatoire: boolean;
}

// Représente une contre-indication explicite.
// Une contre-indication n'interdit pas toujours définitivement la prestation,
// mais impose une analyse complémentaire ou un report.
export interface ContreIndication {
  id: string;
  libelle: string;
}

// Référentiel des prestations France Travail mobilisables dans Cap Décision FT.
// Ce modèle est conçu pour être extensible: nouveaux critères, partenaires,
// durées et référentiels peuvent être ajoutés sans modifier les analyses.
export interface Prestation {
  id: string;
  nom: string;
  description: string;
  objectif: string;
  publicCible: string[];
  criteresPrescription: CriterePrescription[];
  contreIndications: ContreIndication[];
  partenaires: string[];
  duree?: string;
  referentiel?: string;
}

export const PRESTATIONS: Prestation[] = [
  {
    id: "PRESTATION_PMSMP",
    nom: "PMSMP",
    description:
      "Période de mise en situation en milieu professionnel pour confirmer un projet ou valider des compétences en contexte réel.",
    objectif:
      "Sécuriser l'orientation en confrontant le projet professionnel à la réalité du métier.",
    publicCible: ["Demandeurs d'emploi", "Public en reconversion", "Projet à confirmer"],
    criteresPrescription: [
      {
        id: "PMSMP_CRITERE_PROJET_A_CONFIRMER",
        libelle: "Projet professionnel à confirmer ou à tester",
        obligatoire: true,
      },
      {
        id: "PMSMP_CRITERE_STRUCTURE_ACCUEIL",
        libelle: "Structure d'accueil identifiée",
        obligatoire: true,
      },
      {
        id: "PMSMP_CRITERE_OBJECTIFS_IMMERSION",
        libelle: "Objectifs d'immersion formalisés",
        obligatoire: false,
      },
    ],
    contreIndications: [
      {
        id: "PMSMP_CI_INDISPONIBILITE",
        libelle: "Indisponibilité incompatible avec la période d'immersion",
      },
      {
        id: "PMSMP_CI_RESTRICTION_NON_EVALUEE",
        libelle: "Restriction médicale non évaluée",
      },
    ],
    partenaires: ["France Travail", "Entreprise d'accueil", "Cap emploi"],
    duree: "1 à 4 semaines",
    referentiel: "Référentiel France Travail - PMSMP",
  },
  {
    id: "PRESTATION_ACTIV_PROJET",
    nom: "Activ'Projet",
    description:
      "Prestation d'appui à la clarification du projet professionnel et à la structuration des pistes métiers.",
    objectif:
      "Permettre au demandeur d'emploi de définir un projet professionnel réaliste et argumenté.",
    publicCible: ["Projet non stabilisé", "Demandeurs d'emploi en phase d'exploration"],
    criteresPrescription: [
      {
        id: "ACTIV_PROJET_CRITERE_BESOIN_CLARIFICATION",
        libelle: "Besoin de clarification du projet professionnel",
        obligatoire: true,
      },
      {
        id: "ACTIV_PROJET_CRITERE_ADHESION",
        libelle: "Adhésion du demandeur à la démarche",
        obligatoire: true,
      },
      {
        id: "ACTIV_PROJET_CRITERE_DIAGNOSTIC_INITIAL",
        libelle: "Diagnostic initial réalisé",
        obligatoire: false,
      },
    ],
    contreIndications: [
      {
        id: "ACTIV_PROJET_CI_PROJET_DEJA_STABILISE",
        libelle: "Projet déjà stabilisé sans besoin de clarification",
      },
    ],
    partenaires: ["France Travail", "Prestataire conventionné"],
    duree: "4 à 8 semaines",
    referentiel: "Référentiel France Travail - Activ'Projet",
  },
  {
    id: "PRESTATION_ATELIER_CV",
    nom: "Atelier CV",
    description:
      "Atelier collectif ou individuel visant à améliorer la lisibilité et la pertinence du CV.",
    objectif:
      "Renforcer la qualité des candidatures et la visibilité du profil auprès des recruteurs.",
    publicCible: ["Demandeurs d'emploi en recherche active", "CV à actualiser"],
    criteresPrescription: [
      {
        id: "ATELIER_CV_CRITERE_RECHERCHE_ACTIVE",
        libelle: "Démarche de recherche d'emploi engagée ou imminente",
        obligatoire: false,
      },
      {
        id: "ATELIER_CV_CRITERE_BESOIN_OUTILS",
        libelle: "Besoin d'amélioration des outils de candidature",
        obligatoire: true,
      },
    ],
    contreIndications: [
      {
        id: "ATELIER_CV_CI_AUCUNE",
        libelle: "Aucune contre-indication majeure identifiée",
      },
    ],
    partenaires: ["France Travail", "Prestataire atelier emploi"],
    duree: "1 à 2 journées",
    referentiel: "Offre de services France Travail - Ateliers candidature",
  },
  {
    id: "PRESTATION_ATELIER_ENTRETIEN",
    nom: "Atelier Entretien",
    description:
      "Atelier de préparation aux entretiens de recrutement avec mises en situation.",
    objectif:
      "Développer l'aisance à l'oral et la capacité à valoriser son parcours en entretien.",
    publicCible: ["Demandeurs d'emploi convoqués en entretien", "Public en reprise de confiance"],
    criteresPrescription: [
      {
        id: "ATELIER_ENTRETIEN_CRITERE_CIBLE_METIER",
        libelle: "Cible métier ou type de poste identifié",
        obligatoire: false,
      },
      {
        id: "ATELIER_ENTRETIEN_CRITERE_BESOIN_PREPARATION",
        libelle: "Besoin de préparation à l'entretien identifié",
        obligatoire: true,
      },
    ],
    contreIndications: [
      {
        id: "ATELIER_ENTRETIEN_CI_AUCUNE",
        libelle: "Aucune contre-indication majeure identifiée",
      },
    ],
    partenaires: ["France Travail", "Prestataire atelier emploi"],
    duree: "1 à 2 journées",
    referentiel: "Offre de services France Travail - Ateliers entretien",
  },
  {
    id: "PRESTATION_FORMATION_QUALIFIANTE",
    nom: "Formation qualifiante",
    description:
      "Parcours de formation visant l'acquisition de compétences certifiantes ou qualifiantes.",
    objectif:
      "Permettre l'accès à l'emploi par la montée en compétences ciblée sur un métier visé.",
    publicCible: ["Projet professionnel défini", "Besoin de compétences identifié"],
    criteresPrescription: [
      {
        id: "FORMATION_QUALIFIANTE_CRITERE_PROJET_DEFINI",
        libelle: "Projet professionnel défini et cohérent",
        obligatoire: true,
      },
      {
        id: "FORMATION_QUALIFIANTE_CRITERE_PREREQUIS",
        libelle: "Prérequis pédagogiques vérifiés",
        obligatoire: true,
      },
      {
        id: "FORMATION_QUALIFIANTE_CRITERE_FINANCEMENT",
        libelle: "Solution de financement identifiée",
        obligatoire: true,
      },
    ],
    contreIndications: [
      {
        id: "FORMATION_QUALIFIANTE_CI_FREINS_MAJEURS",
        libelle: "Freins périphériques majeurs non levés",
      },
      {
        id: "FORMATION_QUALIFIANTE_CI_PROJET_INSTABLE",
        libelle: "Projet professionnel non stabilisé",
      },
    ],
    partenaires: ["France Travail", "AFPA", "Organisme de formation"],
    duree: "3 à 12 mois",
    referentiel: "Référentiel France Travail - Formation",
  },
];
