from fastapi import APIRouter, HTTPException
from typing import List
from ..models.manager import model_manager
from ..models.schemas import ModelInfo, ModelPullRequest

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("", response_model=List[ModelInfo])
async def list_models():
    return await model_manager.list_available_models()

@router.post("/pull")
async def pull_model(req: ModelPullRequest):
    status = await model_manager.check_status()
    if not status["online"]:
        raise HTTPException(
            status_code=503,
            detail=f"Local Ollama engine is not running at {model_manager.ollama_url}. Please start Ollama before downloading models."
        )

    # Note: Downloading requires internet connection; informative response
    return {
        "status": "pull_initiated",
        "model": req.name,
        "message": f"Downloading {req.name} via local Ollama engine. Internet connection is required during download."
    }
