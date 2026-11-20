# NEXCODE AI

> **Code Smarter. Build Beyond.**

NEXCODE AI is a next-generation professional desktop IDE engineered for Windows 10/11 64-bit, built with an uncompromising focus on developer velocity, privacy, and 100% local AI intelligence.

Unlike traditional cloud-dependent AI editors, NEXCODE AI runs its artificial intelligence infrastructure strictly locally on your machine via Ollama and open-weight LLMs, ensuring zero cloud telemetry, complete offline capability, and enterprise-grade code privacy.

---

## Key Features

- **100% Local AI Pipeline**: Communicate directly with local Ollama (`localhost:11434`) and Python FastAPI engine (`127.0.0.1:8765`). Zero external API keys needed.
- **12 AI Assistant Modes**:
  - `Chat`: General architecture and coding assistant.
  - `Explain`: Step-by-step logic breakdown with Big-O complexity analysis.
  - `Generate`: Production-ready code generation with TypeScript types and tests.
  - `Fix Bugs`: Logic flaw detection and corrected code.
  - `Optimize`: Algorithmic efficiency and memory allocations.
  - `Convert`: Idiomatic language-to-language translation.
  - `Error Analysis`: Runtime stack trace and error diagnostics.
  - `Documentation`: JSDoc, docstrings, and Rustdoc generation.
  - `Unit Tests`: High-coverage unit test suites.
  - `Analyze File`: SOLID principles and maintainability assessment.
  - `Analyze Selection`: Focused inspection of highlighted code.
  - `Project Context`: Multi-file codebase synthesis.
- **Inline AI (`Ctrl+K`)**: Floating bar above the Monaco Editor with real-time diff preview and *Accept & Replace / Discard* controls.
- **Autonomous AI Agent**:
  - Multi-stage goal planner.
  - Strict human-in-the-loop approval gates.
  - Visual unified diff preview before applying any file change.
  - One-click rollback (*Undo*) for every approved modification.
- **Monaco Code Editor**:
  - Custom dark themes: *NEXCODE Dark*, *NEXCODE Black (OLED)*, *NEXCODE Nord*.
  - Gutter breakpoints with red glyph icons.
  - Multi-tab management, breadcrumbs, code minimap, bracket pair colorization.
- **Integrated Terminal**: Multi-tab live Windows PowerShell and Command Prompt (CMD) sessions.
- **Interactive Debugger**: Breakpoint management, call stack inspector, variable scope inspector, and live REPL debug console.
- **Git & GitHub Integration**:
  - Repository status, staged/unstaged changes, and branch management.
  - Monaco visual diff viewer comparing working copy to HEAD.
  - Safety gate requiring explicit confirmation before pushing to remote repositories.
- **Hardened Electron Security**:
  - `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
  - Content Security Policy (CSP).
  - Directory traversal prevention and sensitive file filtering (`.env`, `.key`, `credentials.json`).

---

## Architecture Overview

```
NEXCODE-AI/
├── apps/
│   └── desktop/               # Electron desktop shell + React renderer
│       └── src/
│           ├── main/          # Process managers, FS guards, Terminal & Git services
│           ├── preload/       # Sandboxed contextBridge API exposer
│           └── renderer/      # React 18 + Vite + Monaco + Zustand + Tailwind UI
├── packages/
│   ├── editor/                # Monaco themes, language snippets, extensions
│   ├── terminal/              # Terminal tab factory & process communication
│   ├── file-explorer/         # High-performance virtualized file tree
│   ├── git-manager/           # Git status & branch models
│   ├── shared/                # Universal TypeScript types, contracts & IPC channels
│   └── ui/                    # Reusable dark-mode UI components & design system
├── ai-engine/                 # Python 3 FastAPI local intelligence engine
│   ├── app/                   # Prompts, Task Planner, Context & Guardrails
│   └── tests/                 # 17 Pytest security and endpoint tests
├── database/
│   ├── migrations/            # SQLite schemas for settings, sessions & audit logs
│   └── migrate.ts             # Migration loader & schema validation
└── tests/                     # 39 Vitest integration and unit tests
```

---

## Development & Verification

### Prerequisites
- Node.js 18+ (tested with Node v26)
- pnpm 9+
- Python 3.10+ (tested with Python 3.15)
- Ollama (optional, for local LLM inference)

### Run Tests
```bash
# Run Vitest test suite (TypeScript & React stores)
pnpm test

# Run Pytest suite (Python AI Engine & Guardrails)
cd ai-engine && pytest tests/
```

### Build Desktop Application
```bash
pnpm --filter @nexcode/desktop build
```

### Launch Desktop IDE
```bash
pnpm --filter @nexcode/desktop start
```

---

## Keyboard Shortcuts

See [KEYBOARD_SHORTCUTS.md](file:///docs/KEYBOARD_SHORTCUTS.md) for a comprehensive list of shortcuts.
