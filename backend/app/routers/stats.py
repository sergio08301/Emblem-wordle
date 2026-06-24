from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.user_stats import UserStats
from app.routers.auth import get_current_user
from app.schemas.user import UserStatsResponse

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/me", response_model=UserStatsResponse)
def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    if stats is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stats not found")
    return stats
