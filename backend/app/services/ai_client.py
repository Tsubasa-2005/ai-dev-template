from __future__ import annotations

import httpx

from ..core.config import settings
from .typing import JSON


async def chat(model: str, messages: list[dict[str, str]], temperature: float = 0.2) -> str:
    payload: JSON = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }
    headers = {"Content-Type": "application/json"}
    if settings.ai_api_key:
        headers["Authorization"] = f"Bearer {settings.ai_api_key}"
    # OpenRouter recommends sending Referer and X-Title for attribution and rate limit grouping
    if settings.http_referer:
        headers["HTTP-Referer"] = settings.http_referer
    if settings.x_title:
        headers["X-Title"] = settings.x_title
    url = settings.ai_api_base_url.rstrip("/") + settings.ai_api_path
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(url, json=payload, headers=headers)
    resp.raise_for_status()
    data: JSON = resp.json()

    # Try OpenAI-like shape first
    if isinstance(data, dict):
        choice0 = (data.get("choices") or [{}])[0]
        if isinstance(choice0, dict):
            msg = choice0.get("message") or {}
            if isinstance(msg, dict):
                content = msg.get("content")
                if isinstance(content, str):
                    return content
        # Some providers use top-level fields
        for key in ("reply", "content", "text"):
            val = data.get(key)
            if isinstance(val, str):
                return val
    # Fallback stringification
    return str(data)


async def list_models() -> list[dict[str, str]]:
    """Fetch available models from provider (OpenRouter-compatible /models)."""
    headers = {"Accept": "application/json"}
    if settings.ai_api_key:
        headers["Authorization"] = f"Bearer {settings.ai_api_key}"
    if settings.http_referer:
        headers["HTTP-Referer"] = settings.http_referer
    if settings.x_title:
        headers["X-Title"] = settings.x_title
    url = settings.ai_api_base_url.rstrip("/") + settings.ai_models_path
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.get(url, headers=headers)
    resp.raise_for_status()
    data: JSON = resp.json()
    # OpenRouter returns { data: [ { id, name, ... } ] }
    items: list[dict[str, str]] = []
    if isinstance(data, dict):
        raw = data.get("data")
        if isinstance(raw, list):
            for m in raw:
                if isinstance(m, dict):
                    items.append({
                        "id": str(m.get("id", "")),
                        "name": str(m.get("name", m.get("id", ""))),
                    })
    return items
