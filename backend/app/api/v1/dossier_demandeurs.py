from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.dossier_demandeur import (
    DossierDemandeurCreate,
    DossierDemandeurRead,
    DossierDemandeurUpdate,
)
from app.services.dossier_demandeur_service import DossierDemandeurService

router = APIRouter(prefix="/api/v1/dossiers_demandeurs", tags=["dossiers_demandeurs"])


@router.get("/", response_model=List[DossierDemandeurRead])
async def lister_dossiers(session: AsyncSession = Depends(get_db)):
    """Retourne la liste des dossiers demandeurs."""
    return await DossierDemandeurService.get_all(session)


@router.get("/{dossier_id}", response_model=DossierDemandeurRead)
async def lire_dossier(dossier_id: int, session: AsyncSession = Depends(get_db)):
    """Retourne un dossier demandeur par son identifiant."""
    dossier = await DossierDemandeurService.get_by_id(session, dossier_id)
    if dossier is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dossier demandeur introuvable.",
        )
    return dossier


@router.post("/", response_model=DossierDemandeurRead, status_code=status.HTTP_201_CREATED)
async def creer_dossier(
    data: DossierDemandeurCreate, session: AsyncSession = Depends(get_db)
):
    """Crée un nouveau dossier demandeur."""
    return await DossierDemandeurService.create(session, data)


@router.put("/{dossier_id}", response_model=DossierDemandeurRead)
async def modifier_dossier(
    dossier_id: int,
    data: DossierDemandeurUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Met à jour un dossier demandeur existant."""
    return await DossierDemandeurService.update(session, dossier_id, data)


@router.delete("/{dossier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def supprimer_dossier(dossier_id: int, session: AsyncSession = Depends(get_db)):
    """Supprime un dossier demandeur."""
    await DossierDemandeurService.delete(session, dossier_id)
    return None
