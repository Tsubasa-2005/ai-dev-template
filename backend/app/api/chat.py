from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException

from ..models.chat import ChatRequest, ChatResponse
from ..services.ai_client import chat as ai_chat
from ..services.ai_client import list_models as ai_list_models

router = APIRouter(prefix="", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    try:
        reply = await ai_chat(req.model, [m.model_dump() for m in req.messages])
        return ChatResponse(model=req.model, reply=reply)
    except httpx.HTTPStatusError as e:
        # Bubble up provider status (e.g., 401 Unauthorized)
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models")
async def models() -> list[dict[str, str]]:
    try:
        return await ai_list_models()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))
