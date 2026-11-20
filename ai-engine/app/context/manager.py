import re
from typing import List, Dict, Optional

SENSITIVE_PATTERNS = [
    re.compile(r"api[_-]?key\s*[:=]\s*['\"][^'\"]+['\"]", re.IGNORECASE),
    re.compile(r"secret[_-]?key\s*[:=]\s*['\"][^'\"]+['\"]", re.IGNORECASE),
    re.compile(r"bearer\s+[a-zA-Z0-9_\-\.]{20,}", re.IGNORECASE),
    re.compile(r"ghp_[a-zA-Z0-9]{36}", re.IGNORECASE),
    re.compile(r"-----BEGIN (RSA|OPENSSH|PRIVATE) KEY-----")
]

BLOCKED_FILENAMES = {
    ".env", ".env.local", ".env.production", "id_rsa", "id_ecdsa", "credentials.json"
}

def is_sensitive_file(filename: str) -> bool:
    base = filename.split("\\")[-1].split("/")[-1].lower()
    return base in BLOCKED_FILENAMES or base.endswith(".pem") or base.endswith(".key")

def sanitize_content(text: str) -> str:
    sanitized = text
    for pattern in SENSITIVE_PATTERNS:
        sanitized = pattern.sub("[REDACTED_SENSITIVE_CREDENTIAL]", sanitized)
    return sanitized

def estimate_tokens(text: str) -> int:
    """Rough token estimation (approx 3.8 - 4 chars per token)"""
    return max(1, len(text) // 4)

def assemble_prompt(
    messages: List[Dict[str, str]],
    context_files: Optional[List[Dict[str, str]]] = None,
    max_context_tokens: int = 6000
) -> List[Dict[str, str]]:
    assembled = []

    # System instruction
    system_prompt = (
        "You are NEXCODE AI, a state-of-the-art coding assistant running 100% locally on Windows.\n"
        "Your code answers are precise, robust, type-safe, and secure.\n"
        "Only analyze the provided workspace context and code."
    )

    if context_files:
        files_summary = "\n\n### ACTIVE WORKSPACE CONTEXT FILES:\n"
        for f in context_files:
            fname = f.get("path", "file")
            if is_sensitive_file(fname):
                continue
            raw_content = f.get("content", "")
            safe_content = sanitize_content(raw_content)
            # Truncate large files to prevent context overflow
            if len(safe_content) > 12000:
                safe_content = safe_content[:12000] + "\n... [Remaining content truncated for local token budget]"
            files_summary += f"\n--- File: {fname} ---\n{safe_content}\n"

        system_prompt += files_summary

    assembled.append({"role": "system", "content": system_prompt})

    for msg in messages:
        assembled.append({
            "role": msg["role"],
            "content": sanitize_content(msg["content"])
        })

    return assembled
