from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.character import Character
from app.models.game_session import GameSession
from app.models.guess import Guess
from app.models.user_stats import UserStats
from app.schemas.game import CategoryResult, GuessResult

MAX_ATTEMPTS = 8

# Chronological release order, remakes take the space for the original iteration
GAME_ORDER = [
    "Shadow Dragon",
    "Echoes: Shadows of Valentia",
    "New Mystery of the Emblem",
    "Genealogy of the Holy War",
    "Thracia 776",
    "The Binding Blade",
    "The Blazing Blade",
    "The Sacred Stones",
    "Path of Radiance",
    "Radiant Dawn",
    "Awakening",
    "Fates",
    "Three Houses",
    "Engage",
]


# Individual class equivalences (green): two class names mean the same thing.
# Non-transitivity is intentional: Sword Fighter = Mercenary and
# Sword Fighter = Myrmidon, but Mercenary ≠ Myrmidon.
CLASS_EQUIV_GROUPS: list[frozenset[str]] = [
    # Naming inconsistencies across games (same class, different name)
    frozenset({"Free Knight", "Sword Cavalier", "Sword Knight"}),
    frozenset({"Lance Knight", "Lance Cavalier"}),
    frozenset({"Arch Knight", "Nomad", "Bow Knight"}),
    frozenset({"Nomadic Trooper", "Horseman"}),
    frozenset({"Sword Armor", "Armor Sword"}),
    frozenset({"General", "Fortress Knight"}),
    frozenset({"Dark Mage", "Shaman"}),
    frozenset({"Mage Knight", "Dark Knight"}),
    frozenset({"Songstress", "Dancer", "Bard(Dancer)", "Heron"}),
    frozenset({"Maid", "Butler"}),
    # Mounted flier classes
    frozenset({"Pegasus Knight", "Pegasus Rider", "Sky Knight", "Lance Flier"}),
    frozenset({"Falcon Knight", "Falcoknight", "Falconknight"}),
    frozenset({"Wyvern Rider", "Dragon Rider"}),
    frozenset({"Dracoknight", "Wyvern Lord"}),
    # Bow classes
    frozenset({"Bow Fighter", "Archer"}),
    # Thief/rogue classes — non-transitive: Rogue ≠ Assassin
    frozenset({"Thief Fighter", "Rogue"}),
    frozenset({"Thief Fighter", "Assassin"}),
    # Lance infantry classes
    frozenset({"Lance Fighter", "Soldier", "Spear Fighter"}),
    # Non-transitive sword classes — Mercenary ≠ Myrmidon despite both = Sword Fighter
    frozenset({"Sword Fighter", "Mercenary"}),
    frozenset({"Sword Fighter", "Myrmidon", "Samurai"}),
    # Protagonist-specific class aliases
    frozenset({"Fighter(Alm)", "Fighter", "Axe Fighter"}),
    frozenset({"Priestess(Celica)", "Priestess"}),
    # Healer classes (all exactly equivalent)
    frozenset({"Curate", "Cleric", "Priest", "Shrine Maiden", "Monk(Fates)", "Martial Monk"}),
    frozenset({"High Priest", "Bishop"}),
]

# Set-level equivalences (green): an entire set of classes means the same
# as another set. Having all three anima types together = Anima Magic = Tome.
_ANIMA = frozenset({"Fire Magic", "Wind Magic", "Thunder Magic"})
CLASS_SET_ALIASES: list[tuple[frozenset[str], frozenset[str]]] = [
    (_ANIMA,                      frozenset({"Anima Magic"})),
    (_ANIMA,                      frozenset({"Tome"})),
    (frozenset({"Anima Magic"}),  frozenset({"Tome"})),
    (frozenset({"Black Magic"}),  frozenset({"Tome"})),
    # Add more set-level equivalences as needed
]

# Classes in the same family produce a partial match when no equivalence applies.
CLASS_FAMILIES: dict[str, str] = {
    # Cavalier family
    "Cavalier":        "Cavalier",
    "Sword Cavalier":  "Cavalier",
    "Lance Cavalier":  "Cavalier",
    "Axe Cavalier":    "Cavalier",
    "Free Knight":     "Cavalier",
    # Tome/magic family (starting class names that are magic types)
    "Fire Magic":      "Tome",
    "Wind Magic":      "Tome",
    "Thunder Magic":   "Tome",
    "Anima Magic":     "Tome",
    "Black Magic":     "Tome",
    "Dark Magic":      "Tome",
    "Tome":            "Tome",
    # Lord/protagonist family
    "Lord":                 "Lord",
    "Knight Lord":          "Lord",
    "Junior Lord":          "Lord",
    "Ranger":               "Lord",
    "Prince":               "Lord",
    "Light Mage":           "Lord",
    "Nohr Prince/Princess": "Lord",
    "Armored Lord":         "Lord",
    "High Lord":            "Lord",
    "Wyvern Master":        "Lord",
    "Dragon Child":         "Lord",
    "Fighter(Alm)":         "Lord",
    "Priestess(Celica)":    "Lord",
    # Tactician/avatar family
    "Tactician":       "Tactician",
    "Enlightened One": "Tactician",
    "Noble(Céline)":   "Tactician",
    # Mage family (all partially equivalent to each other)
    "Bard (Mage)":  "Mage",
    "Mage":         "Mage",
    "Thunder Mage": "Mage",
    "Wind Mage":    "Mage",
    # Sage family
    "Archsage":   "Sage",
    "Sage":       "Sage",
    "Chancellor": "Sage",
    "Empress":    "Sage",
    # Dark sage/sorcerer family
    "Dark Sage":  "Dark Sage",
    "Druid":      "Dark Sage",
    "Sorcerer":   "Dark Sage",
    # Cavalier family additions (= equivalents inherit the family)
    "Lance Knight":  "Cavalier",
    "Sword Knight":  "Cavalier",
    "Noble(Alfred)": "Cavalier",
    # Bow knight family
    "Arch Knight":      "Bow Knight",
    "Nomad":            "Bow Knight",
    "Bow Knight":       "Bow Knight",
    "Sentinel(Fogado)": "Bow Knight",
    # Paladin family (mounted heavy units)
    "Gold Knight":  "Paladin",
    "Paladin":      "Paladin",
    "Duke Knight":  "Paladin",
    "Death Knight": "Paladin",
    # Knight/armor infantry family
    "Knight":      "Knight",
    "Sword Armor": "Knight",
    "Armor Sword": "Knight",
    "Axe Armor":   "Knight",
    "Lance Armor": "Knight",
    # General/promoted armor family
    "General":         "General",
    "Fortress Knight": "General",
    "Black Knight":    "General",
    # Falcon Knight family (Kinshi Knight is partial with the falcon group)
    "Falcon Knight":  "Falcon Knight",
    "Falcoknight":    "Falcon Knight",
    "Falconknight":   "Falcon Knight",
    "Kinshi Knight":  "Falcon Knight",
    # Promoted wyvern family (Dracoknight = Wyvern Lord, Malig Knight ≈ both)
    "Dracoknight":  "Dracoknight",
    "Wyvern Lord":  "Dracoknight",
    "Malig Knight": "Dracoknight",
    # Bird laguz family (Tellius)
    "Hawk":  "Bird",
    "Raven": "Bird",
    "Heron": "Bird",
    # Beast laguz family (Tellius)
    "Cat":        "Beast",
    "Tiger":      "Beast",
    "Wolf":       "Beast",
    "Wolf Queen": "Beast",
    "Lion":       "Beast",
    "Lion King":  "Beast",
    # Modern beaststone/dagger shifter family
    "Kitsune":  "Kitsune",
    "Taguel":   "Kitsune",
    "Wolfskin": "Kitsune",
    # Archer family (Hunter and Apothecary partial with the bow group)
    "Bow Fighter": "Archer",
    "Archer":      "Archer",
    "Hunter":      "Archer",
    "Apothecary":  "Archer",
    # Sword fighter family (Lord(Diamant) partial with sword classes)
    "Sword Fighter": "Sword Fighter",
    "Myrmidon":      "Sword Fighter",
    "Samurai":       "Sword Fighter",
    "Lord(Diamant)": "Sword Fighter",
    # Thief family
    "Thief":  "Thief",
    "Outlaw": "Thief",
    "Ninja":  "Thief",
    # Axe brawler family
    "Fighter":    "Fighter",
    "Axe Fighter": "Fighter",
    "Brigand":    "Fighter",
    "Pirate":     "Fighter",
    "Oni Savage": "Fighter",
    # Lance infantry family
    "Lance Fighter":     "Soldier",
    "Soldier":           "Soldier",
    "Spear Fighter":     "Soldier",
    "Sentinel(Timerra)": "Soldier",
    # Trainee family (Sacred Stones unpromoted)
    "Journeyman": "Trainee",
    "Recruit":    "Trainee",
    "Pupil":      "Trainee",
    # Dragon family (laguz dragons + classic dragon units)
    "Dragon Prince": "Dragon",
    "White Dragon":  "Dragon",
    "Red Dragon":    "Dragon",
    "Manakete":      "Dragon",
}


# Non-transitive partial matches for classes. A≈B and A≈C does not imply B≈C.
# Use this when a class bridges two families without connecting them to each other.
CLASS_PARTIAL_GROUPS: list[frozenset[str]] = [
    frozenset({"Armored Lord", "General"}),
    frozenset({"High Lord", "Halberdier"}),
    frozenset({"Wyvern Master", "Wyvern Lord"}),
    frozenset({"Princess", "Prince"}),
    frozenset({"Nohr Prince/Princess", "Manakete"}),
    frozenset({"Saint", "Bishop"}),
    frozenset({"Saint", "High Priest"}),    # Bishop = High Priest, so Saint ≈ both
    frozenset({"Onmyoji", "Bishop"}),
    frozenset({"Onmyoji", "High Priest"}),  # Bishop = High Priest, so Onmyoji ≈ both
    frozenset({"Onmyoji", "Sage"}),
    # Loptr Mage (Genealogy dark magic): partial with dark classes but NOT equal
    frozenset({"Loptr Mage", "Shaman"}),
    frozenset({"Loptr Mage", "Dark Mage"}),
    # Shaman(Genealogy) is a combat magic Monk, not the Shaman class
    frozenset({"Shaman(Genealogy)", "Monk"}),
    # Mage Knight = Dark Knight (green), but both only partial with Death Knight
    frozenset({"Mage Knight", "Death Knight"}),
    frozenset({"Dark Knight", "Death Knight"}),
    # Light Mage (Lord family) bridges to Mage family and Monk
    frozenset({"Light Mage", "Bard (Mage)"}),
    frozenset({"Light Mage", "Monk"}),
    frozenset({"Bard (Mage)", "Monk"}),
    # Pupil is partial with Mage and Shaman independently (non-transitive)
    frozenset({"Pupil", "Mage"}),
    frozenset({"Pupil", "Shaman"}),
    # Diviner ≈ Mage only (not the whole Mage family)
    frozenset({"Diviner", "Mage"}),
    # Axe Knight ≈ Cavalier only (not the whole Cavalier family)
    frozenset({"Axe Knight", "Cavalier"}),
    # Armored Lord (Lord family) ≈ each member of the General family individually
    frozenset({"Armored Lord", "Fortress Knight"}),
    frozenset({"Armored Lord", "Black Knight"}),
    # Dracoknight group (Dracoknight family) ≈ Wyvern Master (Lord family)
    frozenset({"Dracoknight", "Wyvern Master"}),
    frozenset({"Malig Knight", "Wyvern Master"}),
    # Malig Knight ≈ Melusine (dragon-type class)
    frozenset({"Malig Knight", "Melusine"}),
    # Sword Fighter = Mercenary ≈ Ranger (Ranger is in Lord family)
    frozenset({"Sword Fighter", "Ranger"}),
    frozenset({"Mercenary", "Ranger"}),
    # Adventurer ≈ Trickster
    frozenset({"Adventurer", "Trickster"}),
    # Lord(Alcryst) ≈ bow classes (not in Archer family to avoid Hunter/Apothecary links)
    frozenset({"Lord(Alcryst)", "Bow Fighter"}),
    frozenset({"Lord(Alcryst)", "Archer"}),
    # Journeyman ≈ Pirate and Fighter specifically (not the whole Fighter family)
    frozenset({"Journeyman", "Fighter"}),
    frozenset({"Journeyman", "Pirate"}),
    # Recruit bridges Knight (armor) and Cavalier (mounted); non-transitive
    frozenset({"Recruit", "Knight"}),
    frozenset({"Recruit", "Cavalier"}),
    # Noble ≈ Commoner
    frozenset({"Noble", "Commoner"}),
    # Fell Child ≈ Dragon Child (both are Alear-type classes)
    frozenset({"Fell Child", "Dragon Child"}),
]


def _classes_match(a: str, b: str) -> bool:
    if a == b:
        return True
    return any(a in group and b in group for group in CLASS_EQUIV_GROUPS)


def _sets_match(a: frozenset[str], b: frozenset[str]) -> bool:
    if a == b:
        return True
    return any(
        (a == src and b == dst) or (a == dst and b == src)
        for src, dst in CLASS_SET_ALIASES
    )


def _compare_lists(guessed: list[str], target: list[str]) -> str:
    guessed_set = set(guessed)
    target_set = set(target)
    if guessed_set == target_set:
        return "correct"
    elif guessed_set & target_set:
        return "partial"
    return "incorrect"


def _compare_classes(guessed: list[str], target: list[str]) -> str:
    guessed_fs = frozenset(guessed)
    target_fs = frozenset(target)

    if _sets_match(guessed_fs, target_fs):
        return "correct"

    all_guessed_matched = all(any(_classes_match(g, t) for t in target) for g in guessed)
    all_target_matched = all(any(_classes_match(g, t) for g in guessed) for t in target)

    if all_guessed_matched and all_target_matched:
        return "correct"

    any_equiv_match = any(_classes_match(g, t) for g in guessed for t in target)
    if any_equiv_match:
        return "partial"

    any_partial_group = any(
        a in grp and b in grp
        for a in guessed for b in target
        for grp in CLASS_PARTIAL_GROUPS
    )
    if any_partial_group:
        return "partial"

    guessed_families = {CLASS_FAMILIES.get(c) for c in guessed if c in CLASS_FAMILIES} - {None}
    target_families = {CLASS_FAMILIES.get(c) for c in target if c in CLASS_FAMILIES} - {None}
    if guessed_families & target_families:
        return "partial"

    return "incorrect"


# --- Hair color rules ---

# Exact equivalences (green): "Black or Green" is one color string that
# matches both "Black" and "Green" independently (non-transitive).
COLOR_EQUIV_GROUPS: list[frozenset[str]] = [
    frozenset({"Black or Green", "Black"}),
    frozenset({"Black or Green", "Green"}),
    # Add more as needed
]

# Non-transitive partial matches (orange): Turquoise is close to Blue
# and close to Green, but Blue and Green are not close to each other.
COLOR_PARTIAL_GROUPS: list[frozenset[str]] = [
    frozenset({"Turquoise", "Blue"}),
    frozenset({"Turquoise", "Green"}),
    frozenset({"Beige", "White"}),
    frozenset({"Beige", "Yellow"}),
    # Add more as needed
]


def _colors_match(a: str, b: str) -> bool:
    if a == b:
        return True
    return any(a in group and b in group for group in COLOR_EQUIV_GROUPS)


def _compare_colors(guessed: list[str], target: list[str]) -> str:
    all_guessed_matched = all(any(_colors_match(g, t) for t in target) for g in guessed)
    all_target_matched = all(any(_colors_match(g, t) for g in guessed) for t in target)

    if all_guessed_matched and all_target_matched:
        return "correct"

    any_exact = any(_colors_match(g, t) for g in guessed for t in target)
    any_partial = any(
        a in grp and b in grp
        for a in guessed for b in target
        for grp in COLOR_PARTIAL_GROUPS
    )
    if any_exact or any_partial:
        return "partial"

    return "incorrect"


# --- Weapon rules ---

# Set-level equivalences (green): having the full anima trio together equals
# Anima Magic, Black Magic, or Tome as a single weapon entry.
WEAPON_SET_ALIASES: list[tuple[frozenset[str], frozenset[str]]] = [
    (_ANIMA, frozenset({"Anima Magic"})),
    (_ANIMA, frozenset({"Black Magic"})),
    (_ANIMA, frozenset({"Tome"})),
]

# Individual weapon equivalences (green).
# Anima Magic = Black Magic = Tome individually (not just as a full trio).
# White Magic = Staff, Knife = Dagger, Arts = Brawling.
# Light Magic != Staff (intentionally not linked here).
WEAPON_EQUIV_GROUPS: list[frozenset[str]] = [
    frozenset({"Anima Magic", "Black Magic", "Tome"}),
    frozenset({"White Magic", "Staff"}),
    frozenset({"Knife", "Dagger"}),
    frozenset({"Arts", "Brawling"}),
]

# Non-transitive partial matches (orange).
# A single anima type (Fire/Wind/Thunder) is partial with Tome/Black Magic/Anima Magic,
# but Fire Magic and Thunder Magic are NOT partial with each other.
# Light Magic is partial with White Magic and Tome, but NOT with Staff.
WEAPON_PARTIAL_GROUPS: list[frozenset[str]] = [
    frozenset({"Fire Magic", "Tome"}),
    frozenset({"Fire Magic", "Black Magic"}),
    frozenset({"Fire Magic", "Anima Magic"}),
    frozenset({"Thunder Magic", "Tome"}),
    frozenset({"Thunder Magic", "Black Magic"}),
    frozenset({"Thunder Magic", "Anima Magic"}),
    frozenset({"Wind Magic", "Tome"}),
    frozenset({"Wind Magic", "Black Magic"}),
    frozenset({"Wind Magic", "Anima Magic"}),
    frozenset({"Dark Magic", "Tome"}),
    frozenset({"Dark Magic", "Black Magic"}),
    frozenset({"Light Magic", "White Magic"}),
    frozenset({"Light Magic", "Tome"}),
    frozenset({"White Magic", "Tome"}),
]


def _weapons_match(a: str, b: str) -> bool:
    if a == b:
        return True
    return any(a in group and b in group for group in WEAPON_EQUIV_GROUPS)


def _weapon_sets_match(a: frozenset[str], b: frozenset[str]) -> bool:
    if a == b:
        return True
    return any(
        (a == src and b == dst) or (a == dst and b == src)
        for src, dst in WEAPON_SET_ALIASES
    )


def _compare_weapons(guessed: list[str], target: list[str]) -> str:
    guessed_fs = frozenset(guessed)
    target_fs = frozenset(target)

    if _weapon_sets_match(guessed_fs, target_fs):
        return "correct"

    all_guessed_matched = all(any(_weapons_match(g, t) for t in target) for g in guessed)
    all_target_matched = all(any(_weapons_match(g, t) for g in guessed) for t in target)

    if all_guessed_matched and all_target_matched:
        return "correct"

    any_equiv = any(_weapons_match(g, t) for g in guessed for t in target)
    any_partial = any(
        a in grp and b in grp
        for a in guessed for b in target
        for grp in WEAPON_PARTIAL_GROUPS
    )
    if any_equiv or any_partial:
        return "partial"

    return "incorrect"


def _game_direction(guessed_games: list[str], target_games: list[str]) -> str | None:
    guessed_indices = [GAME_ORDER.index(g) for g in guessed_games if g in GAME_ORDER]
    target_indices = [GAME_ORDER.index(g) for g in target_games if g in GAME_ORDER]

    if not guessed_indices or not target_indices:
        return None

    if min(target_indices) > min(guessed_indices):
        return "higher"
    elif min(target_indices) < min(guessed_indices):
        return "lower"
    return None


def _compare_game(guessed_games: list[str], target_games: list[str]) -> CategoryResult:
    status = _compare_lists(guessed_games, target_games)
    direction = _game_direction(guessed_games, target_games) if status != "correct" else None
    return CategoryResult(status=status, direction=direction)


def compare_guess(guessed: Character, target: Character) -> GuessResult:
    return GuessResult(
        game=_compare_game(guessed.game, target.game),
        gender=CategoryResult(status=_compare_lists(guessed.gender, target.gender)),
        weapon=CategoryResult(status=_compare_weapons(guessed.weapon, target.weapon)),
        starting_class=CategoryResult(status=_compare_classes(guessed.starting_class, target.starting_class)),
        movement_type=CategoryResult(status=_compare_lists(guessed.movement_type, target.movement_type)),
        hair_color=CategoryResult(status=_compare_colors(guessed.hair_color, target.hair_color)),
        promotion_tier=CategoryResult(status="correct" if guessed.promotion_tier == target.promotion_tier else "incorrect"),
    )


def get_or_create_session(
    db: Session,
    daily_challenge_id: int,
    user_id: int | None,
    anonymous_id: str | None,
) -> GameSession:
    query = db.query(GameSession).filter(
        GameSession.daily_challenge_id == daily_challenge_id
    )
    if user_id is not None:
        query = query.filter(GameSession.user_id == user_id)
    else:
        query = query.filter(GameSession.anonymous_id == anonymous_id)

    session = query.first()
    if session is None:
        session = GameSession(
            user_id=user_id,
            anonymous_id=anonymous_id,
            daily_challenge_id=daily_challenge_id,
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    return session


def submit_guess(
    db: Session,
    session: GameSession,
    guessed_character: Character,
    target_character: Character,
) -> Guess:
    if session.completed:
        raise ValueError("Session already completed")

    result = compare_guess(guessed_character, target_character)
    attempt_number = session.attempts_count + 1

    guess = Guess(
        session_id=session.id,
        character_id=guessed_character.id,
        attempt_number=attempt_number,
        result=result.model_dump(),
    )
    db.add(guess)

    won = guessed_character.id == target_character.id

    session.attempts_count = attempt_number
    if won or attempt_number >= MAX_ATTEMPTS:
        session.completed = True
        session.won = won
        session.finished_at = datetime.now(timezone.utc)
        if session.user_id is not None:
            _update_user_stats(db, session.user_id, won, attempt_number)

    db.commit()
    db.refresh(guess)
    db.refresh(session)
    return guess


def _update_user_stats(db: Session, user_id: int, won: bool, attempts: int) -> None:
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if stats is None:
        stats = UserStats(user_id=user_id)
        db.add(stats)

    today = date.today()
    stats.games_played += 1

    if won:
        stats.games_won += 1
        if stats.last_played_date == today - timedelta(days=1):
            stats.current_streak += 1
        elif stats.last_played_date != today:
            stats.current_streak = 1
        stats.max_streak = max(stats.max_streak, stats.current_streak)
        total_attempts = stats.avg_attempts * (stats.games_won - 1) + attempts
        stats.avg_attempts = round(total_attempts / stats.games_won, 2)
    else:
        stats.current_streak = 0

    stats.last_played_date = today
    db.commit()
