"""
JWT session management for GHL SSO.

Creates JWT tokens from decrypted GHL user data and validates them
on subsequent requests. Uses an in-memory session store — replace
with Redis or a database for production.
"""

from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings

security = HTTPBearer()

# In-memory session store. Replace with Redis in production.
_sessions: dict[str, dict] = {}


def create_session(user_data: dict) -> str:
    """Create a JWT token from decrypted GHL user data."""
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_expire_minutes
    )
    payload = {
        "sub": user_data["userId"],
        "company_id": user_data["companyId"],
        "role": user_data["role"],
        "type": user_data["type"],
        "exp": expires,
    }
    if "activeLocation" in user_data:
        payload["active_location"] = user_data["activeLocation"]

    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    _sessions[token] = {
        "userId": user_data["userId"],
        "companyId": user_data["companyId"],
        "role": user_data["role"],
        "type": user_data["type"],
        "activeLocation": user_data.get("activeLocation"),
    }

    return token


def get_current_session(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Validate JWT and return session data."""
    token = credentials.credentials
    try:
        jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    session = _sessions.get(token)
    if not session:
        raise HTTPException(status_code=401, detail="Session not found")

    return session
