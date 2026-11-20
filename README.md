# NEXCODE AI

> **Code Smarter. Build Beyond.**

NEXCODE AI is a next-generation professional desktop IDE engineered for Windows 10/11 64-bit, built with an uncompromising focus on developer velocity, privacy, and full local AI integration.

Unlike traditional cloud-dependent AI editors, NEXCODE AI runs its artificial intelligence infrastructure 100% locally on your machine via Ollama and open-weight models, ensuring zero data leakage, complete offline capability, and enterprise-grade code privacy.

---

## Architecture Overview

```
NEXCODE-AI/
├── apps/
│   └── desktop/               # Electron desktop shell + React renderer
│       └── src/
│           ├── main/          # Secure Electron main process (IPC, FS, Process managers)
│           ├── preload/       # Sandboxed contextBridge API exposer
│           └── renderer/      # Modern React + Vite + Monaco + Tailwind UI
├── packages/
│   ├── editor/                # Monaco Editor integration, themes & syntax
│   ├── terminal/              # Multi-session PowerShell & CMD terminal manager
│   ├── file-explorer/         # High-performance virtualized file tree & operations
│   ├── git-manager/           # Git status, branches, staging, diffing & commit engine
│   ├── shared/                # Universal TypeScript types, contracts & IPC protocols
│   └── ui/                    # Reusable dark-mode UI components & design system
├── ai-engine/                 # Python FastAPI local intelligence engine
│   ├── app/                   # Agents, Context analyzer, RAG & Ollama orchestrator
│   └── tests/                 # Unit & security tests for local AI tools
├── native/
│   └── rust-core/             # High-speed native file indexing & AST processing
├── database/
│   └── migrations/            # SQLite schemas for settings, chat history & project states
├── resources/                 # Icons, branding assets, custom Monaco themes
└── docs/                      # Architectural specifications & security guidelines
```

---

## Key Pillars

1. **Local-First AI Engine**: Powered by Ollama and optimized open-weight LLMs (DeepSeek-Coder, Qwen2.5-Coder, Llama 3) with dynamic CPU/GPU hardware detection.
2. **True Electron Security**: Hardened architecture with `contextIsolation: true`, `nodeIntegration: false`, sandboxed execution, and explicit user-permission gated file/terminal actions.
3. **Monaco Editor Powerhouse**: Multi-tab code editor with custom themes, minimap, IntelliSense, breadcrumb navigation, and advanced diff views.
4. **Integrated Developer Suite**: Multi-tab PowerShell/CMD terminal, Git integration, SQLite-backed state persistence, and AI context indexer.

---

## Getting Started

### Prerequisites
- Node.js >= 20.x
- pnpm >= 9.x
- Git >= 2.40
- Python >= 3.10 (optional for local AI backend)
- Ollama (for local LLM inference)

### Installation
```bash
# Install all dependencies across workspace
pnpm install

# Start desktop development environment
pnpm dev

# Run test suite
pnpm test

# Build production Windows binaries
pnpm build
```

---

## License
Proprietary & Confidential - NEXCODE AI Team.
