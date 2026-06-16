# Emblem Wordle

A Wordle/Loldle-style web game for guessing Fire Emblem characters based on their attributes.

## Concept

The user enters the name of a Fire Emblem character. The system compares it against the "character of the day" and returns, for each category, whether the value matches (green), partially matches (orange), or doesn't match (red). For "game" (game of origin), an additional indicator shows whether the daily character's game is earlier or later (up/down arrow) based on chronological release order.

Users can play without an account (anonymous mode) or register to save their streak and stats across devices.

## Tech stack

| Layer | Technology |
|------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy + Alembic (migrations) |
| Auth | JWT (python-jose) |
| Frontend hosting | Vercel |
| Backend hosting | Koyeb |
| Database hosting | Supabase |
| Repository | GitHub |

## Repository structure

Monorepo with two independent folders:

```
emblem-wordle/
├── frontend/   (React + Vite)
├── backend/    (FastAPI)
└── README.md
```

## Character categories (core of the game)

Each character has the following fields, used for comparison:

- `name` — character name
- `portrait` — portrait/sprite URL
- `game` — game of origin (with chronological up/down indicator)
- `gender` — gender
- `weapon` — primary weapon (Sword, Lance, Axe, Bow, Tome, Staff...)
- `starting_class` — starting class (Cavalier, Mage, Thief...)
- `movement_type` — movement type (Infantry, Cavalry, Armored, Flying...)
- `hair_color` — hair color

**Deliberately excluded:** affiliation/country (characters with ambiguous or shifting loyalties), year (redundant with game), is_lord (barely relevant, applies to very few characters).

## Comparison logic (core of the game)

For each category in the guess vs. the daily character:
- **Correct (green):** identical value
- **Partial (orange):** partial match — mainly applies to fields with multiple possible values (e.g. a character with two starting classes, or several weapon types)
- **Incorrect (red):** no match
- **Game:** in addition to correct/incorrect, a chronological indicator (higher / lower) relative to the actual game of origin

## Database schema

**users**
- id (PK), username, email, password_hash, created_at, last_login

**characters**
- id (PK), name, portrait_url, game, gender, weapon, starting_class, movement_type, hair_color, is_active

**daily_challenges**
- id (PK), character_id (FK), challenge_date

**game_sessions**
- id (PK), user_id (FK, nullable), anonymous_id (nullable, for guest users), daily_challenge_id (FK), completed, won, attempts_count, started_at, finished_at

**guesses**
- id (PK), session_id (FK), character_id (FK), attempt_number, result (JSON with the per-category result), guessed_at

**user_stats**
- id (PK), user_id (FK), games_played, games_won, current_streak, max_streak, avg_attempts

### Important design notes
- `user_id` is nullable in `game_sessions` to support guest play. If `user_id` is present, `anonymous_id` is ignored.
- `guesses.result` is flexible JSON so the schema doesn't need a migration if categories are added or removed in the future.
- Anonymous users don't have a row in `user_stats`; their stats live client-side (not persisted across devices).

## Folder structure

### frontend/
```
src/
├── components/   (GameBoard, GuessRow, SearchInput, ResultCell, StatsModal, Navbar)
├── pages/        (Home, Login, Register)
├── hooks/        (useGame, useAuth)
├── services/     (api.js, auth.js)
├── context/      (AuthContext)
├── utils/        (compareGuess.js, anonymousId.js)
├── App.jsx
└── main.jsx
```

### backend/
```
app/
├── routers/      (auth.py, characters.py, game.py, stats.py)
├── models/       (user.py, character.py, game_session.py, guess.py) — SQLAlchemy
├── schemas/      (user.py, game.py, guess.py) — Pydantic
├── services/     (auth_service.py, game_service.py, daily_service.py) — business logic
├── core/         (config.py, database.py, security.py)
└── main.py
alembic/          (migrations)
requirements.txt
```

**Separation of concerns in the backend:** routers only receive/return data and call the services; all business logic (guess comparison, daily character selection, etc.) lives in `services/`, never in the routers and never delegated to the frontend.

## Hosting and costs

The entire stack can be deployed for free:
- **Vercel** (frontend) — free Hobby plan
- **Koyeb** (backend) — permanent free plan, no server "sleep"
- **Supabase** (PostgreSQL) — free plan, 500MB (well above what this project needs)
- **GitHub** — free repository

## Product considerations

- This is a portfolio project: special emphasis is placed on having solid business logic implemented in the backend (not delegated to the frontend), with clear endpoints and proper authentication code.
- The game must work perfectly without requiring login.
- A user can only play a given day's challenge once (enforced via `game_sessions`).
