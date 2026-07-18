// Referentiel des partenaires mobilisables pour l'accompagnement.
export interface Partenaire {
  id: string;
  nom: string;
  domaine: string;
  intervientPour: string[];
}

export const PARTENAIRES: Partenaire[] = [
  {
    id: "PARTENAIRE_CAP_EMPLOI",
    nom: "Cap emploi",
    domaine: "Handicap et insertion professionnelle",
    intervientPour: ["RQTH", "Adaptation de parcours", "Maintien/retour à l'emploi"],
  },
  {
    id: "PARTENAIRE_MISSION_LOCALE",
    nom: "Mission Locale",
    domaine: "Accompagnement des jeunes",
    intervientPour: ["Jeunes", "Orientation", "Parcours CEJ"],
  },
  {
    id: "PARTENAIRE_CIDFF",
    nom: "CIDFF",
    domaine: "Accès aux droits et accompagnement social",
    intervientPour: ["Accès aux droits", "Appui social", "Information juridique"],
  },
  {
    id: "PARTENAIRE_CAF",
    nom: "CAF",
    domaine: "Prestations familiales et sociales",
    intervientPour: ["Ouverture de droits", "Soutien financier", "Situation familiale"],
  },
  {
    id: "PARTENAIRE_CONSEIL_DEPARTEMENTAL",
    nom: "Conseil Départemental",
    domaine: "Insertion et accompagnement social",
    intervientPour: ["RSA", "Levée de freins", "Coordination territoriale"],
  },
  {
    id: "PARTENAIRE_AFPA",
    nom: "AFPA",
    domaine: "Formation professionnelle",
    intervientPour: ["Montée en compétences", "Reconversion", "Qualification"],
  },
];
