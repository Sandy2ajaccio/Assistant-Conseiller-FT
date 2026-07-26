import { sourcesOfficielles, veilleOfficielle, VEILLE_DERNIERE_VERIFICATION } from '../data/veilleOfficielle'

const nombreParNiveau = (niveau) => veilleOfficielle.filter((item) => item.niveau === niveau).length

export default function VeilleOfficiellePage() {
  return (
    <div className="veille-page">
      <section className="veille-hero">
        <div>
          <p className="veille-eyebrow">Veille réglementaire et dispositifs</p>
          <h1>Ce qui change pour votre travail</h1>
          <p>Sources publiques officielles. Dernière vérification : <strong>{VEILLE_DERNIERE_VERIFICATION}</strong>.</p>
        </div>
        <div className="veille-status"><strong>Contrôle hebdomadaire</strong><span>Chaque lundi</span></div>
      </section>

      <section className="veille-warning">
        <strong>Règle de sécurité métier</strong>
        <span>Une actualité ne modifie jamais seule le diagnostic. Le texte en vigueur et les consignes internes France Travail restent prioritaires.</span>
      </section>

      <section className="veille-kpis" aria-label="Résumé de la veille">
        <article><span>Informations suivies</span><strong>{veilleOfficielle.length}</strong></article>
        <article className="veille-kpi-orange"><span>Points de vigilance</span><strong>{nombreParNiveau('Vigilance')}</strong></article>
        <article className="veille-kpi-green"><span>Nouveautés opérationnelles</span><strong>{nombreParNiveau('Nouveauté')}</strong></article>
        <article className="veille-kpi-purple"><span>Sources officielles</span><strong>{sourcesOfficielles.length}</strong></article>
      </section>

      <section className="veille-grid">
        {veilleOfficielle.map((item) => (
          <article className={`veille-card veille-${item.niveau.toLowerCase()}`} key={item.id}>
            <div className="veille-card-top"><span className="veille-level">{item.niveau}</span><span className="veille-category">{item.categorie}</span></div>
            <h2>{item.titre}</h2>
            <p>{item.resume}</p>
            <div className="veille-impact"><strong>Ce que cela implique</strong><span>{item.impact}</span></div>
            <div className="veille-card-footer">
              <div><strong>{item.source}</strong><span>{item.dateSource}</span></div>
              <a href={item.url} target="_blank" rel="noreferrer">Consulter la source officielle</a>
            </div>
          </article>
        ))}
      </section>

      <section className="veille-sources">
        <h2>Sources surveillées</h2>
        <div>{sourcesOfficielles.map((source) => (
          <a href={source.url} target="_blank" rel="noreferrer" key={source.nom}>
            <strong>{source.nom}</strong><span>{source.role}</span>
          </a>
        ))}</div>
      </section>
    </div>
  )
}
