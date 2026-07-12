from pathlib import Path
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_SERVER: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "assistant_ft"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/assistant_ft"
    SECRET_KEY: str = "change-me"
    FRONTEND_URL: AnyHttpUrl = "http://localhost:3000"

    class Config:
        env_file = Path(__file__).resolve().parents[2] / ".env"
        env_file_encoding = "utf-8"


settings = Settings()
