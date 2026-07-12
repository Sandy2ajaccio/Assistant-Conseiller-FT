"""Package de modèles métier.

Ce package importe les définitions de modèles afin que SQLAlchemy
puisse enregistrer leur métadonnée lors du démarrage de l'application.
"""

from app.models import accompagnement, dossier_demandeur, portefeuille
