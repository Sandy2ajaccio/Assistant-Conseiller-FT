from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.accompagnement_schema import (
    AccompagnementCreate,
    AccompagnementRead,
    AccompagnementUpdate,
)
from app.services.accompagnement_service import AccompagnementService

router = APIRouter(prefix="/api/v1/accompagnements", tags=["accompagnements"])


@router.get("/", response_model=List[AccompagnementRead])
async def lister_accompagnements(session: AsyncSession = Depends(get_db)):
    """Retourne la liste des accompagnements."""
    return await AccompagnementService.lister(session)


@router.get("/{accompagnement_id}", response_model=AccompagnementRead)
async def recuperer_accompagnement(
    accompagnement_id: int, session: AsyncSession = Depends(get_db)
):
    """Retourne un accompagnement par son identifiant."""
    return await AccompagnementService.recuperer(session, accompagnement_id)


@router.get("/dossier/{dossier_demandeur_id}", response_model=List[AccompagnementRead])
async def lister_accompagnements_dossier(
    dossier_demandeur_id: int, session: AsyncSession = Depends(get_db)
):
    """Retourne les accompagnements pour un dossier demandeur."""
    return await AccompagnementService.lister_par_dossier(session, dossier_demandeur_id)


@router.post("/", response_model=AccompagnementRead, status_code=201)
async def creer_accompagnement(
    accompagnement: AccompagnementCreate, session: AsyncSession = Depends(get_db)
):
    """Crée un nouvel accompagnement."""
    return await AccompagnementService.creer(session, accompagnement)


@router.put("/{accompagnement_id}", response_model=AccompagnementRead)
async def modifier_accompagnement(
    accompagnement_id: int,
    accompagnement: AccompagnementUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Met à jour un accompagnement existant."""
    return await AccompagnementService.modifier(session, accompagnement_id, accompagnement)


@router.delete("/{accompagnement_id}", status_code=204)
async def supprimer_accompagnement(
    accompagnement_id: int, session: AsyncSession = Depends(get_db)
):
    """Supprime un accompagnement existant."""
    await AccompagnementService.supprimer(session, accompagnement_id)
    return None
