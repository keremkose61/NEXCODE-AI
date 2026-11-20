export const IPC_CHANNELS = {
  // Window controls
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:is-maximized',

  // App & Hardware Info
  APP_GET_INFO: 'app:get-info',
  APP_GET_HARDWARE_INFO: 'app:get-hardware-info',

  // File System
  FS_OPEN_FOLDER_DIALOG: 'fs:open-folder-dialog',
  FS_READ_DIR: 'fs:read-dir',
  FS_READ_FILE: 'fs:read-file',
  FS_WRITE_FILE: 'fs:write-file',
  FS_CREATE_FILE: 'fs:create-file',
  FS_CREATE_DIR: 'fs:create-dir',
  FS_DELETE_ITEM: 'fs:delete-item',
  FS_RENAME_ITEM: 'fs:rename-item',
  FS_WATCH_START: 'fs:watch-start',
  FS_WATCH_STOP: 'fs:watch-stop',
  FS_FILE_CHANGED: 'fs:file-changed',

  // Terminal
  TERMINAL_SPAWN: 'terminal:spawn',
  TERMINAL_INPUT: 'terminal:input',
  TERMINAL_OUTPUT: 'terminal:output',
  TERMINAL_RESIZE: 'terminal:resize',
  TERMINAL_CLOSE: 'terminal:close',

  // Local AI & Ollama
  AI_CHECK_STATUS: 'ai:check-status',
  AI_LIST_MODELS: 'ai:list-models',
  AI_SEND_CHAT: 'ai:send-chat',
  AI_STREAM_CHUNK: 'ai:stream-chunk',
  AI_PULL_MODEL: 'ai:pull-model',
  AI_PULL_PROGRESS: 'ai:pull-progress',

  // Autonomous Agent
  AGENT_PLAN_TASK: 'agent:plan-task',
  AGENT_PROPOSE_EDIT: 'agent:propose-edit',
  AGENT_APPROVE_ACTION: 'agent:approve-action',
  AGENT_REVERT_ACTION: 'agent:revert-action',
  AGENT_GET_AUDIT_LOGS: 'agent:get-audit-logs',

  // Database & State
  DB_GET_SETTINGS: 'db:get-settings',
  DB_SAVE_SETTINGS: 'db:save-settings',
  DB_GET_RECENT_PROJECTS: 'db:get-recent-projects',
  DB_ADD_RECENT_PROJECT: 'db:add-recent-project',
  DB_GET_CHAT_SESSIONS: 'db:get-chat-sessions',
  DB_CREATE_CHAT_SESSION: 'db:create-chat-session',
  DB_DELETE_CHAT_SESSION: 'db:delete-chat-session',
  DB_GET_CHAT_MESSAGES: 'db:get-chat-messages',
  DB_SAVE_CHAT_MESSAGE: 'db:save-chat-message',
  DB_CLEAR_CHAT_SESSION: 'db:clear-chat-session'
} as const;

export type IPCChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];
