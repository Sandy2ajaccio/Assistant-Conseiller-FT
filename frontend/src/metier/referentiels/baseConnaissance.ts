export interface ReferenceMetier {
  id: string;
  titre: string;
  description: string;
  source: string;
  url?: string;
  motsCles: string[];
}

export interface ActionMetier {
  id: string;
  libelle: string;
  description: string;
  references: string[]; // ids des ReferenceMetier
}

// References metier utilisables par les moteurs d'analyse et de decision.
export const REFERENCES_METIER: ReferenceMetier[] = [
  {
    id: "REF_LOI_PLEIN_EMPLOI",
    titre: "Loi Plein emploi",
    description: "Cadre legal structurant les obligations et parcours d'accompagnement vers l'emploi.",
    source: "France Travail",
    motsCles: ["loi", "plein emploi", "obligations", "accompagnement"],
  },
  {
    id: "REF_CONTRAT_ENGAGEMENT",
    titre: "Contrat d'engagement",
    description: "Document cadrant les engagements reciproques du demandeur et du conseiller.",
    source: "France Travail",
    motsCles: ["contrat", "engagement", "suivi", "actions"],
  },
  {
    id: "REF_PMSMP",
    titre: "PMSMP",
    description: "Periode de mise en situation en milieu professionnel pour tester ou confirmer un projet.",
    source: "France Travail",
    motsCles: ["pmsmp", "immersion", "projet", "metier"],
  },
  {
    id: "REF_FORMATION",
    titre: "Formation",
    description: "Leviers de montee en competences selon projet, prerequis et faisabilite.",
    source: "France Travail",
    motsCles: ["formation", "competences", "prerequis", "financement"],
  },
  {
    id: "REF_FREINS_PERIPHERIQUES",
    titre: "Freins peripheriques",
    description: "Freins sociaux et logistiques impactant l'acces durable a l'emploi ou a la formation.",
    source: "Pratiques d'accompagnement",
    motsCles: ["freins", "mobilite", "logement", "autonomie", "motivation"],
  },
];

// Actions metier reutilisables par les domaines d'analyse.
export const ACTIONS_METIER: ActionMetier[] = [
  {
    id: "ACT_CLARIFIER_PROJET",
    libelle: "Clarifier un projet professionnel",
    description: "Structurer la cible metier et verifier la coherence du projet avant prescription.",
    references: ["REF_CONTRAT_ENGAGEMENT", "REF_PMSMP"],
  },
  {
    id: "ACT_PRESCRIRE_PMSMP",
    libelle: "Prescrire une PMSMP",
    description: "Proposer une immersion pour confirmer le projet ou valider la faisabilite terrain.",
    references: ["REF_PMSMP", "REF_LOI_PLEIN_EMPLOI"],
  },
  {
    id: "ACT_ETUDIER_ENTREE_FORMATION",
    libelle: "Etudier une entree en formation",
    description: "Analyser prerequis, financement et adequation formation/projet professionnel.",
    references: ["REF_FORMATION", "REF_CONTRAT_ENGAGEMENT"],
  },
  {
    id: "ACT_MOBILISER_PARTENAIRE",
    libelle: "Mobiliser un partenaire",
    description: "Activer un partenaire externe selon le frein identifie et l'objectif du parcours.",
    references: ["REF_FREINS_PERIPHERIQUES", "REF_LOI_PLEIN_EMPLOI"],
  },
  {
    id: "ACT_RENFORCER_ACCOMPAGNEMENT",
    libelle: "Renforcer l'accompagnement",
    description: "Mettre en place un suivi renforce lorsque les freins cumules ralentissent la progression.",
    references: ["REF_FREINS_PERIPHERIQUES", "REF_CONTRAT_ENGAGEMENT"],
  },
];
