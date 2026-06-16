from sqlalchemy import String, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Character(Base):
    __tablename__ = "characters"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    portrait_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    game: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    weapon: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    starting_class: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    movement_type: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    hair_color: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
