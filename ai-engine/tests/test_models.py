import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.anyio
async def test_list_models():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/models")
        assert response.status_code == 200
        models = response.json()
        assert len(models) >= 3

        model_names = [m["name"] for m in models]
        assert "qwen2.5-coder:7b" in model_names
        assert "deepseek-coder:6.7b" in model_names
        assert "llama3.2:3b" in model_names
