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
    promotion_tier: CategoryResult = CategoryResult(status="incorrect")


class GuessRequest(BaseModel):
    character_id: int


class CharacterData(BaseModel):
    game: list[str]
    gender: list[str]
    weapon: list[str]
    starting_class: list[str]
    movement_type: list[str]
    hair_color: list[str]
    promotion_tier: str

    model_config = {"from_attributes": True}


class TargetCharacter(BaseModel):
    name: str
    portrait_url: str | None
    game: list[str]
    weapon: list[str]
    starting_class: list[str]
    movement_type: list[str]
    promotion_tier: str

    model_config = {"from_attributes": True}


class GuessResponse(BaseModel):
    attempt_number: int
    character_name: str
    character_portrait_url: str | None
    character_data: CharacterData
    result: GuessResult
    session_completed: bool
    session_won: bool
    target_character: TargetCharacter | None = None


class SessionResponse(BaseModel):
    session_id: int
    completed: bool
    won: bool
    attempts_count: int
    guesses: list[GuessResponse]
    target_character: TargetCharacter | None = None


class InfiniteStartResponse(BaseModel):
    session_token: str


class InfiniteGuessRequest(BaseModel):
    session_token: str
    character_id: int
    attempt_number: int


class InfiniteGuessResponse(BaseModel):
    character_name: str
    character_portrait_url: str | None
    character_data: CharacterData
    result: GuessResult
    won: bool
    lost: bool = False
    target_character: TargetCharacter | None = None
