# Assistant Conseiller FT

Projet professionnel FastAPI + React + PostgreSQL pour une application de conseiller assistant.

## Architecture

- `backend/` : API Python FastAPI, SQLAlchemy, configuration PostgreSQL
- `frontend/` : interface React avec Vite
- `docker-compose.yml` : services Postgres, backend et frontend
- `.env.example` : variables d'environnement de base

## Démarrage local

1. Copier `.env.example` en `.env`
2. Démarrer Docker Compose :
   ```bash
   docker compose up --build
   ```
3. Backend : http://localhost:8000
4. Frontend : http://localhost:3000

## Backend

- API : `/api/v1/advisors`
- Healthcheck : `/health`

## Frontend

- Page d'accueil avec liste d'advisors
