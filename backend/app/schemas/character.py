from pydantic import BaseModel


class CharacterSearchResult(BaseModel):
    id: int
    name: str
    portrait_url: str | None
    game: list[str]
    gender: list[str]
    weapon: list[str]
    starting_class: list[str]
    movement_type: list[str]
    hair_color: list[str]
    promotion_tier: str

    model_config = {"from_attributes": True}
