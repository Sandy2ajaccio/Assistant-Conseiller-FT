import type { ProfilDemandeur } from "../src/metier/profilDemandeur";
import type { AnalyseDomaine } from "./analyseProjet";

export function analyserFormation(profil: ProfilDemandeur): AnalyseDomaine {
  // ETAPE 1: Le projet professionnel est-il défini ?
  if (!profil.projetDefini) {
    return {
      domaine: "Formation",
      score: 20,
      priorite: "élevée",
      atouts: [],
      freins: ["Projet professionnel non stabilisé"],
      recommandations: ["Clarifier le projet", "Réaliser une PMSMP"],
      decisions: ["Reporter toute prescription de formation"],
      alertes: ["Formation non pertinente à ce stade"],
      raisonnement: [
        "Vérification du projet professionnel",
        "Le projet n'est pas suffisamment défini",
        "Une entrée en formation serait prématurée",
      ],
    };
  }

  // ETAPE 2: Le demandeur exprime-t-il un besoin de formation ?
  if (!profil.besoinFormation) {
    return {
      domaine: "Formation",
      score: 90,
      priorite: "faible",
      atouts: ["Aucun besoin de formation identifié"],
      freins: [],
      recommandations: ["Poursuivre la recherche d'emploi"],
      decisions: ["Ne pas prescrire de formation"],
      alertes: [],
      raisonnement: [
        "Le projet est stabilisé",
        "Aucun besoin de compétences complémentaire identifié",
      ],
    };
  }

  // ETAPE 3: Le projet est défini ET un besoin de formation existe.
  return {
    domaine: "Formation",
    score: 70,
    priorite: "moyenne",
    atouts: ["Projet professionnel défini", "Besoin de formation identifié"],
    freins: [],
    recommandations: [
      "Vérifier les prérequis",
      "Étudier les financements",
      "Rechercher une formation adaptée",
    ],
    decisions: ["Étudier la prescription d'une formation"],
    alertes: [],
    raisonnement: [
      "Projet cohérent",
      "Besoin de montée en compétences identifié",
      "Une étude de faisabilité est nécessaire",
    ],
  };
}
