import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.anyio
async def test_root_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["app"] == "NEXCODE AI Engine"
        assert data["status"] == "ready"

@pytest.mark.anyio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "NEXCODE AI Engine"
        assert "ollama" in data

@pytest.mark.anyio
async def test_hardware_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/hardware")
        assert response.status_code == 200
        data = response.json()
        assert "cpu_model" in data
        assert "cpu_cores" in data
        assert "ram_gb" in data
        assert "acceleration_mode" in data
        assert data["acceleration_mode"] in ["CPU", "ROCm", "CUDA"]
