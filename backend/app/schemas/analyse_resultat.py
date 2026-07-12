from typing import List

from pydantic import BaseModel, Field


class AnalyseResultat(BaseModel):
    """Schéma de résultat pour une analyse de dossier demandeur."""

    score_global: int = Field(..., ge=0, le=100, title="Score global")
    niveau_risque: str = Field(..., title="Niveau de risque")
    alertes: List[str] = Field(..., title="Alertes détectées")
    recommandations: List[str] = Field(..., title="Recommandations métier")
    actions_prioritaires: List[str] = Field(..., title="Actions prioritaires")
