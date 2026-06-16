from datetime import datetime, timedelta, timezone
import bcrypt
from jose import JWTError, jwt
from app.core.config import settings


#Encritar y desencriptar las contraseñas
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

#Cuando el usuario se loguea, le damos un JWT.
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

#. En cada petición posterior nos lo envía en el header y verificamos la firma, si es válida, sabemos quién es sin consultar la BD.
def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None
