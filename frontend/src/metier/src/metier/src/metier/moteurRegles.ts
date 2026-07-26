import { ProfilDemandeur } from "../../profilDemandeur";
import { REFERENTIEL_REGLES, RegleMetier, ResultatEvaluation } from "../../referentielRegles";

export interface RegleAppliquee {
  regle: RegleMetier;
  evaluation: ResultatEvaluation;
}

export interface ResultatAnalyse {
  regles: RegleAppliquee[];
  recommandations: string[];
  alertes: string[];
  prioriteGlobale: "faible" | "moyenne" | "élevée" | "critique";
}

const PRIORITE_ORDRE: Record<"faible" | "moyenne" | "élevée" | "critique", number> = {
  faible: 1,
  moyenne: 2,
  élevée: 3,
  critique: 4,
};

export function analyserProfil(
  profil: ProfilDemandeur
): ResultatAnalyse {

  const regles: RegleAppliquee[] = [];

  for (const regle of REFERENTIEL_REGLES) {
    if (!regle.evaluation) {
      continue;
    }

    const evaluation = regle.evaluation(profil);

    if (evaluation.applicable) {
      regles.push({ regle, evaluation });
    }
  }

  const recommandations = regles.flatMap(({ regle }) => regle.actions);

  const alertes = regles.map(
    ({ regle, evaluation }) => evaluation.justification ?? regle.justification
  );

  const prioriteGlobale = regles.reduce<"faible" | "moyenne" | "élevée" | "critique">(
    (maxPriorite, { evaluation }) => (
      PRIORITE_ORDRE[evaluation.priorite] > PRIORITE_ORDRE[maxPriorite]
        ? evaluation.priorite
        : maxPriorite
    ),
    "faible"
  );

  return {
    regles,
    recommandations,
    alertes,
    prioriteGlobale
  };

}