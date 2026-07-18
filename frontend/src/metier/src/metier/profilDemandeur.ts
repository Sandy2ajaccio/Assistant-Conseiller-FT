/**
 * Modèle métier unique du demandeur d'emploi
 * Utilisé par le moteur expert, les règles métier,
 * les recommandations et la génération de synthèse.
 */

export interface ProfilDemandeur {
  // Informations générales
  id?: string;
  nom?: string;
  prenom?: string;
  age?: number;

  // Situation administrative
  inscritFranceTravail: boolean;
  beneficiaireRSA: boolean;
  beneficiaireASS: boolean;
  beneficiaireAAH: boolean;
  rqth: boolean;

  // Projet professionnel
  projetDefini: boolean;
  projetValide: boolean;
  metierVise?: string;
  reconversion: boolean;

  // Recherche d'emploi
  rechercheActive: boolean;
  cvAJour: boolean;
  lettreMotivation: boolean;
  linkedin: boolean;

  // Formation
  niveauQualification?: string;
  besoinFormation: boolean;
  formationEnCours: boolean;

  // Mobilité
  permis: boolean;
  vehicule: boolean;
  mobiliteSuffisante: boolean;

  // Santé
  restrictionMedicale: boolean;

  // Situation sociale
  logementStable: boolean;
  gardeEnfants: boolean;
  difficultesFinancieres: boolean;

  // Compétences
  competences: string[];

  // Freins
  freins: string[];

  // Atouts
  atouts: string[];

  // Motivation
  motivation: "faible" | "moyenne" | "élevée";

  // Autonomie
  autonomie: "faible" | "moyenne" | "élevée";

  // Besoins identifiés
  besoins: string[];

  // Actions déjà réalisées
  actionsRealisees: string[];

  // Partenaires mobilisés
  partenaires: string[];

  // Commentaires du conseiller
  observations?: string;
}