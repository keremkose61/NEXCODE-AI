from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    model: Optional[str] = None
    timestamp: Optional[float] = None

class ChatCompletionRequest(BaseModel):
    model: str = Field(default="qwen2.5-coder:7b", description="Local model name in Ollama")
    messages: List[ChatMessage]
    mode: Optional[str] = Field(default="chat", description="AI Assistant mode (1 of 12 supported modes)")
    instruction: Optional[str] = Field(default=None, description="Optional extra instruction or directive")
    stream: bool = False
    temperature: float = 0.2
    context_files: Optional[List[Dict[str, str]]] = Field(
        default=None,
        description="Optional list of open file paths and contents included in context"
    )
    max_tokens: Optional[int] = 4096

class ChatUsage(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

class ChatCompletionResponse(BaseModel):
    id: str
    model: str
    message: ChatMessage
    created_at: float
    usage: ChatUsage

class ModelInfo(BaseModel):
    name: str
    display_name: str
    size: Optional[str] = None
    is_available_locally: bool = False
    parameter_size: Optional[str] = None
    family: Optional[str] = None
    description: Optional[str] = None
    recommended_hardware: Optional[str] = None

class HardwareProfile(BaseModel):
    cpu_model: str
    cpu_cores: int
    ram_gb: int
    is_amd: bool
    gpu_detected: Optional[str] = None
    acceleration_mode: Literal["ROCm", "CUDA", "CPU"]
    recommended_model: str
    notes: str

class ModelPullRequest(BaseModel):
    name: str
