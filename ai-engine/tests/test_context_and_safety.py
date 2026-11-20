from app.context.manager import (
    is_sensitive_file,
    sanitize_content,
    estimate_tokens,
    assemble_prompt
)

def test_sensitive_file_blocking():
    assert is_sensitive_file(".env") is True
    assert is_sensitive_file("config/.env.local") is True
    assert is_sensitive_file("keys/server.key") is True
    assert is_sensitive_file("certs/ca.pem") is True
    assert is_sensitive_file("src/main.ts") is False
    assert is_sensitive_file("app.py") is False

def test_credential_sanitization():
    content = "const apiKey = 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';"
    sanitized = sanitize_content(content)
    assert "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ" not in sanitized
    assert "[REDACTED_SENSITIVE_CREDENTIAL]" in sanitized

def test_token_estimation():
    text = "function calculateSum(a: number, b: number) { return a + b; }"
    tokens = estimate_tokens(text)
    assert tokens > 5
    assert tokens < 30

def test_assemble_prompt_context_filters():
    messages = [{"role": "user", "content": "Explain this file."}]
    context_files = [
        {"path": ".env", "content": "SECRET_KEY=abcdef123456"},
        {"path": "main.py", "content": "print('hello')"}
    ]

    assembled = assemble_prompt(messages, context_files)
    system_msg = assembled[0]["content"]

    # .env should be excluded completely
    assert ".env" not in system_msg
    assert "SECRET_KEY" not in system_msg

    # main.py should be included
    assert "main.py" in system_msg
    assert "print('hello')" in system_msg
