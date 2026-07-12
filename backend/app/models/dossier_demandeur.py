from sqlalchemy import Boolean, Column, Date, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from app.models.base import Base


class DossierDemandeur(Base):
    """Modèle métier représentant un dossier de demandeur France Travail."""

    __tablename__ = "dossiers_demandeurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(120), nullable=False, index=True)
    prenom = Column(String(120), nullable=False, index=True)
    date_naissance = Column(Date, nullable=False)
    identifiant_ft = Column(String(50), nullable=False, unique=True, index=True)
    organisme_referent = Column(String(180), nullable=True)
    rsa = Column(Boolean, nullable=False, default=False)
    rqth = Column(Boolean, nullable=False, default=False)
    categorie = Column(String(80), nullable=True)
    date_creation = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    date_modification = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    accompagnements = relationship(
        "Accompagnement",
        back_populates="dossier_demandeur",
        cascade="all, delete-orphan",
    )
