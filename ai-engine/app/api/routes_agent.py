import uuid
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from ..agents.task_planner import generate_task_plan
from ..tools.workspace_tools import scan_project_files, create_diff_proposal, read_workspace_file

router = APIRouter(prefix="/agent", tags=["Autonomous AI Agent"])

class AgentPlanRequest(BaseModel):
    goal: str
    workspace_dir: Optional[str] = ""

class AgentStepModel(BaseModel):
    id: str
    title: str
    description: str
    status: str
    target_files: Optional[List[str]] = None
    command_preview: Optional[str] = None
    diff_preview: Optional[str] = None

class AgentPlanResponse(BaseModel):
    id: str
    goal: str
    steps: List[AgentStepModel]
    status: str
    created_at: float

class ProposeEditRequest(BaseModel):
    workspace_dir: str
    file_path: str
    new_content: str

@router.post("/plan", response_model=AgentPlanResponse)
async def create_agent_plan(req: AgentPlanRequest):
    if not req.goal.strip():
        raise HTTPException(status_code=400, detail="Goal cannot be empty")

    steps = generate_task_plan(req.goal, req.workspace_dir or "")
    task_id = f"task-{uuid.uuid4().hex[:8]}"

    return AgentPlanResponse(
        id=task_id,
        goal=req.goal,
        steps=steps,
        status="running",
        created_at=time.time()
    )

@router.post("/scan")
async def scan_workspace(workspace_dir: str):
    files = scan_project_files(workspace_dir)
    return {"workspace_dir": workspace_dir, "files": files, "count": len(files)}

@router.post("/propose-edit")
async def propose_edit(req: ProposeEditRequest):
    proposal = create_diff_proposal(req.workspace_dir, req.file_path, req.new_content)
    return proposal
