from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.rules.analyse_dossier import AnalyseDossierService
from app.schemas.analyse_resultat import AnalyseResultat
from app.schemas.dossier_demandeur import DossierDemandeurCreate

router = APIRouter(prefix="/api/v1/analyse", tags=["analyse"])


@router.post("/", response_model=AnalyseResultat)
async def analyser_dossier(
    dossier: DossierDemandeurCreate,
    session: AsyncSession = Depends(get_db),
) -> AnalyseResultat:
    """Analyse un dossier demandeur et retourne une structure de résultat.

    Pour l'instant, ce endpoint ne réalise aucun calcul métier réel.
    Il fournit uniquement une architecture propre pour le moteur expert.
    """
    resultat = AnalyseDossierService.analyser(dossier)
    return AnalyseResultat(**resultat)
