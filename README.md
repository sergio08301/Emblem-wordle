# Emblem-wordle

A Wordle/Loldle-style web game for guessing Fire Emblem characters based on their attributes.

## Concept

The user enters the name of a Fire Emblem character. The system compares it against the "character of the day" and returns, for each category, whether the value matches (green), partially matches (orange), or doesn't match (red). For "game" (game of origin), an additional indicator shows whether the daily character's game is earlier or later (up/down arrow) based on chronological release order.

Users can play without an account (anonymous mode) or register to save their streak and stats across devices.

### Character categories (core of the game)

Each character has the following fields, used for comparison:

- `name` — character name
- `portrait` — portrait/sprite URL
- `game` — game of origin (with chronological up/down indicator)
- `gender` — gender
- `weapon` — primary weapon (Sword, Lance, Axe, Bow, Tome, Staff...)
- `starting_class` — starting class (Cavalier, Mage, Thief...)
- `movement_type` — movement type (Infantry, Cavalry, Armored, Flying...)
- `hair_color` — hair color

### Comparison logic (core of the game)

For each category in the guess vs. the daily character:
- **Correct (green):** identical value
- **Partial (orange):** partial match — mainly applies to fields with multiple possible values (e.g. a character with two starting classes, or several weapon types)
- **Incorrect (red):** no match
- **Game:** in addition to correct/incorrect, a chronological indicator (higher / lower) relative to the actual game of origin


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

```
fe-guess/
├── frontend/
│   ├── index.html              ← HTML shell
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx            ← React entry point; mounts <App /> into #root
│       ├── App.jsx             ← Router definition; all routes declared here
│       ├── App.css / index.css ← Global styles and Tailwind base import
│       │
│       ├── pages/
│       │   ├── Home.jsx        ← Daily challenge screen; uses useGame() hook
│       │   ├── Infinite.jsx    ← Infinite mode screen; uses useInfiniteGame() hook
│       │   ├── Barracks.jsx    ← Army management screen (deployment / bench, XP bars)
│       │   ├── Login.jsx       ← Login form; calls auth.login(), stores token via AuthContext
│       │   └── Register.jsx    ← Registration form
│       │
│       ├── components/
│       │   ├── Navbar.jsx      ← Top bar with Logo, mute toggle, auth buttons, Barracks link
│       │   ├── Logo.jsx        ← "FE Guess" brand logo (Fire Emblem Engage style, CSS-only)
│       │   ├── GameBoard.jsx   ← Renders the grid of all guess rows; responsive column widths
│       │   ├── GuessRow.jsx    ← One guess: portrait + name + one ResultCell per category
│       │   ├── ResultCell.jsx  ← Single colored cell (green/orange/red) with value and arrow
│       │   ├── SearchInput.jsx ← Autocomplete character picker; fetches from GET /characters
│       │   ├── ResultModal.jsx ← End-of-game overlay: recruit prompt, XP report, stats, share
│       │   ├── HPBar.jsx       ← Infinite mode health bar (lives remaining)
│       │   └── HowToPlayModal.jsx ← Rules explanation modal
│       │
│       ├── hooks/
│       │   ├── useGame.js         ← All daily game state: session, guesses, result, XP report,
│       │   │                         recruit state. Calls GET /game/today and POST /game/guess.
│       │   ├── useInfiniteGame.js ← Infinite mode state: session token, guesses, recruit token.
│       │   │                         Calls POST /infinite/start and POST /infinite/guess.
│       │   └── useStats.js        ← Reads and writes local stats for anonymous users.
│       │
│       ├── context/
│       │   └── AuthContext.jsx  ← Provides { user, token, login, logout } to the whole app.
│       │                           Token is persisted in localStorage.
│       │
│       ├── services/
│       │   ├── api.js           ← All fetch() calls to the backend, organized by feature.
│       │   │                       BASE_URL reads from import.meta.env.VITE_API_URL.
│       │   └── auth.js          ← login() and register() helpers (thin wrappers over api.js).
│       │
│       └── utils/
│           ├── anonymousId.js   ← Generates and persists a UUID in localStorage for guest play.
│           ├── localStats.js    ← Reads/writes win streak and stats to localStorage (guests only).
│           ├── share.js         ← Builds the emoji grid string for the share button.
│           └── sounds.js        ← Plays hit / level-up / death sound effects.
│
└── backend/
    ├── requirements.txt        ← All Python dependencies
    ├── Procfile                ← Tells the hosting platform how to start the server: uvicorn + $PORT
    │
    ├── alembic/
    │   ├── env.py              ← Alembic config; imports all models so it can detect schema changes
    │   └── versions/           ← One file per migration, applied in order by `alembic upgrade head`
    │
    └── app/
        ├── main.py             ← FastAPI app instance; CORS middleware; router registration
        │
        ├── core/
        │   ├── config.py       ← Settings model (DATABASE_URL, SECRET_KEY, FRONTEND_URL…)
        │   ├── database.py     ← SQLAlchemy engine + SessionLocal; get_db() dependency
        │   └── security.py     ← create_access_token(), verify_token(), password hash/verify
        │
        ├── models/             ← SQLAlchemy ORM models (one class = one table)
        │   ├── user.py         ← users table
        │   ├── character.py    ← characters table (all guessable attributes)
        │   ├── daily_challenge.py  ← daily_challenges table (character_id + date)
        │   ├── game_session.py ← game_sessions table (links user/anonymous to a daily challenge)
        │   ├── guess.py        ← guesses table (one row per guess attempt; result stored as JSON)
        │   ├── user_stats.py   ← user_stats table (streak, win rate, avg attempts)
        │   ├── user_character.py   ← user_characters table; composite PK (user_id, character_id);
        │   │                         tracks level, xp, slot (deployment/bench)
        │   └── daily_deploy_token.py ← daily_deploy_tokens table; composite PK (user_id, date);
        │                               records if the user's free infinite-mode recruit was used today
        │
        ├── schemas/            ← Pydantic models for request/response validation
        │   ├── user.py         ← UserCreate, UserResponse, Token
        │   ├── character.py    ← CharacterResponse (used in the autocomplete search)
        │   ├── game.py         ← SessionResponse, GuessResponse, TargetCharacter, XpReportEntry…
        │   └── army.py         ← UserCharacterResponse, BarracksResponse, RecruitResultResponse…
        │
        ├── routers/            ← HTTP endpoint definitions (thin layer: validate → call service → return)
        │   ├── auth.py         ← POST /auth/register, POST /auth/login, GET /auth/me
        │   ├── characters.py   ← GET /characters (search/autocomplete)
        │   ├── game.py         ← GET /game/today, POST /game/guess
        │   ├── infinite.py     ← POST /infinite/start, POST /infinite/guess
        │   ├── stats.py        ← GET /stats/me
        │   └── army.py         ← GET /army/me/barracks, POST /army/me/recruit/daily,
        │                         POST /army/me/recruit/infinite, PUT /army/me/characters/{id}/slot
        │
        └── services/           ← All business logic lives here, never in routers or frontend
            ├── auth_service.py   ← User creation, login credential check, JWT issuance
            ├── daily_service.py  ← Picks today's character; creates/retrieves game sessions
            ├── game_service.py   ← Guess comparison logic (correct/partial/incorrect per category)
            └── army_service.py   ← XP award, level-up, recruit, slot management, token tracking
```

---


## Database schema

### Core tables

**users** — registered accounts  
`id` · `username` · `email` · `password_hash` · `created_at` · `last_login`

**characters** — the full roster of guessable Fire Emblem characters  
`id` · `name` · `portrait_url` · `game` · `gender[]` · `weapon[]` · `starting_class[]` · `movement_type` · `hair_color` · `promotion_tier` · `is_active`

**daily_challenges** — one row per calendar day  
`id` · `character_id (FK)` · `challenge_date`

**game_sessions** — one row per user per day (or per anonymous session)  
`id` · `user_id (FK, nullable)` · `anonymous_id (nullable)` · `daily_challenge_id (FK)` · `completed` · `won` · `attempts_count` · `started_at` · `finished_at`  
> `user_id` is nullable to allow guest play. If present, `anonymous_id` is ignored.

**guesses** — one row per guess attempt  
`id` · `session_id (FK)` · `character_id (FK)` · `attempt_number` · `result (JSON)` · `guessed_at`  
> `result` is a flexible JSON blob so adding a new game category doesn't require a migration.

**user_stats** — aggregated stats per registered user  
`id` · `user_id (FK)` · `games_played` · `games_won` · `current_streak` · `max_streak` · `avg_attempts` · `last_played_date`

### Army tables

**user_characters** — the player's recruited army roster  
`user_id (PK, FK)` · `character_id (PK, FK)` · `level` · `xp` · `slot` · `acquired_at`  
> Composite primary key prevents a user from recruiting the same character twice.  
> `slot` is either `"deployment"` (max 10, earns XP) or `"bench"` (unlimited, no XP).

**daily_deploy_tokens** — tracks the one free infinite-mode recruit per day per user  
`user_id (PK, FK)` · `date (PK)` · `character_id (FK, nullable)`  
> A row for today means the token was already used. No row means it's available.

---

### Important design notes
- `user_id` is nullable in `game_sessions` to support guest play. If `user_id` is present, `anonymous_id` is ignored.
- `guesses.result` is flexible JSON so the schema doesn't need a migration if categories are added or removed in the future.
- Anonymous users don't have a row in `user_stats`; their stats live client-side (not persisted across devices).


## Hosting and costs

The entire stack can be deployed for free:
- **Vercel** (frontend) — free Hobby plan
- **Koyeb** (backend) — permanent free plan, no server "sleep"
- **Supabase** (PostgreSQL) — free plan, 500MB (well above what this project needs)
- **GitHub** — free repository

## Product considerations

- This is a portfolio project: special emphasis is placed on having solid business logic implemented in the backend (not delegated to the frontend), with clear endpoints and proper authentication code.
- The game work perfectly without requiring login.
- A user can only play a given day's challenge once (enforced via `game_sessions`).


## Running Locally

### Backend

```bash
cd backend
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
alembic upgrade head           # apply all migrations
uvicorn app.main:app --reload
```

API available at `http://localhost:8000` — interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`.
