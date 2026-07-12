import { Link } from 'react-router-dom'
import { Portefeuille } from '../types/portefeuille'

const portefeuilles: Portefeuille[] = [
  {
    id: 1,
    nom: 'Portefeuille Conseillers',
    description: 'Portefeuille de suivi prioritaire',
    actif: true,
  },
  {
    id: 2,
    nom: 'Portefeuille RSA',
    description: 'Suivi des demandeurs RSA',
    actif: false,
  },
]

function ListeDemandeurs() {
  return (
    <section className="page-card">
      <div className="page-title">
        <div>
          <h2>Liste des demandeurs</h2>
          <p>Page de démonstration pour la navigation métier.</p>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Portefeuille</th>
              <th>Description</th>
              <th>Actif</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {portefeuilles.map((portefeuille) => (
              <tr key={portefeuille.id}>
                <td>{portefeuille.nom}</td>
                <td>{portefeuille.description}</td>
                <td>{portefeuille.actif ? 'Oui' : 'Non'}</td>
                <td>
                  <Link to={`/demandeurs/${portefeuille.id}`}>Ouvrir</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ListeDemandeurs
