from datetime import date
from sqlalchemy.orm import Session, joinedload
from app.models.user_character import UserCharacter
from app.models.game_session import GameSession
from app.models.daily_deploy_token import DailyDeployToken

XP_PER_WIN = 100
XP_PER_LEVEL = 100
MAX_LEVEL = 20


def recruit_character(db: Session, user_id: int, character_id: int) -> tuple[UserCharacter, bool]:
    """Add character to user's army (bench). Returns (user_character, is_new)."""
    existing = db.get(UserCharacter, (user_id, character_id))
    if existing:
        return existing, False
    uc = UserCharacter(user_id=user_id, character_id=character_id, level=1, xp=0, slot="bench")
    db.add(uc)
    db.flush()
    return uc, True


def award_xp(db: Session, user_id: int) -> list[dict]:
    """Distribute XP_PER_WIN equally among deployed characters.
    Returns list of {character_name, xp_gained, leveled_up, new_level} for each unit that received XP."""
    deployed = (
        db.query(UserCharacter)
        .options(joinedload(UserCharacter.character))
        .filter(UserCharacter.user_id == user_id, UserCharacter.slot == "deployment")
        .all()
    )
    if not deployed:
        return []

    xp_each = XP_PER_WIN // len(deployed)
    if xp_each == 0:
        return []

    report = []
    for uc in deployed:
        if uc.level >= MAX_LEVEL:
            continue
        uc.xp += xp_each
        leveled_up = False
        while uc.xp >= XP_PER_LEVEL and uc.level < MAX_LEVEL:
            uc.xp -= XP_PER_LEVEL
            uc.level += 1
            leveled_up = True
        report.append({
            "character_name": uc.character.name,
            "xp_gained": xp_each,
            "leveled_up": leveled_up,
            "new_level": uc.level,
        })

    db.flush()
    return report


def get_barracks(db: Session, user_id: int) -> list[UserCharacter]:
    return (
        db.query(UserCharacter)
        .options(joinedload(UserCharacter.character))
        .filter(UserCharacter.user_id == user_id)
        .all()
    )


def has_infinite_token(db: Session, user_id: int) -> bool:
    return db.get(DailyDeployToken, (user_id, date.today())) is None


def use_infinite_token(db: Session, user_id: int, character_id: int) -> tuple[str, int, bool]:
    """Use the daily infinite recruit token. Returns (character_name, character_id, is_new)."""
    if not has_infinite_token(db, user_id):
        raise ValueError("No recruit available today")
    from app.models.character import Character
    char = db.get(Character, character_id)
    if char is None:
        raise ValueError("Character not found")
    db.add(DailyDeployToken(user_id=user_id, date=date.today(), character_id=character_id))
    uc, is_new = recruit_character(db, user_id, character_id)
    db.flush()
    return char.name, character_id, is_new


def recruit_daily(db: Session, user_id: int) -> tuple[str, int, bool]:
    """Recruit today's daily character. Returns (character_name, character_id, is_new).
    Raises ValueError if user hasn't won today."""
    from app.services.daily_service import get_todays_challenge

    challenge = get_todays_challenge(db)
    session = db.query(GameSession).filter(
        GameSession.daily_challenge_id == challenge.id,
        GameSession.user_id == user_id,
        GameSession.completed == True,
        GameSession.won == True,
    ).first()

    if session is None:
        raise ValueError("You haven't won today's challenge")

    uc, is_new = recruit_character(db, user_id, challenge.character_id)
    return challenge.character.name, challenge.character_id, is_new


MAX_DEPLOYMENT = 10


def set_slot(db: Session, user_id: int, character_id: int, slot: str) -> UserCharacter | None:
    uc = db.get(UserCharacter, (user_id, character_id))
    if uc is None:
        return None
    if slot == "deployment" and uc.slot != "deployment":
        deployed_count = db.query(UserCharacter).filter(
            UserCharacter.user_id == user_id,
            UserCharacter.slot == "deployment",
        ).count()
        if deployed_count >= MAX_DEPLOYMENT:
            raise ValueError(f"Deployment is full ({MAX_DEPLOYMENT} units maximum)")
    uc.slot = slot
    db.commit()
    return (
        db.query(UserCharacter)
        .options(joinedload(UserCharacter.character))
        .filter(UserCharacter.user_id == user_id, UserCharacter.character_id == character_id)
        .first()
    )
