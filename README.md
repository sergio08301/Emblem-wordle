# FE Guess

A Wordle/Loldle-style web game for guessing Fire Emblem characters based on their attributes. Each day a new character is selected and players must identify it through comparative clues (correct / partial / incorrect) across categories like game of origin, weapon, class, movement type and hair color.

Players can compete anonymously or create an account to save streaks, stats, and build an army of recruited characters.

---

## Tech Stack

### Frontend

| Technology | Role in this project |
|---|---|
| **React 19** | UI framework. Every screen is a component tree; state flows down via props or context. |
| **Vite** | Build tool and dev server. Handles JSX transpilation, hot module replacement, and production bundling. Also provides `import.meta.env` for environment variables (`VITE_API_URL`). |
| **React Router v7** | Client-side routing. Defines the four routes: `/` (daily), `/infinite`, `/barracks`, `/login`, `/register`. See `frontend/src/App.jsx`. |
| **Tailwind CSS v4** | Utility-first CSS. Used for layout and responsive breakpoints (`lg:`, `xl:`). Some components use inline styles instead when dynamic values are needed (e.g. XP bar width as a percentage). |
| **Context API** | Global auth state. `frontend/src/context/AuthContext.jsx` stores the JWT token and the logged-in user object, exposing them via `useAuth()` to any component without prop drilling. |

### Backend

| Technology | Role in this project |
|---|---|
| **Python 3.13** | Runtime language for the entire backend. |
| **FastAPI** | Web framework. Declares HTTP endpoints with type-annotated function signatures. Automatically generates OpenAPI docs at `/docs`. Entry point: `backend/app/main.py`. |
| **Pydantic v2** | Data validation and serialization. Every request body and response body is a Pydantic model (`backend/app/schemas/`). FastAPI uses these to validate incoming JSON and serialize outgoing responses. |
| **pydantic-settings** | Reads environment variables into a typed `Settings` object (`backend/app/core/config.py`). In production, values come from the host's env vars; locally from `backend/.env`. |
| **SQLAlchemy 2** | ORM. Python classes in `backend/app/models/` map to database tables. Queries are written in Python (no raw SQL). Uses the new `Mapped[type]` annotation style for type safety. |
| **Alembic** | Database migration tool. Each schema change is a versioned script in `backend/alembic/versions/`. Running `alembic upgrade head` applies all pending migrations to the database. |
| **psycopg2** | PostgreSQL driver. SQLAlchemy uses it under the hood to talk to the database; it is never called directly. |
| **python-jose** | JWT creation and verification. `backend/app/core/security.py` uses it to sign tokens on login and verify them on protected endpoints. |
| **bcrypt** | Password hashing. Passwords are never stored in plain text; `auth_service.py` hashes on register and checks the hash on login. |
| **python-multipart** | Required by FastAPI to accept `multipart/form-data` (used in the login form flow). |
| **uvicorn** | ASGI server that runs the FastAPI app. In development: `uvicorn app.main:app --reload`. In production: started via `Procfile` using the `$PORT` env var injected by the hosting platform. |

### Database

| Technology | Role in this project |
|---|---|
| **PostgreSQL** | Relational database. Stores all persistent data: users, characters, daily challenges, game sessions, guesses, stats, army rosters. |
| **Supabase** | Managed PostgreSQL hosting (free tier). Provides the `DATABASE_URL` connection string used by SQLAlchemy. |

### Infrastructure

| Technology | Role in this project |
|---|---|
| **Vercel** | Frontend hosting. Detects Vite automatically, builds with `npm run build`, serves `frontend/dist/`. The `VITE_API_URL` env var is set here to point at the backend. |
| **GitHub** | Source control and CI trigger for Vercel deployments. |

---

## Repository Structure

```
fe-guess/
├── frontend/
│   ├── index.html              ← HTML shell; loads Google Fonts (Cormorant Garamond, Josefin Sans) for the logo
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
    ├── requirements.txt        ← All Python dependencies (pinned-free; install with pip install -r)
    ├── Procfile                ← Tells the hosting platform how to start the server: uvicorn + $PORT
    ├── .env.example            ← Template for required environment variables
    │
    ├── alembic/
    │   ├── env.py              ← Alembic config; imports all models so it can detect schema changes
    │   └── versions/           ← One file per migration, applied in order by `alembic upgrade head`
    │       ├── cfd34fd1fb38_create_tables.py              ← Initial schema (all core tables)
    │       ├── 0953ec57d3ba_gender_array.py               ← Made gender a multi-value field
    │       ├── 692ee0101dd5_add_promotion_tier_to_characters.py
    │       ├── 47dddd3abc5c_add_last_played_date_to_user_stats.py
    │       └── fb88e8dbea98_add_user_characters_and_daily_deploy_.py ← Army system tables
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

## Database Schema

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

## Key Design Decisions

### Separation of concerns
Routers only parse the request, call a service, and return the response. All logic (guess comparison, XP calculation, daily character selection) lives in `services/`. This makes the business rules independently testable and keeps routers thin.

### Guest play without an account
`game_sessions.user_id` is nullable. Guests get a UUID stored in `localStorage` (`utils/anonymousId.js`) that acts as their anonymous identity. Stats for guests live in `localStorage` only (`utils/localStats.js`) and are not synced to the server.

### Guess result as JSON
`guesses.result` stores the full per-category comparison as a JSON object. This means adding or removing a category (e.g. a new attribute) doesn't require changing the table schema, only the comparison logic in `game_service.py`.

### XP system
- Winning the daily challenge awards **100 XP**, split equally among all deployed characters below max level.
- Each level requires **100 XP** (so one character levels up every day if solo-deployed).
- Maximum level is **20**.
- XP is awarded automatically on win; the recruit prompt is a separate opt-in action.

### Composite primary keys in the army tables
`user_characters` uses `(user_id, character_id)` as its PK — a user can recruit each character at most once, enforced at the database level. `daily_deploy_tokens` uses `(user_id, date)` — one token per user per day, also enforced at the database level.

### Infinite mode authentication
Infinite mode is stateless: the server issues a short-lived session JWT per game (no user identity embedded). To associate a logged-in user with an infinite guess, the frontend passes *both* the infinite session JWT and the user's bearer token. The backend has an optional auth dependency (`_get_user_optional`) that extracts the user if the bearer token is present but doesn't require it.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (`postgresql://user:pass@host:5432/db`) |
| `SECRET_KEY` | Secret used to sign JWTs. Generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | JWT algorithm. Default: `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime. Default: `30` |
| `FRONTEND_URL` | Allowed CORS origin for the frontend (e.g. `https://fe-guess.vercel.app`) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (e.g. `https://your-backend.com`). Falls back to `http://localhost:8000`. |

---

## Running Locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
cp .env.example .env           # fill in DATABASE_URL and SECRET_KEY
alembic upgrade head           # apply all migrations
uvicorn app.main:app --reload
```

API available at `http://localhost:8000` — interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
# optional: create .env.local with VITE_API_URL=http://localhost:8000
npm run dev
```

App available at `http://localhost:5173`.
