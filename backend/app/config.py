from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # GHL Shared Secret from your app's Advanced Settings
    ghl_shared_secret: str

    # JWT configuration
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    # CORS
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
