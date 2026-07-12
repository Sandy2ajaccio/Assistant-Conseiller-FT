from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.accompagnement import Accompagnement
from app.models.dossier_demandeur import DossierDemandeur
from app.schemas.accompagnement_schema import (
    AccompagnementCreate,
    AccompagnementRead,
    AccompagnementUpdate,
)


class AccompagnementService:
    """Service métier pour le CRUD des accompagnements."""

    @staticmethod
    async def lister(session: AsyncSession) -> List[Accompagnement]:
        """Retourne la liste des accompagnements."""
        result = await session.execute(select(Accompagnement).order_by(Accompagnement.date_debut))
        return result.scalars().all()

    @staticmethod
    async def recuperer(session: AsyncSession, accompagnement_id: int) -> Accompagnement:
        """Retourne un accompagnement par son identifiant."""
        result = await session.execute(
            select(Accompagnement).where(Accompagnement.id == accompagnement_id)
        )
        accompagnement = result.scalars().first()
        if accompagnement is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Accompagnement introuvable.",
            )
        return accompagnement

    @staticmethod
    async def lister_par_dossier(
        session: AsyncSession, dossier_demandeur_id: int
    ) -> List[Accompagnement]:
        """Retourne les accompagnements d'un dossier demandeur."""
        result = await session.execute(
            select(Accompagnement).where(Accompagnement.dossier_demandeur_id == dossier_demandeur_id)
        )
        return result.scalars().all()

    @staticmethod
    async def valider_existences_dossier(
        session: AsyncSession, dossier_demandeur_id: int
    ) -> None:
        """Vérifie qu'un dossier demandeur existe pour l'identifiant fourni."""
        result = await session.execute(
            select(DossierDemandeur).where(DossierDemandeur.id == dossier_demandeur_id)
        )
        if result.scalars().first() is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le dossier demandeur spécifié n'existe pas.",
            )

    @staticmethod
    async def creer(
        session: AsyncSession, accompagnement_create: AccompagnementCreate
    ) -> Accompagnement:
        """Crée un nouvel accompagnement."""
        await AccompagnementService.valider_existences_dossier(
            session, accompagnement_create.dossier_demandeur_id
        )

        accompagnement = Accompagnement(**accompagnement_create.dict())
        session.add(accompagnement)
        await session.commit()
        await session.refresh(accompagnement)
        return accompagnement

    @staticmethod
    async def modifier(
        session: AsyncSession,
        accompagnement_id: int,
        accompagnement_update: AccompagnementUpdate,
    ) -> Accompagnement:
        """Met à jour un accompagnement existant."""
        accompagnement = await AccompagnementService.recuperer(session, accompagnement_id)

        if accompagnement_update.dossier_demandeur_id is not None:
            await AccompagnementService.valider_existences_dossier(
                session, accompagnement_update.dossier_demandeur_id
            )

        for champ, valeur in accompagnement_update.dict(exclude_unset=True).items():
            setattr(accompagnement, champ, valeur)

        await session.commit()
        await session.refresh(accompagnement)
        return accompagnement

    @staticmethod
    async def supprimer(session: AsyncSession, accompagnement_id: int) -> None:
        """Supprime un accompagnement existant."""
        accompagnement = await AccompagnementService.recuperer(session, accompagnement_id)
        await session.delete(accompagnement)
        await session.commit()
