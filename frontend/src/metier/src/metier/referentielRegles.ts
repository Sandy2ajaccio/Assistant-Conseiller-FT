/**
 * Référentiel central des règles métier
 * Cap Décision FT
 */

import type { ProfilDemandeur } from "./profilDemandeur";

export type Priorite =
  | "critique"
  | "élevée"
  | "moyenne"
  | "faible";

export interface ResultatEvaluation {
  applicable: boolean;
  score: number;
  priorite: "faible" | "moyenne" | "élevée" | "critique";
  justification?: string;
}

export interface RegleMetier {
  id: string;

  domaine:
    | "Projet"
    | "Formation"
    | "Loi Plein emploi"
    | "RSA"
    | "Mobilité"
    | "RQTH"
    | "Santé"
    | "Recherche emploi"
    | "Partenaires"
    | "MAP";

  titre: string;

  objectif: string;

  description: string;

  public: string[];

  priorite: Priorite;

  conditions: string[];

  criteresAnalyse: string[];

  pointsVigilance: string[];

  exceptions: string[];

  actions: string[];

  actionsAEviter: string[];

  alternatives: string[];

  justification: string;

  references: string[];

  synthese: string;

  explicationConseiller: string;

  explicationDemandeur: string;

  indicateurs: string[];

  reglesLiees: string[];

  version: string;

  derniereMiseAJour: string;

  evaluation?: (profil: ProfilDemandeur) => ResultatEvaluation;
}

export const REFERENTIEL_REGLES: RegleMetier[] = [

  {
    id: "FT-PROJET-001",

    domaine: "Projet",

    titre: "Projet professionnel insuffisamment défini",

    objectif:
      "Clarifier le projet professionnel avant toute prescription importante.",

    description:
      "Le projet n'est pas suffisamment construit pour engager une formation ou une orientation spécialisée.",

    public: ["Tous publics"],

    priorite: "élevée",

    conditions: [
      "Métier non identifié",
      "Plusieurs projets",
      "Projet changeant",
      "Méconnaissance du métier"
    ],

    criteresAnalyse: [
      "Projet défini",
      "Motivation",
      "Connaissance du métier",
      "Cohérence"
    ],

    pointsVigilance: [
      "Éviter une entrée prématurée en formation"
    ],

    exceptions: [
      "Projet déjà validé"
    ],

    actions: [
      "Approfondir l'entretien",
      "Clarifier le projet",
      "Étudier une PMSMP",
      "Proposer une prestation adaptée"
    ],

    actionsAEviter: [
      "Prescrire immédiatement une formation"
    ],

    alternatives: [
      "Immersion",
      "Exploration métiers"
    ],

    justification:
      "Une décision fiable nécessite un projet professionnel stabilisé.",

    references: [],

    synthese:
      "Le projet professionnel nécessite d'être approfondi avant toute orientation vers une formation.",

    explicationConseiller:
      "Le moteur détecte un manque de maturité du projet.",

    explicationDemandeur:
      "L'objectif est de sécuriser votre parcours avant de vous engager dans une formation.",

    indicateurs: [
      "Projet clairement formulé",
      "Métier identifié"
    ],

    reglesLiees: [
      "FT-FORMATION-001"
    ],

    version: "1.0",

    derniereMiseAJour: "2026-07-18",

    evaluation: (profil: ProfilDemandeur) => {
      if (!profil.projetDefini) {
        return {
          applicable: true,
          score: 100,
          priorite: "élevée",
          justification: "Projet professionnel insuffisamment défini."
        };
      }

      return {
        applicable: false,
        score: 0,
        priorite: "faible"
      };
    }
  },

  {
    id: "FT-FORMATION-001",

    domaine: "Formation",

    titre: "Formation non pertinente tant que le projet professionnel n'est pas stabilisé.",

    objectif:
      "Éviter une prescription de formation avant la stabilisation du projet professionnel.",

    description:
      "Lorsque le projet professionnel n'est pas défini, la formation ne constitue pas la décision prioritaire.",

    public: ["Tous publics"],

    priorite: "élevée",

    conditions: [
      "Projet professionnel non défini"
    ],

    criteresAnalyse: [
      "Projet professionnel défini",
      "Besoin immédiat de formation",
      "Maturité du projet"
    ],

    pointsVigilance: [
      "Ne pas prescrire une formation sur un projet instable"
    ],

    exceptions: [
      "Projet validé et cohérent"
    ],

    actions: [
      "Clarifier le projet professionnel",
      "Étudier une PMSMP",
      "Reporter la prescription de formation"
    ],

    actionsAEviter: [
      "Entrer en formation immédiatement"
    ],

    alternatives: [
      "Exploration des métiers",
      "Immersion professionnelle"
    ],

    justification:
      "Une formation est non pertinente tant que le projet professionnel n'est pas stabilisé.",

    references: [],

    synthese:
      "La formation est reportée tant que le projet professionnel n'est pas clarifié.",

    explicationConseiller:
      "Le moteur confirme qu'il faut stabiliser le projet avant toute prescription de formation.",

    explicationDemandeur:
      "Nous clarifions d'abord votre projet pour orienter ensuite vers une formation adaptée.",

    indicateurs: [
      "Projet professionnel formulé",
      "Cible métier validée"
    ],

    reglesLiees: [
      "FT-PROJET-001",
      "FT-FORMATION-002"
    ],

    version: "1.0",

    derniereMiseAJour: "2026-07-18",

    evaluation: (profil: ProfilDemandeur) => {
      if (!profil.projetDefini) {
        return {
          applicable: true,
          score: 100,
          priorite: "élevée",
          justification: "Le projet professionnel doit être stabilisé avant toute prescription de formation."
        };
      }

      return {
        applicable: false,
        score: 0,
        priorite: "faible"
      };
    }
  },

  {
    id: "FT-FORMATION-002",

    domaine: "Formation",

    titre:
      "Formation pertinente lorsqu'un besoin de compétences est identifié.",

    objectif:
      "Orienter vers la formation lorsque le projet est défini et qu'un besoin de compétences est confirmé.",

    description:
      "La formation devient une décision pertinente si le projet professionnel est défini et si un besoin de montée en compétences est identifié.",

    public: ["Tous publics"],

    priorite: "moyenne",

    conditions: [
      "Projet professionnel défini",
      "Besoin de formation identifié"
    ],

    criteresAnalyse: [
      "Projet professionnel défini",
      "Besoin de formation",
      "Adéquation compétences/métier"
    ],

    pointsVigilance: [
      "Vérifier les prérequis et la faisabilité"
    ],

    exceptions: [
      "Contraintes majeures non levées"
    ],

    actions: [
      "Vérifier les prérequis",
      "Étudier le financement",
      "Rechercher une formation adaptée"
    ],

    actionsAEviter: [
      "Prescrire une formation non alignée au projet"
    ],

    alternatives: [
      "PMSMP",
      "Ateliers de renforcement des compétences"
    ],

    justification:
      "La formation est pertinente lorsque le projet est défini et qu'un besoin de compétences est identifié.",

    references: [],

    synthese:
      "Une entrée en formation est étudiée avec vérification des prérequis et des financements.",

    explicationConseiller:
      "Le moteur confirme la pertinence de la formation dans cette situation.",

    explicationDemandeur:
      "Votre projet permet d'étudier une formation adaptée à vos besoins de compétences.",

    indicateurs: [
      "Projet professionnel défini",
      "Besoin de compétences documenté",
      "Prérequis validés"
    ],

    reglesLiees: [
      "FT-FORMATION-001",
      "FT-FORMATION-003"
    ],

    version: "1.0",

    derniereMiseAJour: "2026-07-18",

    evaluation: (profil: ProfilDemandeur) => {
      if (profil.projetDefini && profil.besoinFormation) {
        return {
          applicable: true,
          score: 80,
          priorite: "moyenne",
          justification: "Une formation peut être envisagée pour répondre à un besoin identifié en compétences."
        };
      }

      return {
        applicable: false,
        score: 0,
        priorite: "faible"
      };
    }
  },

  {
    id: "FT-FORMATION-003",

    domaine: "Formation",

    titre:
      "Contraintes incompatibles avec une entrée en formation.",

    objectif:
      "Prioriser la levée des contraintes majeures avant toute entrée en formation.",

    description:
      "Même en présence d'un besoin de formation, l'entrée en formation est impossible tant que la mobilité ou le logement ne sont pas stabilisés.",

    public: ["Tous publics"],

    priorite: "critique",

    conditions: [
      "Besoin de formation identifié",
      "Mobilité insuffisante ou logement instable"
    ],

    criteresAnalyse: [
      "Besoin de formation",
      "Mobilité suffisante",
      "Logement stable"
    ],

    pointsVigilance: [
      "Ne pas engager une entrée en formation sans sécurisation des contraintes majeures"
    ],

    exceptions: [
      "Contraintes levées"
    ],

    actions: [
      "Lever les freins",
      "Reporter l'entrée en formation",
      "Mobiliser les partenaires adaptés"
    ],

    actionsAEviter: [
      "Maintenir une entrée en formation malgré les contraintes"
    ],

    alternatives: [
      "Accompagnement global",
      "Coordination partenaires mobilité/logement"
    ],

    justification:
      "Les contraintes majeures doivent être levées avant toute entrée en formation.",

    references: [],

    synthese:
      "L'entrée en formation est reportée, la priorité est donnée à la levée des freins majeurs.",

    explicationConseiller:
      "Le moteur signale un blocage critique à traiter avant la formation.",

    explicationDemandeur:
      "Nous devons d'abord résoudre les freins majeurs pour sécuriser votre future formation.",

    indicateurs: [
      "Mobilité suffisante",
      "Logement stabilisé",
      "Freins majeurs levés"
    ],

    reglesLiees: [
      "FT-FORMATION-001",
      "FT-FORMATION-002"
    ],

    version: "1.0",

    derniereMiseAJour: "2026-07-18",

    evaluation: (profil: ProfilDemandeur) => {
      if (
        profil.besoinFormation &&
        (!profil.mobiliteSuffisante || !profil.logementStable)
      ) {
        return {
          applicable: true,
          score: 100,
          priorite: "critique",
          justification: "Les contraintes actuelles ne permettent pas une entrée en formation dans de bonnes conditions."
        };
      }

      return {
        applicable: false,
        score: 0,
        priorite: "faible"
      };
    }
  },

  {
    id: "FT-MOBILITE-001",

    domaine: "Mobilité",

    titre:
      "Absence de solution de mobilité.",

    objectif:
      "Traiter prioritairement le frein mobilité pour sécuriser le retour à l'emploi.",

    description:
      "L'absence de solution de mobilité peut empêcher l'accès aux opportunités professionnelles et aux dispositifs d'accompagnement.",

    public: ["Tous publics"],

    priorite: "critique",

    conditions: [
      "Absence de mobilité suffisante"
    ],

    criteresAnalyse: [
      "Mobilité suffisante",
      "Accès aux transports",
      "Compatibilité mobilité/projet"
    ],

    pointsVigilance: [
      "Évaluer l'impact immédiat du frein mobilité sur le parcours"
    ],

    exceptions: [
      "Aucune"
    ],

    actions: [
      "Identifier les solutions de mobilité existantes",
      "Mobiliser les partenaires compétents",
      "Adapter le projet professionnel si nécessaire"
    ],

    actionsAEviter: [
      "Maintenir une orientation incompatible avec la mobilité actuelle"
    ],

    alternatives: [
      "Adaptation du bassin de recherche",
      "Solutions de transport alternatives"
    ],

    justification:
      "L'absence de solution de mobilité constitue un frein majeur au retour à l'emploi.",

    references: [],

    synthese:
      "Le frein mobilité est prioritaire et nécessite des actions immédiates de sécurisation.",

    explicationConseiller:
      "Le moteur identifie la mobilité comme facteur critique de blocage.",

    explicationDemandeur:
      "Nous devons d'abord sécuriser une solution de mobilité pour rendre le projet réalisable.",

    indicateurs: [
      "Solution de mobilité identifiée",
      "Projet ajusté si nécessaire"
    ],

    reglesLiees: [
      "FT-MOBILITE-002",
      "FT-MOBILITE-003"
    ],

    version: "1.0",

    derniereMiseAJour: "2026-07-18",

    evaluation: (profil: ProfilDemandeur) => {
      if (!profil.mobiliteSuffisante) {
        return {
          applicable: true,
          score: 100,
          priorite: "critique",
          justification: "L'absence de solution de mobilité constitue un frein majeur au retour à l'emploi."
        };
      }

      return {
        applicable: false,
        score: 0,
        priorite: "faible"
      };
    }
  },

  {
    id: "FT-MOBILITE-002",

    domaine: "Mobilité",

    titre:
      "Mobilité compatible avec le projet.",

    objectif:
      "Confirmer la poursuite du parcours lorsque la mobilité est compatible avec le projet.",

    description:
      "Une mobilité suffisante permet de maintenir la dynamique d'accompagnement et d'ouvrir des opportunités adaptées.",

    public: ["Tous publics"],

    priorite: "faible",

    conditions: [
      "Mobilité suffisante"
    ],

    criteresAnalyse: [
      "Mobilité suffisante",
      "Compatibilité mobilité/projet",
      "Accès aux offres"
    ],

    pointsVigilance: [
      "Maintenir la cohérence entre mobilité disponible et ciblage des offres"
    ],

    exceptions: [
      "Aucune"
    ],

    actions: [
      "Poursuivre le parcours",
      "Rechercher des offres compatibles"
    ],

    actionsAEviter: [
      "Complexifier inutilement le parcours"
    ],

    alternatives: [
      "Élargissement progressif du périmètre de recherche"
    ],

    justification:
      "La mobilité actuelle permet d'envisager la poursuite du projet professionnel.",

    references: [],

    synthese:
      "La mobilité est compatible avec le projet et permet la poursuite du parcours.",

    explicationConseiller:
      "Le moteur confirme l'absence de frein mobilité bloquant.",

    explicationDemandeur:
      "Votre mobilité actuelle est compatible avec la poursuite de votre projet.",

    indicateurs: [
      "Mobilité maintenue",
      "Offres compatibles identifiées"
    ],

    reglesLiees: [
      "FT-MOBILITE-001",
      "FT-MOBILITE-003"
    ],

    version: "1.0",

    derniereMiseAJour: "2026-07-18",

    evaluation: (profil: ProfilDemandeur) => {
      if (profil.mobiliteSuffisante) {
        return {
          applicable: true,
          score: 70,
          priorite: "faible",
          justification: "La mobilité actuelle permet d'envisager la poursuite du projet professionnel."
        };
      }

      return {
        applicable: false,
        score: 0,
        priorite: "faible"
      };
    }
  },

  {
    id: "FT-MOBILITE-003",

    domaine: "Mobilité",

    titre:
      "Absence de permis ou de véhicule.",

    objectif:
      "Évaluer l'impact de l'absence de permis ou de véhicule sur l'accès aux opportunités professionnelles.",

    description:
      "L'absence de permis ou de véhicule peut limiter les possibilités d'emploi selon les métiers et le territoire.",

    public: ["Tous publics"],

    priorite: "moyenne",

    conditions: [
      "Absence de permis ou de véhicule"
    ],

    criteresAnalyse: [
      "Permis de conduire",
      "Véhicule disponible",
      "Besoins de mobilité du métier visé"
    ],

    pointsVigilance: [
      "Vérifier le caractère réellement bloquant de l'absence de permis ou de véhicule"
    ],

    exceptions: [
      "Métiers accessibles sans permis ni véhicule"
    ],

    actions: [
      "Vérifier si le métier nécessite réellement un permis",
      "Étudier les transports disponibles",
      "Étudier les aides à la mobilité"
    ],

    actionsAEviter: [
      "Écarter des opportunités sans analyse des alternatives de transport"
    ],

    alternatives: [
      "Ciblage d'offres accessibles en transport en commun",
      "Solutions de covoiturage"
    ],

    justification:
      "L'absence de permis ou de véhicule peut limiter certaines opportunités professionnelles.",

    references: [],

    synthese:
      "L'absence de permis ou de véhicule nécessite une analyse des alternatives de mobilité.",

    explicationConseiller:
      "Le moteur détecte un risque de restriction d'accès à certaines opportunités.",

    explicationDemandeur:
      "Nous vérifions ensemble les options de transport et les aides mobilisables.",

    indicateurs: [
      "Alternatives de transport identifiées",
      "Frein mobilité réduit"
    ],

    reglesLiees: [
      "FT-MOBILITE-001",
      "FT-MOBILITE-002"
    ],

    version: "1.0",

    derniereMiseAJour: "2026-07-18",

    evaluation: (profil: ProfilDemandeur) => {
      if (!profil.permis || !profil.vehicule) {
        return {
          applicable: true,
          score: 60,
          priorite: "moyenne",
          justification: "L'absence de permis ou de véhicule peut limiter certaines opportunités professionnelles."
        };
      }

      return {
        applicable: false,
        score: 0,
        priorite: "faible"
      };
    }
  }

];