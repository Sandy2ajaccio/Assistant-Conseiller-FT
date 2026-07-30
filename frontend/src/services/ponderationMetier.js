export const POIDS_FREINS = {
  sante: 40,
  logement: 35,
  mobilite: 30,
  gardeEnfant: 25,
  justice: 25,
  addiction: 25,
  langue: 20,
  numerique: 15,
  projet: 15,
  cv: 10,
  experience: 10,
}

export function calculerPrioriteFreins(freins = []) {
  return [...freins]
    .map((frein) => ({
      nom: frein,
      poids: POIDS_FREINS[frein] || 5,
    }))
    .sort((a, b) => b.poids - a.poids)
}

export function freinBloquantFormation(freins = []) {
  const prioritaires = calculerPrioriteFreins(freins)

  return prioritaires.find((f) =>
    ["sante", "logement", "mobilite"].includes(f.nom)
  )
}