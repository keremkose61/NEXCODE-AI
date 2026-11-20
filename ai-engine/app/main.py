"""
NEXCODE AI - Local AI Backend Engine
Standalone FastAPI microservice communicating locally with Ollama (http://localhost:11434).
Zero external API dependencies. 100% offline-ready.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx

app = FastAPI(
    title="NEXCODE AI Engine",
    description="Local Ollama AI Orchestrator for NEXCODE IDE",
    version="0.1.0"
)

OLLAMA_ENDPOINT = "http://localhost:11434"

class HealthResponse(BaseModel):
    status: str
    engine: str
    ollama_endpoint: str
    ollama_online: bool

@app.get("/health", response_model=HealthResponse)
async def health_check():
    ollama_online = False
    try:
        async with httpx.AsyncClient(timeout=1.5) as client:
            resp = await client.get(f"{OLLAMA_ENDPOINT}/api/tags")
            ollama_online = resp.status_code == 200
    except Exception:
        ollama_online = False

    return HealthResponse(
        status="active",
        engine="NEXCODE Local AI",
        ollama_endpoint=OLLAMA_ENDPOINT,
        ollama_online=ollama_online
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
