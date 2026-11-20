from fastapi import APIRouter
from ..models.manager import model_manager
from ..hardware.detector import detect_hardware
from ..models.schemas import HardwareProfile

router = APIRouter(tags=["Health & Hardware"])

@router.get("/health")
async def get_health():
    ollama_status = await model_manager.check_status()
    return {
        "status": "online",
        "service": "NEXCODE AI Engine",
        "version": "0.1.0",
        "ollama": ollama_status
    }

@router.get("/hardware", response_model=HardwareProfile)
async def get_hardware_profile():
    return detect_hardware()
