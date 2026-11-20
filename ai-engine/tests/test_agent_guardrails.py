import os
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.security.guardrails import (
    is_within_directory,
    sanitize_workspace_path,
    is_sensitive_path,
    generate_unified_diff
)
from app.tools.workspace_tools import scan_project_files, read_workspace_file
from app.agents.task_planner import generate_task_plan

def test_directory_traversal_prevention(tmp_path):
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    secret_dir = tmp_path / "secrets"
    secret_dir.mkdir()
    secret_file = secret_dir / "passwords.txt"
    secret_file.write_text("classified")

    assert is_within_directory(str(workspace), str(workspace / "valid.ts")) is True
    assert is_within_directory(str(workspace), str(secret_file)) is False
    assert sanitize_workspace_path(str(workspace), "../../secrets/passwords.txt") is None

def test_sensitive_file_blocking():
    assert is_sensitive_path(".env") is True
    assert is_sensitive_path(".env.local") is True
    assert is_sensitive_path("id_rsa") is True
    assert is_sensitive_path("jwt_secret.key") is True
    assert is_sensitive_path("credentials.json") is True
    assert is_sensitive_path("app.tsx") is False
    assert is_sensitive_path("main.py") is False

def test_unified_diff_generation():
    orig = "line 1\nline 2\n"
    new = "line 1\nline 2 modified\nline 3\n"
    diff = generate_unified_diff(orig, new, filename="test.ts")
    assert "--- a/test.ts" in diff
    assert "+++ b/test.ts" in diff
    assert "+line 2 modified" in diff
    assert "-line 2" in diff

def test_task_planner_decomposition():
    steps = generate_task_plan("Add user authentication and tests")
    assert len(steps) >= 3
    # Step 2 or 3 should require approval before modifying code
    has_approval_gate = any(s["status"] == "requires_approval" for s in steps)
    assert has_approval_gate is True

@pytest.mark.anyio
async def test_agent_plan_api_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {"goal": "Create SQLite database migration system"}
        response = await client.post("/api/v1/agent/plan", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["goal"] == "Create SQLite database migration system"
        assert len(data["steps"]) >= 3
        assert data["status"] == "running"
