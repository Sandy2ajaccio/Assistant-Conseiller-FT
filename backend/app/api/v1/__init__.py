"""Version 1 API package pour Assistant Conseiller FT.

Ce package regroupe les routes d'API disponibles pour la version 1.
"""

from fastapi import APIRouter

from .analyse import router as analyse_router
from .accompagnements import router as accompagnements_router
from .dossier_demandeurs import router as dossier_demandeurs_router
from .portefeuille import router as portefeuille_router

router = APIRouter()
router.include_router(analyse_router)
router.include_router(accompagnements_router)
router.include_router(dossier_demandeurs_router)
router.include_router(portefeuille_router)
