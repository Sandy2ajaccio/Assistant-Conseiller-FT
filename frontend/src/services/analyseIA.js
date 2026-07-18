export function genererSynthese(donnees) {
  return donnees.map((item) => ({
    ...item,
    synthese: `Recommandation : suivre le dossier anonyme #${String(item.id).padStart(3, '0')} en priorité.`,
  }))
}
