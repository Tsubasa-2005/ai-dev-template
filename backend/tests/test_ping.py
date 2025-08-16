from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_ping_returns_ok():
    res = client.get("/ping")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
