from __future__ import annotations

from typing import List, Optional, Tuple

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./route53.db"
    secret_key: str = "route53-clone-dev-secret-key-change-in-production"
    session_cookie_name: str = "route53_session"
    session_max_age: int = 86400 * 7  # 7 days
    cors_origins: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
