import httpx
import json
import time
from typing import List, AsyncGenerator, Dict, Any, Optional
from ..config import OLLAMA_BASE_URL
from .schemas import ModelInfo, ChatCompletionResponse, ChatMessage, ChatUsage

CATALOG_MODELS = [
    ModelInfo(
        name="qwen2.5-coder:7b",
        display_name="Qwen 2.5 Coder 7B (Default)",
        size="4.7 GB",
        parameter_size="7B",
        family="qwen2",
        description="Exceptional general coding and bug fixing across 90+ programming languages.",
        recommended_hardware="8GB+ RAM / CPU or 6GB VRAM"
    ),
    ModelInfo(
        name="deepseek-coder:6.7b",
        display_name="DeepSeek Coder 6.7B",
        size="3.8 GB",
        parameter_size="6.7B",
        family="deepseek",
        description="Deep project context comprehension and code refactoring engine.",
        recommended_hardware="8GB+ RAM / CPU"
    ),
    ModelInfo(
        name="llama3.2:3b",
        display_name="Llama 3.2 3B (Fast)",
        size="2.0 GB",
        parameter_size="3B",
        family="llama",
        description="Ultra-low memory footprint, lightning-fast responses on standard CPUs.",
        recommended_hardware="4GB+ RAM / CPU"
    )
]

class ModelManager:
    def __init__(self, ollama_url: str = OLLAMA_BASE_URL):
        self.ollama_url = ollama_url.rstrip("/")

    async def check_status(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                res = await client.get(f"{self.ollama_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = data.get("models", [])
                    return {
                        "online": True,
                        "endpoint": self.ollama_url,
                        "local_models_count": len(models),
                        "models": [m.get("name") for m in models]
                    }
        except Exception:
            pass

        return {
            "online": False,
            "endpoint": self.ollama_url,
            "local_models_count": 0,
            "models": []
        }

    async def list_available_models(self) -> List[ModelInfo]:
        status = await self.check_status()
        local_names = set(status.get("models", []))

        result = []
        for cat in CATALOG_MODELS:
            is_local = cat.name in local_names
            result.append(
                ModelInfo(
                    name=cat.name,
                    display_name=cat.display_name,
                    size=cat.size,
                    is_available_locally=is_local,
                    parameter_size=cat.parameter_size,
                    family=cat.family,
                    description=cat.description,
                    recommended_hardware=cat.recommended_hardware
                )
            )

        # Append any additional models found in Ollama that are not in default catalog
        for name in local_names:
            if not any(c.name == name for c in CATALOG_MODELS):
                result.append(
                    ModelInfo(
                        name=name,
                        display_name=f"{name} (Installed)",
                        is_available_locally=True,
                        description="Locally installed Ollama model."
                    )
                )

        return result

    async def generate_chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.2
    ) -> ChatCompletionResponse:
        status = await self.check_status()
        if not status["online"]:
            # Offline informative response
            return ChatCompletionResponse(
                id=f"offline-{int(time.time())}",
                model=model,
                message=ChatMessage(
                    role="assistant",
                    content=(
                        "⚠️ **Local AI Engine Offline**\n\n"
                        f"Ollama is not running at `{self.ollama_url}`.\n"
                        "To use this local AI model:\n"
                        f"1. Open PowerShell and run: `ollama run {model}`\n"
                        "2. Ensure Ollama service is active on localhost:11434."
                    ),
                    model=model,
                    timestamp=time.time()
                ),
                created_at=time.time(),
                usage=ChatUsage(prompt_tokens=0, completion_tokens=0, total_tokens=0)
            )

        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature}
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(f"{self.ollama_url}/api/chat", json=payload)
            if res.status_code != 200:
                raise Exception(f"Ollama returned HTTP {res.status_code}: {res.text}")

            data = res.json()
            message_data = data.get("message", {})
            prompt_tokens = data.get("prompt_eval_count", 0)
            eval_tokens = data.get("eval_count", 0)

            return ChatCompletionResponse(
                id=f"chat-{int(time.time())}",
                model=model,
                message=ChatMessage(
                    role="assistant",
                    content=message_data.get("content", ""),
                    model=model,
                    timestamp=time.time()
                ),
                created_at=time.time(),
                usage=ChatUsage(
                    prompt_tokens=prompt_tokens,
                    completion_tokens=eval_tokens,
                    total_tokens=prompt_tokens + eval_tokens
                )
            )

    async def stream_chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.2
    ) -> AsyncGenerator[str, None]:
        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            "options": {"temperature": temperature}
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", f"{self.ollama_url}/api/chat", json=payload) as response:
                if response.status_code != 200:
                    yield json.dumps({"error": f"Ollama HTTP {response.status_code}"}) + "\n"
                    return

                async for line in response.aiter_lines():
                    if line:
                        try:
                            parsed = json.loads(line)
                            chunk_msg = parsed.get("message", {}).get("content", "")
                            yield json.dumps({"chunk": chunk_msg, "done": parsed.get("done", False)}) + "\n"
                        except Exception:
                            continue

model_manager = ModelManager()
