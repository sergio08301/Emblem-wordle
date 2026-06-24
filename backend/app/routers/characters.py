from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.character import Character
from app.schemas.character import CharacterSearchResult

router = APIRouter(prefix="/characters", tags=["characters"])


@router.get("/", response_model=list[CharacterSearchResult])
def list_characters(search: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Character)
    if search:
        query = query.filter(Character.name.ilike(f"%{search}%"))
    return query.order_by(Character.name).all()
