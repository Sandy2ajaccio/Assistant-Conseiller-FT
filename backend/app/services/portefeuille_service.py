from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.portefeuille import Portefeuille
from app.schemas.portefeuille_schema import PortefeuilleSchema


class PortefeuilleService:
    """Service métier pour la gestion des portefeuilles."""

    @staticmethod
    async def lister(session: AsyncSession) -> List[Portefeuille]:
        """Retourne tous les portefeuilles."""
        result = await session.execute(select(Portefeuille).order_by(Portefeuille.nom))
        return result.scalars().all()

    @staticmethod
    async def recuperer(session: AsyncSession, portefeuille_id: int) -> Portefeuille:
        """Retourne un portefeuille par identifiant."""
        result = await session.execute(
            select(Portefeuille).where(Portefeuille.id == portefeuille_id)
        )
        portefeuille = result.scalars().first()
        if portefeuille is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portefeuille introuvable.",
            )
        return portefeuille

    @staticmethod
    async def creer(session: AsyncSession, portefeuille: PortefeuilleSchema) -> Portefeuille:
        """Crée un nouveau portefeuille."""
        nouveau_portefeuille = Portefeuille(
            nom=portefeuille.nom,
            description=portefeuille.description,
            actif=portefeuille.actif,
        )
        session.add(nouveau_portefeuille)
        await session.commit()
        await session.refresh(nouveau_portefeuille)
        return nouveau_portefeuille

    @staticmethod
    async def modifier(
        session: AsyncSession,
        portefeuille_id: int,
        portefeuille: PortefeuilleSchema,
    ) -> Portefeuille:
        """Met à jour un portefeuille existant."""
        portefeuille_existant = await PortefeuilleService.recuperer(session, portefeuille_id)
        portefeuille_existant.nom = portefeuille.nom
        portefeuille_existant.description = portefeuille.description
        portefeuille_existant.actif = portefeuille.actif

        await session.commit()
        await session.refresh(portefeuille_existant)
        return portefeuille_existant

    @staticmethod
    async def supprimer(session: AsyncSession, portefeuille_id: int) -> None:
        """Supprime un portefeuille existant."""
        portefeuille_existant = await PortefeuilleService.recuperer(session, portefeuille_id)
        await session.delete(portefeuille_existant)
        await session.commit()
