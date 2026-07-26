import { Link } from 'react-router-dom'
import { demandeurs } from '../data/ateliers'

function DemandeurList() {
  return (
    <section className="dashboard-card">
      <div className="card-header">
        <h3>Liste des demandes anonymisées</h3>
        <p>Accès aux dossiers sans données personnelles réelles.</p>
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Dossier</th>
              <th>Portefeuille</th>
              <th>Recherche d'emploi</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {demandeurs.map((item) => (
              <tr key={item.id}>
                <td>Dossier anonyme #{String(item.id).padStart(3, '0')}</td>
                <td>{item.portefeuille}</td>
                <td>{item.rechercheEmploi}</td>
                <td>
                  <Link to={`/demandeurs/${item.id}`}>Voir</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default DemandeurList
