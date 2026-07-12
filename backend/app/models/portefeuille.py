from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.models.base import Base


class Portefeuille(Base):
    """Modèle métier représentant un portefeuille de demandeurs."""

    __tablename__ = "portefeuilles"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(180), nullable=False, index=True)
    description = Column(String(400), nullable=True)
    actif = Column(Boolean, default=True, nullable=False)
    date_creation = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    date_modification = Column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
