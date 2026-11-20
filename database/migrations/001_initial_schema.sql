-- ===================================================
-- NEXCODE AI – Database Initial Migration (001)
-- Engine: SQLite
-- ===================================================

-- IDE Settings & User Preferences
CREATE TABLE IF NOT EXISTS ide_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recent Workspaces & Projects History
CREATE TABLE IF NOT EXISTS recent_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT UNIQUE NOT NULL,
    last_opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN DEFAULT 0
);

-- AI Chat Sessions
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    model TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Chat Messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT CHECK(role IN ('user', 'assistant', 'system')) NOT NULL,
    content TEXT NOT NULL,
    tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE
);

-- AI Agent Tasks
CREATE TABLE IF NOT EXISTS ai_agent_tasks (
    id TEXT PRIMARY KEY,
    goal TEXT NOT NULL,
    status TEXT CHECK(status IN ('planning', 'running', 'paused', 'completed', 'cancelled')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- AI Agent Audit Logs (Safety & Approvals)
CREATE TABLE IF NOT EXISTS ai_agent_audit_logs (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    target_path TEXT,
    command TEXT,
    diff TEXT,
    approved_by_user BOOLEAN DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(task_id) REFERENCES ai_agent_tasks(id) ON DELETE CASCADE
);
