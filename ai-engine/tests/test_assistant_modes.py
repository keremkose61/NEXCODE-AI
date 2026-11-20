import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.prompts.templates import PROMPT_TEMPLATES, get_system_prompt_for_mode

def test_all_12_prompt_templates_defined():
    required_modes = [
        "chat",
        "explain",
        "generate",
        "fix",
        "optimize",
        "convert",
        "error_analysis",
        "docgen",
        "testgen",
        "analyze_file",
        "analyze_selection",
        "project_context"
    ]
    for mode in required_modes:
        assert mode in PROMPT_TEMPLATES, f"Missing mode template: {mode}"
        prompt = get_system_prompt_for_mode(mode)
        assert len(prompt) > 20
        assert "NEXCODE AI" in prompt

def test_system_prompt_extra_instructions():
    prompt = get_system_prompt_for_mode("explain", "Focus on memory leaks.")
    assert "Focus on memory leaks." in prompt
    assert "NEXCODE AI Code Explainer" in prompt

@pytest.mark.anyio
async def test_chat_completions_with_mode():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "model": "qwen2.5-coder:7b",
            "mode": "testgen",
            "messages": [
                {"role": "user", "content": "Write unit tests for a binary search function."}
            ],
            "stream": False
        }
        response = await client.post("/api/v1/chat/completions", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["model"] == "qwen2.5-coder:7b"
        assert "message" in data
        assert len(data["message"]["content"]) > 0
