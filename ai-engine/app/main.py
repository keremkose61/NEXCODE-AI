from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .api.routes_health import router as health_router
from .api.routes_models import router as models_router
from .api.routes_chat import router as chat_router
from .config import ENGINE_HOST, ENGINE_PORT

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"[NEXCODE AI Engine] Local Intelligence backend starting on http://{ENGINE_HOST}:{ENGINE_PORT}")
    yield
    print("[NEXCODE AI Engine] Service stopped.")

app = FastAPI(
    title="NEXCODE AI Local Engine",
    description="Stand-alone local AI microservice communicating directly with Ollama. Zero cloud dependencies.",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api/v1")
app.include_router(models_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "app": "NEXCODE AI Engine",
        "tagline": "Code Smarter. Build Beyond.",
        "status": "ready",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=ENGINE_HOST, port=ENGINE_PORT)
