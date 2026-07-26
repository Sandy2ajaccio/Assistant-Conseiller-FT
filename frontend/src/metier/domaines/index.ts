import type { ProfilDemandeur } from "../src/metier/profilDemandeur";
import { analyserProjet, type AnalyseDomaine } from "./analyseProjet";
import { analyserFormation } from "./analyseFormation";

export interface EtapeDiagnostic {
  domaine: string;
  niveau: "information" | "analyse" | "decision" | "alerte";
  message: string;
}

export interface DiagnosticGlobal {
  analyses: AnalyseDomaine[];
  scoreGlobal: number;
  prioriteGlobale: "faible" | "moyenne" | "élevée" | "critique";
  recommandations: string[];
  decisions: string[];
  alertes: string[];
  raisonnements: string[];
  historique: EtapeDiagnostic[];
}

type Priorite = "faible" | "moyenne" | "élevée" | "critique";

const PRIORITE_ORDRE: Record<Priorite, number> = {
  faible: 1,
  moyenne: 2,
  élevée: 3,
  critique: 4,
};

const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const getPrioriteGlobale = (analyses: AnalyseDomaine[]): Priorite =>
  analyses.reduce<Priorite>(
    (maxPriorite, analyse) =>
      PRIORITE_ORDRE[analyse.priorite] > PRIORITE_ORDRE[maxPriorite]
        ? analyse.priorite
        : maxPriorite,
    "faible"
  );

const getScoreGlobal = (analyses: AnalyseDomaine[]): number => {
  if (analyses.length === 0) return 0;

  const total = analyses.reduce((sum, analyse) => sum + analyse.score, 0);
  return total / analyses.length;
};

const buildHistorique = (analyses: AnalyseDomaine[]): EtapeDiagnostic[] => {
  const historique: EtapeDiagnostic[] = [];

  analyses.forEach((analyse) => {
    historique.push({
      domaine: analyse.domaine,
      niveau: "analyse",
      message: `Analyse du domaine ${analyse.domaine} terminée (score ${analyse.score}%).`,
    });

    analyse.raisonnement.forEach((message) => {
      historique.push({
        domaine: analyse.domaine,
        niveau: "analyse",
        message,
      });
    });

    analyse.decisions.forEach((message) => {
      historique.push({
        domaine: analyse.domaine,
        niveau: "decision",
        message,
      });
    });

    analyse.alertes.forEach((message) => {
      historique.push({
        domaine: analyse.domaine,
        niveau: "alerte",
        message,
      });
    });
  });

  return historique;
};

export function analyserSituation(profil: ProfilDemandeur): DiagnosticGlobal {
  // Ajouter un nouveau domaine ici pour étendre le diagnostic global.
  const analyses: AnalyseDomaine[] = [
    analyserProjet(profil),
    analyserFormation(profil),
  ];

  const recommandations = uniqueValues(
    analyses.flatMap((analyse) => analyse.recommandations)
  );

  const decisions = uniqueValues(
    analyses.flatMap((analyse) => analyse.decisions)
  );

  const alertes = uniqueValues(
    analyses.flatMap((analyse) => analyse.alertes)
  );

  const raisonnements = uniqueValues(
    analyses.flatMap((analyse) => analyse.raisonnement)
  );

  const historique = buildHistorique(analyses);

  return {
    analyses,
    scoreGlobal: getScoreGlobal(analyses),
    prioriteGlobale: getPrioriteGlobale(analyses),
    recommandations,
    decisions,
    alertes,
    raisonnements,
    historique,
  };
}
