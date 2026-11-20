export const LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  h: 'c',
  hpp: 'cpp',
  cs: 'csharp',
  php: 'php',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  kt: 'kotlin',
  kts: 'kotlin',
  sql: 'sql',
  rs: 'rust',
  go: 'go',
  json: 'json',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  sh: 'shell',
  bash: 'shell',
  ps1: 'powershell',
  bat: 'bat',
  cmd: 'bat'
};

export function detectLanguageFromPath(filePath: string): string {
  const parts = filePath.split('.');
  if (parts.length > 1) {
    const ext = parts.pop()?.toLowerCase() || '';
    if (ext in LANGUAGE_MAP) {
      return LANGUAGE_MAP[ext];
    }
  }
  return 'plaintext';
}

export const NEXCODE_DARK_THEME = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: '', foreground: 'd4d4d8', background: '0d1117' },
    { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'a78bfa', fontStyle: 'bold' },
    { token: 'string', foreground: '34d399' },
    { token: 'number', foreground: 'f59e0b' },
    { token: 'type', foreground: '38bdf8' },
    { token: 'function', foreground: '60a5fa' },
    { token: 'variable', foreground: 'e4e4e7' },
    { token: 'operator', foreground: 'f472b6' }
  ],
  colors: {
    'editor.background': '#090d16',
    'editor.foreground': '#e2e8f0',
    'editorLineNumber.foreground': '#334155',
    'editorLineNumber.activeForeground': '#818cf8',
    'editor.lineHighlightBackground': '#131b2e',
    'editor.selectionBackground': '#1e293b',
    'editorCursor.foreground': '#6366f1',
    'editorIndentGuide.background': '#1e293b',
    'editorIndentGuide.activeBackground': '#334155'
  }
};
