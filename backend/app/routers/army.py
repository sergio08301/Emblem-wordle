from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.army import BarracksResponse, RecruitInfiniteRequest, RecruitResultResponse, SetSlotRequest, UserCharacterResponse
from app.services import army_service

router = APIRouter(prefix="/army", tags=["army"])


def _to_response(uc) -> UserCharacterResponse:
    return UserCharacterResponse(
        character_id=uc.character_id,
        character_name=uc.character.name,
        character_portrait_url=uc.character.portrait_url,
        level=uc.level,
        xp=uc.xp,
        slot=uc.slot,
        acquired_at=uc.acquired_at,
    )


@router.get("/me/barracks", response_model=BarracksResponse)
def get_barracks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_chars = army_service.get_barracks(db, current_user.id)
    deployment = [_to_response(uc) for uc in user_chars if uc.slot == "deployment"]
    bench = [_to_response(uc) for uc in user_chars if uc.slot == "bench"]
    return BarracksResponse(deployment=deployment, bench=bench)


@router.post("/me/recruit/daily", response_model=RecruitResultResponse)
def recruit_daily(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        character_name, character_id, is_new = army_service.recruit_daily(db, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    db.commit()
    return RecruitResultResponse(character_id=character_id, character_name=character_name, is_new=is_new)


@router.post("/me/recruit/infinite", response_model=RecruitResultResponse)
def recruit_infinite(
    body: RecruitInfiniteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        character_name, character_id, is_new = army_service.use_infinite_token(db, current_user.id, body.character_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    db.commit()
    return RecruitResultResponse(character_id=character_id, character_name=character_name, is_new=is_new)


@router.put("/me/characters/{character_id}/slot", response_model=UserCharacterResponse)
def set_slot(
    character_id: int,
    body: SetSlotRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    uc = army_service.set_slot(db, current_user.id, character_id, body.slot)
    if uc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not in your army")
    return _to_response(uc)
