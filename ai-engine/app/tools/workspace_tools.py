import os
from typing import List, Dict, Optional, Any
from ..security.guardrails import sanitize_workspace_path, is_sensitive_path, generate_unified_diff

IGNORE_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "out",
    "build",
    "target",
    ".next",
    ".nuxt",
    ".cache",
    "__pycache__",
    ".pytest_cache",
    ".venv",
    "venv"
}

def scan_project_files(workspace_dir: str, max_files: int = 150) -> List[str]:
    """Recursively scans workspace files, ignoring standard build artifacts and sensitive files."""
    if not os.path.isdir(workspace_dir):
        return []

    collected: List[str] = []
    for root, dirs, files in os.walk(workspace_dir):
        # Exclude ignored directories in-place
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith(".")]

        for f in files:
            if is_sensitive_path(f):
                continue
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, workspace_dir).replace("\\", "/")
            collected.append(rel_path)
            if len(collected) >= max_files:
                return collected

    return collected

def read_workspace_file(workspace_dir: str, rel_path: str) -> Optional[str]:
    """Reads a file if within the workspace boundary and not sensitive."""
    safe_path = sanitize_workspace_path(workspace_dir, rel_path)
    if not safe_path or not os.path.isfile(safe_path):
        return None
    if is_sensitive_path(safe_path):
        return None

    try:
        with open(safe_path, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    except Exception:
        return None

def create_diff_proposal(workspace_dir: str, rel_path: str, new_content: str) -> Dict[str, Any]:
    """Generates a diff preview proposal for an existing or new file."""
    safe_path = sanitize_workspace_path(workspace_dir, rel_path)
    is_new = False
    original_content = ""

    if safe_path and os.path.isfile(safe_path):
        original_content = read_workspace_file(workspace_dir, rel_path) or ""
    else:
        is_new = True

    diff = generate_unified_diff(original_content, new_content, filename=rel_path)

    return {
        "file_path": rel_path,
        "is_new_file": is_new,
        "diff": diff,
        "new_content": new_content,
        "original_content": original_content,
        "requires_user_approval": True
    }
