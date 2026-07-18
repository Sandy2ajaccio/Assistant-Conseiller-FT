export type Priorite =
  | "faible"
  | "moyenne"
  | "élevée"
  | "critique";

export interface ElementDiagnostic {
  id: string;
  libelle: string;
  categorie:
    | "atout"
    | "frein"
    | "recommandation"
    | "decision"
    | "alerte";
  priorite?: Priorite;
}

export interface AnalyseDomaine {
  domaine: string;
  score: number;
  priorite: Priorite;
  elements: ElementDiagnostic[];
  raisonnement: string[];
}
