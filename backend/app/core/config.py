from __future__ import annotations

import os

from pydantic import BaseModel

try:
    import os as _os
    from pathlib import Path as _Path

    from dotenv import load_dotenv  # type: ignore

    # Resolve backend/ directory containing .env files: backend/app/core/config.py -> backend/
    _env_dir = _Path(__file__).resolve().parents[2]
    load_dotenv(dotenv_path=str(_env_dir / ".env"), override=False)
    load_dotenv(dotenv_path=str(_env_dir / ".env.local"), override=False)
except Exception:
    # dotenv is optional
    pass


class Settings(BaseModel):
    app_name: str = "AI Dev Template Backend"
    cors_allow_origins: list[str] = ["*"]  # tighten in production
    # Default to OpenRouter
    ai_api_base_url: str = os.getenv("AI_API_BASE_URL", "https://openrouter.ai/api/v1")
    # Prefer OPENROUTER_API_KEY if provided, fallback to AI_API_KEY
    ai_api_key: str | None = os.getenv("OPENROUTER_API_KEY") or os.getenv("AI_API_KEY")
    ai_api_path: str = os.getenv("AI_API_PATH", "/chat/completions")
    ai_models_path: str = os.getenv("AI_MODELS_PATH", "/models")
    # Optional OpenRouter headers for attribution/rate-limits context
    http_referer: str | None = os.getenv("OPENROUTER_HTTP_REFERER") or os.getenv("APP_URL")
    x_title: str | None = os.getenv("OPENROUTER_X_TITLE") or app_name


settings = Settings()
