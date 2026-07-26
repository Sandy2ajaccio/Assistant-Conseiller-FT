import SectionCard from '../components/SectionCard'
import DecisionNotice from '../components/DecisionNotice'
import {
  portefeuilles,
} from '../knowledge/portefeuilles'
import { connaissancesAteliers } from '../knowledge/ateliers'
import { connaissancesPrestations } from '../knowledge/prestations'
import { connaissancesPartenaires } from '../knowledge/partenaires'

const blocks = [
  ['Portefeuilles', portefeuilles],
  ['Ateliers', connaissancesAteliers],
  ['Prestations', connaissancesPrestations],
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
                    <strong>{item.nom || item.id || item}</strong>
                    {item.description ? <p>{item.description}</p> : <p>Fiche de connaissance vide.</p>}
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
