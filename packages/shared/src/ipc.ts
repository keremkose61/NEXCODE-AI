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

  // Database & State
  DB_GET_SETTINGS: 'db:get-settings',
  DB_SAVE_SETTINGS: 'db:save-settings',
  DB_GET_RECENT_PROJECTS: 'db:get-recent-projects',
  DB_ADD_RECENT_PROJECT: 'db:add-recent-project'
} as const;

export type IPCChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];
