from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class UserCharacterResponse(BaseModel):
    character_id: int
    character_name: str
    character_portrait_url: str | None
    level: int
    xp: int
    slot: str
    acquired_at: datetime


class BarracksResponse(BaseModel):
    deployment: list[UserCharacterResponse]
    bench: list[UserCharacterResponse]


class SetSlotRequest(BaseModel):
    slot: Literal["deployment", "bench"]


class RecruitInfiniteRequest(BaseModel):
    character_id: int


class RecruitResultResponse(BaseModel):
    character_id: int
    character_name: str
    is_new: bool
