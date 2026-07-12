from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class AccompagnementBase(BaseModel):
    dossier_demandeur_id: int = Field(..., title="Identifiant du dossier demandeur")
    organisme_referent: str = Field(..., title="Organisme référent")
    type_accompagnement: str = Field(..., title="Type d'accompagnement")
    date_debut: date = Field(..., title="Date de début")
    date_fin_prevue: Optional[date] = Field(None, title="Date de fin prévue")
    statut: str = Field(..., title="Statut de l'accompagnement")
    conseiller_referent: Optional[str] = Field(None, title="Conseiller référent")
    commentaire: Optional[str] = Field(None, title="Commentaire")

    @model_validator(mode="after")
    def verifier_dates(self):
        if (
            self.date_debut is not None
            and self.date_fin_prevue is not None
            and self.date_fin_prevue < self.date_debut
        ):
            raise ValueError(
                "La date de fin prévue ne peut pas être antérieure à la date de début."
            )
        return self


class AccompagnementCreate(AccompagnementBase):
    """Schéma de création d'un accompagnement."""
    pass


class AccompagnementUpdate(BaseModel):
    """Schéma de mise à jour d'un accompagnement."""

    dossier_demandeur_id: Optional[int] = Field(None, title="Identifiant du dossier demandeur")
    organisme_referent: Optional[str] = Field(None, title="Organisme référent")
    type_accompagnement: Optional[str] = Field(None, title="Type d'accompagnement")
    date_debut: Optional[date] = Field(None, title="Date de début")
    date_fin_prevue: Optional[date] = Field(None, title="Date de fin prévue")
    statut: Optional[str] = Field(None, title="Statut de l'accompagnement")
    conseiller_referent: Optional[str] = Field(None, title="Conseiller référent")
    commentaire: Optional[str] = Field(None, title="Commentaire")

    @model_validator(mode="after")
    def verifier_dates(self):
        if (
            self.date_debut is not None
            and self.date_fin_prevue is not None
            and self.date_fin_prevue < self.date_debut
        ):
            raise ValueError(
                "La date de fin prévue ne peut pas être antérieure à la date de début."
            )
        return self


class AccompagnementRead(AccompagnementBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
