// Referentiel des aides mobilisables selon les situations.
export interface Aide {
  id: string;
  nom: string;
  objectif: string;
  conditions: string[];
}

export const AIDES: Aide[] = [
  {
    id: "AIDE_MOBILITE",
    nom: "Aide à la mobilité",
    objectif: "Faciliter les déplacements liés à l'emploi, à la formation ou aux entretiens.",
    conditions: ["Frein mobilité identifié", "Parcours d'insertion actif"],
  },
  {
    id: "AIDE_PERMIS",
    nom: "Aide au permis",
    objectif: "Soutenir l'accès au permis de conduire lorsque nécessaire au projet professionnel.",
    conditions: ["Besoin de mobilité démontré", "Projet professionnel cohérent"],
  },
  {
    id: "AIDE_FORMATION",
    nom: "Aide à la formation",
    objectif: "Contribuer au financement d'une action de formation adaptée au projet.",
    conditions: ["Projet défini", "Formation pertinente", "Financement à compléter"],
  },
];
