from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from ..models.manager import model_manager
from ..context.manager import assemble_prompt
from ..models.schemas import ChatCompletionRequest, ChatCompletionResponse

router = APIRouter(prefix="/chat", tags=["Chat & Completions"])

@router.post("/completions", response_model=ChatCompletionResponse)
async def create_chat_completion(req: ChatCompletionRequest):
    # Assemble messages with workspace context files and safety sanitization
    raw_messages = [{"role": m.role, "content": m.content} for m in req.messages]
    assembled = assemble_prompt(raw_messages, req.context_files)

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

    raw_messages = [{"role": m.role, "content": m.content} for m in req.messages]
    assembled = assemble_prompt(raw_messages, req.context_files)

    generator = model_manager.stream_chat(
        model=req.model,
        messages=assembled,
        temperature=req.temperature
    )

    return StreamingResponse(generator, media_type="application/x-ndjson")
