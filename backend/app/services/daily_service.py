import random
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.character import Character
from app.models.daily_challenge import DailyChallenge
from app.services.game_service import GAME_ORDER

# Adjust these weights to control how often each game appears as the daily challenge.
# Higher weight = more frequent, regardless of how many characters that game has.
# Values do not need to sum to 100 — only their relative proportion matters.
GAME_WEIGHTS: dict[str, int] = {
    "Shadow Dragon": 6,
    "Echoes: Shadows of Valentia": 9,
    "New Mystery of the Emblem": 4,
    "Genealogy of the Holy War": 7,
    "Thracia 776": 6,
    "The Binding Blade": 7,
    "The Blazing Blade": 8,
    "The Sacred Stones": 7,
    "Path of Radiance": 8,
    "Radiant Dawn": 8,
    "Awakening": 8,
    "Fates": 8,
    "Three Houses": 8,
    "Engage": 8,
}


def _debut_game(character: Character) -> str | None:
    indices = [(GAME_ORDER.index(g), g) for g in character.game if g in GAME_ORDER]
    return min(indices, default=(None, None))[1]


def get_todays_challenge(db: Session) -> DailyChallenge:
    today = date.today()
    challenge = db.query(DailyChallenge).filter(
        DailyChallenge.challenge_date == today
    ).first()

    if challenge is None:
        challenge = _create_daily_challenge(db, today)

    return challenge


def _create_daily_challenge(db: Session, challenge_date: date) -> DailyChallenge:
    cutoff = challenge_date - timedelta(days=30)
    recent_ids = (
        db.query(DailyChallenge.character_id)
        .filter(DailyChallenge.challenge_date >= cutoff)
        .subquery()
    )

    eligible = (
        db.query(Character)
        .filter(Character.is_active == True)
        .filter(Character.id.not_in(recent_ids))
        .all()
    )

    if not eligible:
        eligible = db.query(Character).filter(Character.is_active == True).all()

    by_game: dict[str, list[Character]] = {}
    for character in eligible:
        debut = _debut_game(character)
        if debut:
            by_game.setdefault(debut, []).append(character)

    if not by_game:
        character = random.choice(eligible)
    else:
        available_games = [g for g in by_game if g in GAME_WEIGHTS]
        if not available_games:
            available_games = list(by_game.keys())
        weights = [GAME_WEIGHTS[g] for g in available_games]
        chosen_game = random.choices(available_games, weights=weights, k=1)[0]
        character = random.choice(by_game[chosen_game])

    challenge = DailyChallenge(character_id=character.id, challenge_date=challenge_date)
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return challenge
