import os

OLLAMA_BASE_URL = os.environ.get("NEXCODE_OLLAMA_URL", "http://localhost:11434")
ENGINE_PORT = int(os.environ.get("NEXCODE_ENGINE_PORT", 8765))
ENGINE_HOST = os.environ.get("NEXCODE_ENGINE_HOST", "127.0.0.1")
DEBUG = os.environ.get("NEXCODE_DEBUG", "false").lower() == "true"
