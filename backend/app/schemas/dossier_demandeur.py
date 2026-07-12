from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class DossierDemandeurBase(BaseModel):
    nom: str = Field(..., title="Nom du demandeur")
    prenom: str = Field(..., title="Prénom du demandeur")
    date_naissance: date = Field(..., title="Date de naissance")
    identifiant_ft: str = Field(..., title="Identifiant France Travail")
    organisme_referent: Optional[str] = Field(None, title="Organisme référent")
    rsa: bool = Field(False, title="RSA")
    rqth: bool = Field(False, title="RQTH")
    categorie: Optional[str] = Field(None, title="Catégorie")


class DossierDemandeurCreate(DossierDemandeurBase):
    """Schéma utilisé pour la création d'un dossier demandeur."""
    pass


class DossierDemandeurUpdate(BaseModel):
    """Schéma utilisé pour la mise à jour partielle d'un dossier demandeur."""

    nom: Optional[str] = None
    prenom: Optional[str] = None
    date_naissance: Optional[date] = None
    identifiant_ft: Optional[str] = None
    organisme_referent: Optional[str] = None
    rsa: Optional[bool] = None
    rqth: Optional[bool] = None
    categorie: Optional[str] = None


class DossierDemandeurRead(DossierDemandeurBase):
    id: int
    date_creation: datetime
    date_modification: datetime

    class Config:
        orm_mode = True
