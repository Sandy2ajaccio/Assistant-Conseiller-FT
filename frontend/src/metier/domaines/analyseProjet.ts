import type { ProfilDemandeur } from "../src/metier/profilDemandeur";

export interface AnalyseDomaine {
  domaine: string;
  score: number;
  priorite: "faible" | "moyenne" | "élevée" | "critique";
  atouts: string[];
  freins: string[];
  recommandations: string[];
  decisions: string[];
  alertes: string[];
  raisonnement: string[];
}

export function analyserProjet(profil: ProfilDemandeur): AnalyseDomaine {
  if (!profil.projetDefini) {
    return {
      domaine: "Projet",
      score: 20,
      priorite: "élevée",
      atouts: [],
      freins: ["Projet professionnel insuffisamment défini"],
      recommandations: ["Clarifier le projet", "Étudier une PMSMP"],
      decisions: ["Reporter toute prescription de formation"],
      alertes: ["Projet professionnel non stabilisé"],
      raisonnement: [
        "Vérification de l'existence d'un projet professionnel",
        "Aucun projet professionnel stabilisé",
        "Une prescription de formation serait prématurée",
        "Une clarification du projet est prioritaire",
      ],
    };
  }

  return {
    domaine: "Projet",
    score: 90,
    priorite: "faible",
    atouts: ["Projet professionnel défini"],
    freins: [],
    recommandations: ["Poursuivre les démarches"],
    decisions: ["Autoriser l'étude d'une formation"],
    alertes: [],
    raisonnement: [
      "Projet professionnel identifié",
      "Les prérequis de base sont satisfaits",
      "Le projet peut être approfondi",
    ],
  };
}
