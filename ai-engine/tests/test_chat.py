import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.anyio
async def test_chat_completions_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "model": "qwen2.5-coder:7b",
            "messages": [
                {"role": "user", "content": "How do I reverse a string in TypeScript?"}
            ],
            "stream": False
        }
        response = await client.post("/api/v1/chat/completions", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["model"] == "qwen2.5-coder:7b"
        assert "message" in data
        assert data["message"]["role"] == "assistant"
        assert len(data["message"]["content"]) > 0
