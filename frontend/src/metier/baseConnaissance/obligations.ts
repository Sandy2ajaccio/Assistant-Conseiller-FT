// Referentiel des obligations du parcours d'accompagnement.
export interface Obligation {
  id: string;
  libelle: string;
  description: string;
  publicConcerne: string[];
}

export const OBLIGATIONS: Obligation[] = [
  {
    id: "OBLIGATION_CONTRAT_ENGAGEMENT",
    libelle: "Contrat d'engagement",
    description: "Formaliser et respecter les engagements réciproques du parcours d'accompagnement.",
    publicConcerne: ["Demandeurs d'emploi concernés par un accompagnement contractualisé"],
  },
  {
    id: "OBLIGATION_RECHERCHE_ACTIVE",
    libelle: "Recherche active",
    description: "Mettre en oeuvre des démarches régulières de recherche d'emploi.",
    publicConcerne: ["Demandeurs d'emploi en recherche"],
  },
  {
    id: "OBLIGATION_PARTICIPATION_RDV",
    libelle: "Participation aux rendez-vous",
    description: "Participer aux entretiens et actions prévues dans le parcours d'accompagnement.",
    publicConcerne: ["Tous publics suivis"],
  },
  {
    id: "OBLIGATION_DECLARATION_CHANGEMENTS",
    libelle: "Déclaration des changements de situation",
    description: "Déclarer tout changement impactant les droits, obligations ou modalités d'accompagnement.",
    publicConcerne: ["Tous publics suivis"],
  },
];
