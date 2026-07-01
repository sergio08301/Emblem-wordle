import unicodedata
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.character import Character
from app.schemas.character import CharacterSearchResult

router = APIRouter(prefix="/characters", tags=["characters"])


def _strip_accents(text: str) -> str:
    return ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )


@router.get("/", response_model=list[CharacterSearchResult])
def list_characters(search: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Character)
    if search:
        normalized = _strip_accents(search)
        query = query.filter(func.unaccent(Character.name).ilike(f"%{normalized}%"))
    return query.order_by(Character.name).all()
