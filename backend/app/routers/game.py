from fastapi import APIRouter, Depends, HTTPException, Header, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.character import Character
from app.models.game_session import GameSession
from app.models.guess import Guess as GuessModel
from app.models.user import User
from app.models.user_stats import UserStats
from app.schemas.game import CharacterData, GuessRequest, GuessResponse, GuessResult, SessionResponse, TargetCharacter
from app.schemas.user import UserStatsResponse
from app.services import auth_service, daily_service, game_service

router = APIRouter(prefix="/game", tags=["game"])

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def get_current_user_optional(
    token: str | None = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db),
) -> User | None:
    if token is None:
        return None
    return auth_service.get_user_from_token(db, token)


def _build_guess_response(guess: GuessModel, session: GameSession, target: Character | None = None) -> GuessResponse:
    return GuessResponse(
        attempt_number=guess.attempt_number,
        character_name=guess.character.name,
        character_portrait_url=guess.character.portrait_url,
        character_data=CharacterData.model_validate(guess.character),
        result=GuessResult.model_validate(guess.result),
        session_completed=session.completed,
        session_won=session.won,
        target_character=TargetCharacter.model_validate(target) if target else None,
    )


@router.get("/today", response_model=SessionResponse)
def get_today(
    anonymous_id: str | None = Header(None, alias="X-Anonymous-ID"),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    challenge = daily_service.get_todays_challenge(db)
    user_id = current_user.id if current_user else None
    session = game_service.get_or_create_session(db, challenge.id, user_id, anonymous_id)

    guesses = (
        db.query(GuessModel)
        .filter(GuessModel.session_id == session.id)
        .order_by(GuessModel.attempt_number)
        .all()
    )

    target = challenge.character if session.completed else None
    return SessionResponse(
        session_id=session.id,
        completed=session.completed,
        won=session.won,
        attempts_count=session.attempts_count,
        guesses=[_build_guess_response(g, session) for g in guesses],
        target_character=TargetCharacter.model_validate(target) if target else None,
    )


@router.post("/guess", response_model=GuessResponse)
def submit_guess(
    guess_request: GuessRequest,
    anonymous_id: str | None = Header(None, alias="X-Anonymous-ID"),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    challenge = daily_service.get_todays_challenge(db)
    user_id = current_user.id if current_user else None
    session = game_service.get_or_create_session(db, challenge.id, user_id, anonymous_id)

    guessed_character = db.get(Character, guess_request.character_id)
    if guessed_character is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")

    try:
        guess = game_service.submit_guess(db, session, guessed_character, challenge.character)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    target = challenge.character if session.completed else None
    return _build_guess_response(guess, session, target)


@router.get("/stats", response_model=UserStatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    if current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required")

    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    if stats is None:
        return UserStatsResponse(games_played=0, games_won=0, current_streak=0, max_streak=0, avg_attempts=0.0)
    return stats
