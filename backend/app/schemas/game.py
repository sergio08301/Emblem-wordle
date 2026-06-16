from typing import Literal
from pydantic import BaseModel





#qué manda el frontend cuando hace un intento y qué le devolvemos.
#Necesitamos representar cosas como "el campo weapon coincide parcialmente" o "el campo game no coincide y el personaje real es de un juego posterior"

class CategoryResult(BaseModel):
    status: Literal["correct", "partial", "incorrect"]
    direction: Literal["higher", "lower"] | None = None


class GuessResult(BaseModel):
    game: CategoryResult
    gender: CategoryResult
    weapon: CategoryResult
    starting_class: CategoryResult
    movement_type: CategoryResult
    hair_color: CategoryResult


class GuessRequest(BaseModel):
    character_id: int


class GuessResponse(BaseModel):
    attempt_number: int
    character_name: str
    character_portrait_url: str | None
    result: GuessResult
    session_completed: bool
    session_won: bool


class SessionResponse(BaseModel):
    session_id: int
    completed: bool
    won: bool
    attempts_count: int
    guesses: list[GuessResponse]
