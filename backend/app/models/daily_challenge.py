from datetime import date
from sqlalchemy import Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class DailyChallenge(Base):
    __tablename__ = "daily_challenges"

    id: Mapped[int] = mapped_column(primary_key=True)
    character_id: Mapped[int] = mapped_column(ForeignKey("characters.id"), nullable=False)
    challenge_date: Mapped[date] = mapped_column(Date, unique=True, nullable=False)

    character: Mapped["Character"] = relationship("Character")
