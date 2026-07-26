import SectionCard from '../components/SectionCard'
import DecisionNotice from '../components/DecisionNotice'
import {
  portefeuilles,
} from '../knowledge/portefeuilles'
import { connaissancesAteliers } from '../knowledge/ateliers'
import { connaissancesPrestations } from '../knowledge/prestations'
import { connaissancesPartenaires } from '../knowledge/partenaires'
import { getReferentielSection } from '../services/referentielService'

const blocks = [
  ['Portefeuilles', portefeuilles],
  ['Ateliers', connaissancesAteliers],
  ['Prestations', connaissancesPrestations],
  ['Rémunération en formation', getReferentielSection('remunerationFormation')],
  ['Partenaires', connaissancesPartenaires],
]

function CentreConnaissancesPage() {
  return (
    <section className="demandeur-page">
      <div className="page-title">
        <div>
          <h2>Centre de connaissances</h2>
          <p>Référentiels simplifiés de la V1.</p>
          <span className="rgpd-badge">Analyse anonymisée – aide à la décision uniquement</span>
        </div>
      </div>

      <DecisionNotice />

      <div className="dashboard-grid">
        {blocks.map(([title, items]) => (
          <SectionCard key={title} title={title} description={`${items.length} éléments disponibles.`}>
            <ul className="list-card">
              {items.length > 0 ? (
                items.map((item) => (
                  <li key={item.id || item.nom || item}>
                    <strong>{item.nom || item.libelle || item.id || item}</strong>
                    {item.description ? <p>{item.description}</p> : <p>Fiche de connaissance vide.</p>}
                    {item.objectif ? <p><b>Objectif :</b> {item.objectif}</p> : null}
                    {item.public ? <p><b>Public :</b> {item.public}</p> : null}
                    {item.criteres?.length ? <p><b>Repères d’orientation :</b> {item.criteres.join(' • ')}</p> : null}
                    {item.accompagnement ? <p><b>Accompagnement :</b> {item.accompagnement}</p> : null}
                    {item.actions?.length ? <p><b>Actions conseillées :</b> {item.actions.join(' • ')}</p> : null}
                    {item.vigilance ? <p className="knowledge-vigilance"><b>Point de vigilance :</b> {item.vigilance}</p> : null}
                    {item.duree ? <p><b>Durée :</b> {item.duree}</p> : null}
                    {item.intervenants ? <p><b>Intervenants :</b> {item.intervenants}</p> : null}
                    {item.prescription ? <p><b>Prescription :</b> {item.prescription}</p> : null}
                    {item.conditions?.length ? <p><b>Conditions :</b> {item.conditions.join(' - ')}</p> : null}
                  </li>
                ))
              ) : (
                <li>Contenu vide pour cette rubrique.</li>
              )}
            </ul>
          </SectionCard>
        ))}
      </div>
    </section>
  )
}

export default CentreConnaissancesPage
