from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_models_endpoint_returns_list(monkeypatch):
    # Mock service response by patching the router's service function via requests_mock
    from app.api import chat as chat_api

    async def fake_list_models():
        return [
            {"id": "openrouter/cognitivecomputations/dolphin-mixtral-8x7b", "name": "Dolphin Mixtral 8x7B"},
            {"id": "openrouter/anthropic/claude-3.5-sonnet", "name": "Claude 3.5 Sonnet"},
        ]

    monkeypatch.setattr(chat_api, "ai_list_models", fake_list_models)

    res = client.get("/models")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["id"].startswith("openrouter/")


def test_chat_endpoint_happy_path(monkeypatch):
    from app.api import chat as chat_api

    async def fake_chat(model: str, messages):
        assert model == "openrouter/openai/gpt-4o-mini"
        assert isinstance(messages, list)
        return "hello"

    monkeypatch.setattr(chat_api, "ai_chat", fake_chat)

    body = {
        "model": "openrouter/openai/gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "hi"},
        ],
    }
    res = client.post("/chat", json=body)
    assert res.status_code == 200
    assert res.json() == {"model": body["model"], "reply": "hello"}
