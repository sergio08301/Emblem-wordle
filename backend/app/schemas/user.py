from datetime import datetime
from pydantic import BaseModel, EmailStr

#Los esquemas Pydantic son la capa de contrato de la API: definen exactamente qué datos acepta cada endpoint y qué devuelve. Son distintos de los modelos SQLAlchemy aunque a veces se parezcan.
#Un ejemplo concreto de por qué los necesitamos: el modelo User tiene password_hash — nunca debes devolverlo en una respuesta de API. 
#El esquema UserResponse existe precisamente para devolver solo lo que el frontend necesita ver: id, username, email, created_at.

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: int | None = None


class UserStatsResponse(BaseModel):
    games_played: int
    games_won: int
    current_streak: int
    max_streak: int
    avg_attempts: float

    model_config = {"from_attributes": True}
