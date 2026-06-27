from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.feedback import Feedback
from app.models.user import User
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/feedback", tags=["feedback"])

_oauth2_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


class FeedbackRequest(BaseModel):
    subject: str
    message: str


@router.post("", status_code=status.HTTP_201_CREATED)
def submit_feedback(
    body: FeedbackRequest,
    db: Session = Depends(get_db),
    token: str | None = Depends(_oauth2_optional),
):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login required to send feedback")

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.get(User, payload.get("user_id"))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    if not body.subject.strip() or not body.message.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subject and message are required")

    db.add(Feedback(
        user_id=user.id,
        username=user.username,
        subject=body.subject.strip()[:200],
        message=body.message.strip(),
    ))
    db.commit()
    return {"ok": True}
