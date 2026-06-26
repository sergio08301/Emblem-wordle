from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import army, auth, characters, game, infinite, stats
from app.core.config import settings

app = FastAPI(title="Emblem Wordle API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        settings.frontend_url,
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
app.include_router(army.router)


@app.get("/health")
def health():
    return {"status": "ok"}
