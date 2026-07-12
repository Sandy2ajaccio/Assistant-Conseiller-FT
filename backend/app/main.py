from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import router as api_router
from app.core.config import settings
from app.core.database import engine
from app.models.base import Base

# Importer les modules de modèle afin que SQLAlchemy enregistre toutes les métadonnées.
from app.models import accompagnement, dossier_demandeur, portefeuille  # noqa: F401


app = FastAPI(title="Assistant Conseiller FT", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(settings.FRONTEND_URL)],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
async def on_startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health_check() -> dict:
    """Point de santé de l'API."""
    return {"status": "ok"}
