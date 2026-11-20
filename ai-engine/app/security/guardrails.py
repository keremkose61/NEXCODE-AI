import os
import difflib
from typing import Optional, Tuple, List

SENSITIVE_PATTERNS = [
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    ".git",
    "id_rsa",
    "id_ed25519",
    ".pem",
    ".key",
    ".p12",
    ".pfx",
    "credentials.json",
    "secret",
    "secrets",
    "token",
    "password"
]

def is_within_directory(base_dir: str, target_path: str) -> bool:
    """Verifies that target_path resides strictly inside base_dir to prevent directory traversal."""
    abs_base = os.path.abspath(base_dir)
    abs_target = os.path.abspath(target_path)
    prefix = os.path.commonpath([abs_base, abs_target])
    return prefix == abs_base

def sanitize_workspace_path(base_dir: str, relative_or_abs_path: str) -> Optional[str]:
    """Resolves and validates a file path against workspace boundaries. Returns normalized path or None."""
    if not base_dir:
        return None
    abs_base = os.path.abspath(base_dir)
    if os.path.isabs(relative_or_abs_path):
        target = os.path.abspath(relative_or_abs_path)
    else:
        target = os.path.abspath(os.path.join(abs_base, relative_or_abs_path))
    
    if is_within_directory(abs_base, target):
        return target
    return None

def is_sensitive_path(path_or_filename: str) -> bool:
    """Checks whether a file contains credentials, API keys, or private environment settings."""
    basename = os.path.basename(path_or_filename).lower()
    for pattern in SENSITIVE_PATTERNS:
        if pattern in basename:
            return True
    return False

def generate_unified_diff(original_content: str, new_content: str, filename: str = "file") -> str:
    """Generates a standard unified diff string for previewing file edits."""
    orig_lines = original_content.splitlines(keepends=True)
    new_lines = new_content.splitlines(keepends=True)
    diff = difflib.unified_diff(
        orig_lines,
        new_lines,
        fromfile=f"a/{filename}",
        tofile=f"b/{filename}",
        lineterm=""
    )
    return "".join(diff)
