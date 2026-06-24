from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, characters, game, infinite, stats

app = FastAPI(title="Emblem Wordle API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Alternative local port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(characters.router)
app.include_router(game.router)
app.include_router(infinite.router)
app.include_router(stats.router)


@app.get("/health")
def health():
    return {"status": "ok"}
