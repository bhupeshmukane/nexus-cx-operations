from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file."""

    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    AI_API_KEY: Optional[str] = None
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def __repr__(self) -> str:
        # Prevent accidental printing or logging of sensitive keys
        masked_service_key = "***" if self.SUPABASE_SERVICE_ROLE_KEY else ""
        masked_ai_key = "***" if self.AI_API_KEY else None
        return (
            f"Settings(SUPABASE_URL='{self.SUPABASE_URL}', "
            f"SUPABASE_SERVICE_ROLE_KEY='{masked_service_key}', "
            f"AI_API_KEY={'***' if masked_ai_key else None}, "
            f"ENVIRONMENT='{self.ENVIRONMENT}')"
        )

    def __str__(self) -> str:
        return self.__repr__()


@lru_cache
def get_settings() -> Settings:
    """Return a cached instance of application settings."""
    return Settings()
