import type { ProfilDemandeur } from "../src/metier/profilDemandeur";
import type { AnalyseDomaine } from "./analyseProjet";

export function analyserFreins(profil: ProfilDemandeur): AnalyseDomaine {
  const freinsDetectes: string[] = [];

  if (!profil.mobiliteSuffisante) {
    freinsDetectes.push("Mobilité");
  }

  if (!profil.logementStable) {
    freinsDetectes.push("Logement");
  }

  // Compatibilité maximale: accepte false explicite ou niveau faible.
  if ((profil as unknown as { autonomie?: boolean }).autonomie === false || profil.autonomie === "faible") {
    freinsDetectes.push("Autonomie");
  }

  // Compatibilité maximale: accepte false explicite ou niveau faible.
  if ((profil as unknown as { motivation?: boolean }).motivation === false || profil.motivation === "faible") {
    freinsDetectes.push("Motivation");
  }

  if (Array.isArray(profil.freins)) {
    freinsDetectes.push(...profil.freins.filter(Boolean));
  }

  const freins = Array.from(new Set(freinsDetectes));
  const nombreFreins = freins.length;

  let score = 100;
  let priorite: "faible" | "moyenne" | "élevée" | "critique" = "faible";

  if (nombreFreins >= 5) {
    score = 20;
    priorite = "critique";
  } else if (nombreFreins >= 3) {
    score = 40;
    priorite = "élevée";
  } else if (nombreFreins >= 1) {
    score = 70;
    priorite = "moyenne";
  }

  const atouts = nombreFreins === 0 ? ["Aucun frein majeur identifié"] : [];

  const raisonnement = [
    "Analyse des freins périphériques",
    `${nombreFreins} frein(s) identifié(s).`,
  ];

  const recommandations =
    nombreFreins > 0
      ? [
          "Prioriser la levée des freins",
          "Mobiliser les partenaires adaptés",
          "Réévaluer la situation après accompagnement",
        ]
      : ["Poursuivre le parcours vers l'emploi"];

  const decisions =
    nombreFreins > 2
      ? ["Mettre en place un accompagnement renforcé"]
      : ["Poursuivre le parcours"];

  const alertes =
    priorite === "critique"
      ? ["Accumulation importante de freins à l'insertion."]
      : [];

  return {
    domaine: "Freins",
    score,
    priorite,
    atouts,
    freins,
    recommandations,
    decisions,
    alertes,
    raisonnement,
  };
}
