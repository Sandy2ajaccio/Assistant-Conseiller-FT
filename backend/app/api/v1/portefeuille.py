from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.portefeuille_schema import PortefeuilleSchema
from app.services.portefeuille_service import PortefeuilleService

router = APIRouter(prefix="/api/v1/portefeuille", tags=["portefeuille"])


@router.get("/", response_model=List[PortefeuilleSchema])
async def lister_portefeuille(session: AsyncSession = Depends(get_db)) -> List[PortefeuilleSchema]:
    """Retourne la liste des portefeuilles."""
    portefeuilles = await PortefeuilleService.lister(session)
    return portefeuilles


@router.get("/{portefeuille_id}", response_model=PortefeuilleSchema)
async def recuperer_portefeuille(
    portefeuille_id: int, session: AsyncSession = Depends(get_db)
) -> PortefeuilleSchema:
    """Retourne un portefeuille par son identifiant."""
    portefeuille = await PortefeuilleService.recuperer(session, portefeuille_id)
    return portefeuille


@router.post("/", response_model=PortefeuilleSchema)
async def creer_portefeuille(
    portefeuille: PortefeuilleSchema, session: AsyncSession = Depends(get_db)
) -> PortefeuilleSchema:
    """Crée un nouveau portefeuille."""
    return await PortefeuilleService.creer(session, portefeuille)


@router.put("/{portefeuille_id}", response_model=PortefeuilleSchema)
async def modifier_portefeuille(
    portefeuille_id: int,
    portefeuille: PortefeuilleSchema,
    session: AsyncSession = Depends(get_db),
) -> PortefeuilleSchema:
    """Met à jour un portefeuille existant."""
    return await PortefeuilleService.modifier(session, portefeuille_id, portefeuille)


@router.delete("/{portefeuille_id}")
async def supprimer_portefeuille(
    portefeuille_id: int, session: AsyncSession = Depends(get_db)
) -> None:
    """Supprime un portefeuille existant."""
    await PortefeuilleService.supprimer(session, portefeuille_id)
    return None
