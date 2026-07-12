from enum import Enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum as SqlEnum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class StatutAccompagnement(str, Enum):
    """Enumération des statuts possibles pour un accompagnement."""

    actif = "actif"
    suspendu = "suspendu"
    termine = "terminé"
    reoriente = "réorienté"


class Accompagnement(Base):
    """Modèle métier représentant un accompagnement d'un demandeur."""

    __tablename__ = "accompagnements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dossier_demandeur_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("dossiers_demandeurs.id", ondelete="CASCADE"),
        nullable=False,
    )
    organisme_referent: Mapped[str] = mapped_column(String(180), nullable=False)
    type_accompagnement: Mapped[str] = mapped_column(String(120), nullable=False)
    date_debut: Mapped[date] = mapped_column(Date, nullable=False)
    date_fin_prevue: Mapped[date | None] = mapped_column(Date, nullable=True)
    statut: Mapped[StatutAccompagnement] = mapped_column(
        SqlEnum(
            StatutAccompagnement,
            native_enum=False,
            values_callable=lambda x: [e.value for e in x],
            name="statut_accompagnement",
        ),
        nullable=False,
    )
    conseiller_referent: Mapped[str | None] = mapped_column(String(180), nullable=True)
    commentaire: Mapped[str | None] = mapped_column(String(500), nullable=True)
    date_creation: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    date_modification: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    dossier_demandeur = relationship(
        "DossierDemandeur",
        back_populates="accompagnements",
        foreign_keys=[dossier_demandeur_id],
    )
