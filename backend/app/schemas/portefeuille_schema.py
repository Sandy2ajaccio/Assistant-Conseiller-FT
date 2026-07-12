from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PortefeuilleSchema(BaseModel):
    """Schéma de validation pour un portefeuille métier."""

    id: Optional[int] = Field(None, title="Identifiant du portefeuille")
    nom: str = Field(..., title="Nom du portefeuille")
    description: Optional[str] = Field(None, title="Description du portefeuille")
    actif: bool = Field(True, title="Portefeuille actif")
    date_creation: Optional[datetime] = Field(None, title="Date de création")
    date_modification: Optional[datetime] = Field(None, title="Date de modification")

    model_config = {
        "from_attributes": True,
        "extra": "forbid",
        "json_schema_extra": {
            "example": {
                "nom": "Portefeuille national",
                "description": "Regroupe les demandeurs suivis pour 2026.",
                "actif": True,
            }
        },
    }
