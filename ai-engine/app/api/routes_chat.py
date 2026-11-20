from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from ..models.manager import model_manager
from ..context.manager import assemble_prompt
from ..prompts.templates import get_system_prompt_for_mode
from ..models.schemas import ChatCompletionRequest, ChatCompletionResponse

router = APIRouter(prefix="/chat", tags=["Chat & Completions"])

def prepare_messages_with_mode(req: ChatCompletionRequest) -> list:
    raw_messages = [{"role": m.role, "content": m.content} for m in req.messages]
    
    # Check if a system message is already provided
    has_system = any(m["role"] == "system" for m in raw_messages)
    if not has_system:
        mode = req.mode or "chat"
        sys_prompt = get_system_prompt_for_mode(mode, req.instruction)
        raw_messages.insert(0, {"role": "system", "content": sys_prompt})
        
    return assemble_prompt(raw_messages, req.context_files)

@router.post("/completions", response_model=ChatCompletionResponse)
async def create_chat_completion(req: ChatCompletionRequest):
    assembled = prepare_messages_with_mode(req)

    try:
        response = await model_manager.generate_chat(
            model=req.model,
            messages=assembled,
            temperature=req.temperature
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stream")
async def create_chat_stream(req: ChatCompletionRequest):
    status = await model_manager.check_status()
    if not status["online"]:
        raise HTTPException(
            status_code=503,
            detail="Local Ollama instance is not running on localhost:11434"
        )

    assembled = prepare_messages_with_mode(req)

    generator = model_manager.stream_chat(
        model=req.model,
        messages=assembled,
        temperature=req.temperature
    )

    return StreamingResponse(generator, media_type="application/x-ndjson")
