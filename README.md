# Cap Décision FT

Assistant personnel d’aide à la décision pour les conseillers France Travail Corse.

## Ouvrir le logiciel

- Site public sécurisé : https://cap-decision-ft.web.app
- Sous Windows, double-cliquer sur `DEMARRER_CAP_DECISION.cmd` ou `Cap Decision FT.url`.

Le lanceur principal ouvre directement la version Firebase. Il ne nécessite ni installation de Node.js, ni serveur local, et sa fenêtre peut être fermée immédiatement.

## Développement local

Le fichier `DEMARRER_LOCAL_DEV.cmd` est réservé au développement. Il installe les dépendances si nécessaire, démarre Vite et ouvre http://localhost:3000.

## Architecture

- `frontend/` : application React, Vite, Firebase Authentication et Firestore
- `backend/` : API Python FastAPI et SQLAlchemy
- `database/` : ressources de données
- `docs/` : documentation du projet
- `tests/` : contrôles complémentaires

## Commandes de validation du frontend

Depuis le dossier `frontend` :

```bash
npm install
npm run check:auth
npm run check:routes
npm run build
```
