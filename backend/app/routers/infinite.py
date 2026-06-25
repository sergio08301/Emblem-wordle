import random
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, decode_access_token
from app.models.character import Character
from app.models.user import User
from app.schemas.game import (
    CharacterData, GuessResult, InfiniteGuessRequest,
    InfiniteGuessResponse, InfiniteStartResponse, TargetCharacter,
)
from app.services import army_service, auth_service
from app.services.game_service import compare_guess

router = APIRouter(prefix="/game/infinite", tags=["infinite"])

_oauth2_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def _get_user_optional(token: str | None = Depends(_oauth2_optional), db: Session = Depends(get_db)) -> User | None:
    if token is None:
        return None
    return auth_service.get_user_from_token(db, token)


@router.post("/start", response_model=InfiniteStartResponse)
def start_infinite(db: Session = Depends(get_db)):
    characters = db.query(Character).all()
    if not characters:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No characters available")
    character = random.choice(characters)
    token = create_access_token({"character_id": character.id, "type": "infinite"})
    return InfiniteStartResponse(session_token=token)


@router.post("/guess", response_model=InfiniteGuessResponse)
def infinite_guess(
    request: InfiniteGuessRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(_get_user_optional),
):
    payload = decode_access_token(request.session_token)
    if not payload or payload.get("type") != "infinite":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid session token")

    target = db.get(Character, payload["character_id"])
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target character not found")

    guessed = db.get(Character, request.character_id)
    if not guessed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")

    MAX_ATTEMPTS = 8
    result = compare_guess(guessed, target)
    won = guessed.id == target.id
    lost = not won and request.attempt_number >= MAX_ATTEMPTS

    infinite_token_available = (
        army_service.has_infinite_token(db, current_user.id) if (won and current_user) else False
    )

    return InfiniteGuessResponse(
        character_name=guessed.name,
        character_portrait_url=guessed.portrait_url,
        character_data=CharacterData.model_validate(guessed),
        result=GuessResult.model_validate(result.model_dump()),
        won=won,
        lost=lost,
        target_character=TargetCharacter.model_validate(target) if (won or lost) else None,
        infinite_token_available=infinite_token_available,
    )
