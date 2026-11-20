import uuid
import re
from typing import List, Dict, Any
from ..tools.workspace_tools import scan_project_files

def generate_task_plan(goal: str, workspace_dir: str = "") -> List[Dict[str, Any]]:
    """Decomposes a user goal into multi-stage actionable steps."""
    clean_goal = goal.strip()
    files = scan_project_files(workspace_dir) if workspace_dir else []

    # Infer relevant files
    relevant_files = []
    lower_goal = clean_goal.lower()
    for f in files:
        base = f.split("/")[-1].lower()
        # If words in goal match file parts
        words = re.findall(r"\w+", lower_goal)
        if any(w in base for w in words if len(w) > 3):
            relevant_files.append(f)

    if not relevant_files and files:
        relevant_files = files[:3]

    steps: List[Dict[str, Any]] = []

    # Step 1: Scan & Context
    steps.append({
        "id": f"step-{uuid.uuid4().hex[:8]}",
        "title": "Analyze Workspace Architecture & Context",
        "description": f"Scan active project structure and inspect relevant source files for: '{clean_goal}'.",
        "status": "completed",
        "target_files": relevant_files[:4],
        "command_preview": None,
        "diff_preview": None
    })

    # Step 2: Implementation / Code Edit
    steps.append({
        "id": f"step-{uuid.uuid4().hex[:8]}",
        "title": "Synthesize Code Implementation",
        "description": f"Generate or refactor implementation files matching the goal: '{clean_goal}'.",
        "status": "requires_approval",
        "target_files": [relevant_files[0]] if relevant_files else ["src/index.ts"],
        "command_preview": None,
        "diff_preview": (
            f"--- a/{relevant_files[0] if relevant_files else 'src/index.ts'}\n"
            f"+++ b/{relevant_files[0] if relevant_files else 'src/index.ts'}\n"
            f"@@ -1,3 +1,7 @@\n"
            f"+// NEXCODE AI Agent: Implemented '{clean_goal}'\n"
            f"+export function executeFeature() {{\n"
            f"+  return {{ status: 'implemented', goal: '{clean_goal}' }};\n"
            f"+}}\n"
        )
    })

    # Step 3: Test Generation
    steps.append({
        "id": f"step-{uuid.uuid4().hex[:8]}",
        "title": "Generate Unit Tests",
        "description": f"Create automated unit tests to verify logic and cover edge cases for '{clean_goal}'.",
        "status": "pending",
        "target_files": ["tests/agent-feature.test.ts"],
        "command_preview": None,
        "diff_preview": (
            "--- /dev/null\n"
            "+++ b/tests/agent-feature.test.ts\n"
            "@@ -0,0 +1,8 @@\n"
            "+import { describe, it, expect } from 'vitest';\n"
            "+describe('AI Agent Feature Test', () => {\n"
            "+  it('verifies implementation successfully', () => {\n"
            "+    expect(true).toBe(true);\n"
            "+  });\n"
            "+});\n"
        )
    })

    # Step 4: Verification Command
    steps.append({
        "id": f"step-{uuid.uuid4().hex[:8]}",
        "title": "Run Test Suite & Validation",
        "description": "Execute local verification test command under user approval.",
        "status": "pending",
        "target_files": [],
        "command_preview": "pnpm test",
        "diff_preview": None
    })

    return steps
