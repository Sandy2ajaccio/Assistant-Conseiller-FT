from typing import Any

from app.schemas.dossier_demandeur import DossierDemandeurCreate


class AnalyseDossierService:
    """Service d'analyse des dossiers demandeurs France Travail.

    Cette classe représente l'architecture du moteur de règles métier.
    Pour l'instant, elle retourne des valeurs fictives et structurelles.
    """

    @staticmethod
    def analyser(dossier: DossierDemandeurCreate) -> dict[str, Any]:
        """Analyse un dossier demandeur et retourne un résultat structuré.

        Args:
            dossier: Données du dossier demandeur à analyser.

        Returns:
            Un dictionnaire contenant le score, le niveau de risque,
            les alertes, les recommandations et les actions prioritaires.
        """
        return {
            "score_global": 72,
            "niveau_risque": "modéré",
            "alertes": [
                "Pièces justificatives à vérifier",
                "Suivi de la situation RSA à actualiser",
            ],
            "recommandations": [
                "Contacter le demandeur pour mise à jour de l'identifiant FT",
                "Vérifier l'état du dossier RQTH",
            ],
            "actions_prioritaires": [
                "Planifier un rendez-vous avec le conseiller",
                "Envoyer un message de rappel au demandeur",
            ],
        }
