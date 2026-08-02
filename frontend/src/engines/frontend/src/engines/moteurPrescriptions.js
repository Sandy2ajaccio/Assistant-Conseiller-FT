import {
  recommanderPrestations,
} from '../data/prestations'

export const analyserPrescriptions = (demandeur = {}) => {
  const recommandations = recommanderPrestations({
    projetConfirme: demandeur.projetConfirme,
    creationEntreprise: demandeur.creationEntreprise,
    reconversion: demandeur.reconversion,
    formation: demandeur.formation,
    employeurIdentifie: demandeur.employeurIdentifie,
    rqth: demandeur.rqth,
    sante: demandeur.sante,
    numerique: demandeur.numerique,
    rsa: demandeur.rsa,
    freins: demandeur.freins || [],
    age: demandeur.age,
    besoinAccompagnementIntensif:
      demandeur.besoinAccompagnementIntensif,
  })

  return {
    nombreRecommandations: recommandations.length,

    recommandations,

    actionsPrioritaires: recommandations
      .slice(0, 5)
      .map((prestation) => ({
        prestation: prestation.nom,
        score: prestation.score,
        motifs: prestation.motifs,
      })),

    niveauPriorite:
      recommandations.length >= 5
        ? 'Très élevée'
        : recommandations.length >= 3
        ? 'Élevée'
        : recommandations.length >= 1
        ? 'Normale'
        : 'Aucune',

    resume:
      recommandations.length === 0
        ? 'Aucune prestation prioritaire détectée.'
        : `${recommandations.length} prestation(s) recommandée(s).`,
  }
}

export default analyserPrescriptions
