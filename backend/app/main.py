from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.auth import create_session, get_current_session
from app.config import settings
from app.crypto import decrypt_sso_payload

app = FastAPI(title="GHL Custom Pages SSO")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SSODecryptRequest(BaseModel):
    key: str


@app.post("/sso/decrypt")
async def decrypt_sso(request: SSODecryptRequest):
    """Decrypt GHL SSO payload and return a JWT."""
    try:
        user_data = decrypt_sso_payload(request.key, settings.ghl_shared_secret)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Decryption failed: {str(e)}")

    token = create_session(user_data)

    return {
        "token_type": "Bearer",
        "access_token": token,
        "expires_in": settings.jwt_expire_minutes * 60,
    }


@app.get("/sso/session")
async def get_session(session: dict = Depends(get_current_session)):
    """Return current session data. Requires valid JWT."""
    return {"status": "success", "data": session}
