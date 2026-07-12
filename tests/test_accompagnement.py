from datetime import date

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.accompagnement import StatutAccompagnement
from app.schemas.accompagnement_schema import AccompagnementCreate, AccompagnementUpdate
from app.schemas.dossier_demandeur import DossierDemandeurCreate
from app.services.accompagnement_service import AccompagnementService
from app.services.dossier_demandeur_service import DossierDemandeurService


@pytest.mark.asyncio
async def test_creation_accompagnement_valide(async_session: AsyncSession):
    dossier = await DossierDemandeurService.create(
        async_session,
        DossierDemandeurCreate(
            nom="Test",
            prenom="Utilisateur",
            date_naissance=date(1990, 1, 1),
            identifiant_ft="FT123",
            organisme_referent="Pôle emploi",
            rsa=False,
            rqth=False,
            categorie="A",
        ),
    )

    accompagnement = await AccompagnementService.creer(
        async_session,
        AccompagnementCreate(
            dossier_demandeur_id=dossier.id,
            organisme_referent="Pôle emploi",
            type_accompagnement="Orientation",
            date_debut=date(2026, 1, 1),
            date_fin_prevue=date(2026, 6, 1),
            statut=StatutAccompagnement.actif.value,
        ),
    )

    assert accompagnement.id is not None
    assert accompagnement.dossier_demandeur_id == dossier.id
    assert accompagnement.statut == StatutAccompagnement.actif


@pytest.mark.asyncio
async def test_creation_accompagnement_dossier_inexistant(async_session: AsyncSession):
    with pytest.raises(HTTPException) as exception:
        await AccompagnementService.creer(
            async_session,
            AccompagnementCreate(
                dossier_demandeur_id=9999,
                organisme_referent="Pôle emploi",
                type_accompagnement="Orientation",
                date_debut=date(2026, 1, 1),
                statut=StatutAccompagnement.actif.value,
            ),
        )

    assert exception.value.status_code == 400
    assert "n'existe pas" in exception.value.detail


@pytest.mark.asyncio
async def test_creation_accompagnement_dates_incoherentes(async_session: AsyncSession):
    dossier = await DossierDemandeurService.create(
        async_session,
        DossierDemandeurCreate(
            nom="Test",
            prenom="Utilisateur",
            date_naissance=date(1990, 1, 1),
            identifiant_ft="FT124",
            organisme_referent="Pôle emploi",
            rsa=False,
            rqth=False,
            categorie="A",
        ),
    )

    with pytest.raises(ValidationError):
        AccompagnementCreate(
            dossier_demandeur_id=dossier.id,
            organisme_referent="Pôle emploi",
            type_accompagnement="Orientation",
            date_debut=date(2026, 6, 1),
            date_fin_prevue=date(2026, 1, 1),
            statut=StatutAccompagnement.actif.value,
        )


@pytest.mark.asyncio
async def test_mise_a_jour_accompagnement(async_session: AsyncSession):
    dossier = await DossierDemandeurService.create(
        async_session,
        DossierDemandeurCreate(
            nom="Test",
            prenom="Utilisateur",
            date_naissance=date(1990, 1, 1),
            identifiant_ft="FT125",
            organisme_referent="Pôle emploi",
            rsa=False,
            rqth=False,
            categorie="A",
        ),
    )

    accompagnement = await AccompagnementService.creer(
        async_session,
        AccompagnementCreate(
            dossier_demandeur_id=dossier.id,
            organisme_referent="Pôle emploi",
            type_accompagnement="Orientation",
            date_debut=date(2026, 1, 1),
            statut=StatutAccompagnement.actif.value,
        ),
    )

    updated = await AccompagnementService.modifier(
        async_session,
        accompagnement.id,
        AccompagnementUpdate(type_accompagnement="Formation", statut=StatutAccompagnement.suspendu.value),
    )

    assert updated.type_accompagnement == "Formation"
    assert updated.statut == StatutAccompagnement.suspendu


@pytest.mark.asyncio
async def test_suppression_accompagnement(async_session: AsyncSession):
    dossier = await DossierDemandeurService.create(
        async_session,
        DossierDemandeurCreate(
            nom="Test",
            prenom="Utilisateur",
            date_naissance=date(1990, 1, 1),
            identifiant_ft="FT126",
            organisme_referent="Pôle emploi",
            rsa=False,
            rqth=False,
            categorie="A",
        ),
    )

    accompagnement = await AccompagnementService.creer(
        async_session,
        AccompagnementCreate(
            dossier_demandeur_id=dossier.id,
            organisme_referent="Pôle emploi",
            type_accompagnement="Orientation",
            date_debut=date(2026, 1, 1),
            statut=StatutAccompagnement.actif.value,
        ),
    )

    await AccompagnementService.supprimer(async_session, accompagnement.id)

    with pytest.raises(HTTPException):
        await AccompagnementService.recuperer(async_session, accompagnement.id)
