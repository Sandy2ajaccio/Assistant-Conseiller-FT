from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dossier_demandeur import DossierDemandeur
from app.schemas.dossier_demandeur import (
    DossierDemandeurCreate,
    DossierDemandeurUpdate,
)


class DossierDemandeurService:
    """Service métier pour le CRUD des dossiers demandeurs."""

    @staticmethod
    async def get_all(session: AsyncSession) -> List[DossierDemandeur]:
        result = await session.execute(select(DossierDemandeur).order_by(DossierDemandeur.nom))
        return result.scalars().all()

    @staticmethod
    async def get_by_id(
        session: AsyncSession, dossier_id: int
    ) -> Optional[DossierDemandeur]:
        result = await session.execute(
            select(DossierDemandeur).where(DossierDemandeur.id == dossier_id)
        )
        return result.scalars().first()

    @staticmethod
    async def create(
        session: AsyncSession, dossier_create: DossierDemandeurCreate
    ) -> DossierDemandeur:
        dossier = DossierDemandeur(**dossier_create.dict())
        session.add(dossier)
        await session.commit()
        await session.refresh(dossier)
        return dossier

    @staticmethod
    async def update(
        session: AsyncSession,
        dossier_id: int,
        dossier_update: DossierDemandeurUpdate,
    ) -> DossierDemandeur:
        dossier = await DossierDemandeurService.get_by_id(session, dossier_id)
        if dossier is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dossier demandeur introuvable.",
            )

        for champ, valeur in dossier_update.dict(exclude_unset=True).items():
            setattr(dossier, champ, valeur)

        await session.commit()
        await session.refresh(dossier)
        return dossier

    @staticmethod
    async def delete(session: AsyncSession, dossier_id: int) -> DossierDemandeur:
        dossier = await DossierDemandeurService.get_by_id(session, dossier_id)
        if dossier is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dossier demandeur introuvable.",
            )

        await session.delete(dossier)
        await session.commit()
        return dossier
