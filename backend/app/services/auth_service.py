from sqlalchemy.orm import Session
from app.models.user import User
from app.models.user_stats import UserStats
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def register_user(db: Session, user_data: UserCreate) -> User:
    if get_user_by_email(db, user_data.email):
        raise ValueError("Email already registered")
    if get_user_by_username(db, user_data.username):
        raise ValueError("Username already taken")

    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
    )
    db.add(user)
    db.flush()

    stats = UserStats(user_id=user.id)
    db.add(stats)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> str | None:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return create_access_token({"user_id": user.id})


def get_user_from_token(db: Session, token: str) -> User | None:
    payload = decode_access_token(token)
    if payload is None:
        return None
    user_id = payload.get("user_id")
    if user_id is None:
        return None
    return get_user_by_id(db, user_id)
