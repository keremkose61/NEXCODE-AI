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

export const NOVA_DARK_THEME = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: '', foreground: 'e2e8f0', background: '0b0f19' },
    { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
    { token: 'string', foreground: '34d399' },
    { token: 'number', foreground: 'fbbf24' },
    { token: 'type', foreground: '22d3ee' },
    { token: 'function', foreground: '60a5fa' },
    { token: 'variable', foreground: 'f1f5f9' },
    { token: 'operator', foreground: 'f472b6' }
  ],
  colors: {
    'editor.background': '#0b0f19',
    'editor.foreground': '#e2e8f0',
    'editorLineNumber.foreground': '#334155',
    'editorLineNumber.activeForeground': '#22d3ee',
    'editor.lineHighlightBackground': '#131a2b',
    'editor.selectionBackground': '#2a3552',
    'editorCursor.foreground': '#a855f7',
    'editorIndentGuide.background': '#1e293b',
    'editorIndentGuide.activeBackground': '#38bdf8'
  }
};

export const NOVA_LIGHT_THEME = {
  base: 'vs' as const,
  inherit: true,
  rules: [
    { token: '', foreground: '0f172a', background: 'f8fafc' },
    { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
    { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
    { token: 'string', foreground: '059669' },
    { token: 'number', foreground: 'd97706' },
    { token: 'type', foreground: '0891b2' },
    { token: 'function', foreground: '2563eb' },
    { token: 'variable', foreground: '1e293b' },
    { token: 'operator', foreground: 'db2777' }
  ],
  colors: {
    'editor.background': '#f8fafc',
    'editor.foreground': '#0f172a',
    'editorLineNumber.foreground': '#94a3b8',
    'editorLineNumber.activeForeground': '#7c3aed',
    'editor.lineHighlightBackground': '#f1f5f9',
    'editor.selectionBackground': '#cbd5e1',
    'editorCursor.foreground': '#7c3aed',
    'editorIndentGuide.background': '#e2e8f0',
    'editorIndentGuide.activeBackground': '#94a3b8'
  }
};

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

export const NEXCODE_BLACK_THEME = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: '', foreground: 'e4e4e7', background: '000000' },
    { token: 'comment', foreground: '71717a', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
    { token: 'string', foreground: '4ade80' },
    { token: 'number', foreground: 'fbbf24' },
    { token: 'type', foreground: '67e8f9' },
    { token: 'function', foreground: '93c5fd' },
    { token: 'variable', foreground: 'f4f4f5' }
  ],
  colors: {
    'editor.background': '#000000',
    'editor.foreground': '#f4f4f5',
    'editorLineNumber.foreground': '#27272a',
    'editorLineNumber.activeForeground': '#a855f7',
    'editor.lineHighlightBackground': '#09090b',
    'editor.selectionBackground': '#27272a',
    'editorCursor.foreground': '#a855f7'
  }
};

export const NEXCODE_NORD_THEME = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: '', foreground: 'd8dee9', background: '2e3440' },
    { token: 'comment', foreground: '616e88', fontStyle: 'italic' },
    { token: 'keyword', foreground: '81a1c1', fontStyle: 'bold' },
    { token: 'string', foreground: 'a3be8c' },
    { token: 'number', foreground: 'b48ead' },
    { token: 'type', foreground: '8fbcbb' },
    { token: 'function', foreground: '88c0d0' }
  ],
  colors: {
    'editor.background': '#1a1f29',
    'editor.foreground': '#eceff4',
    'editorLineNumber.foreground': '#434c5e',
    'editorLineNumber.activeForeground': '#88c0d0',
    'editor.lineHighlightBackground': '#242b38',
    'editor.selectionBackground': '#3b4252',
    'editorCursor.foreground': '#88c0d0'
  }
};

export const COMMON_SNIPPETS: Record<string, { label: string; snippet: string; doc: string }[]> = {
  typescript: [
    { label: 'fn', snippet: 'function ${1:name}(${2:params}): ${3:void} {\n\t$0\n}', doc: 'Function declaration' },
    { label: 'afn', snippet: 'const ${1:name} = async (${2:params}) => {\n\t$0\n};', doc: 'Async arrow function' },
    { label: 'interface', snippet: 'export interface ${1:Name} {\n\t${2:property}: ${3:type};\n}', doc: 'Interface declaration' }
  ],
  python: [
    { label: 'def', snippet: 'def ${1:function_name}(${2:args}):\n    \"\"\"${3:Docstring}\"\"\"\n    ${0:pass}', doc: 'Python function definition' },
    { label: 'class', snippet: 'class ${1:ClassName}:\n    def __init__(self${2:, args}):\n        ${0:pass}', doc: 'Python class definition' },
    { label: 'main', snippet: 'if __name__ == "__main__":\n    ${0:main()}', doc: 'Main execution block' }
  ],
  rust: [
    { label: 'fn', snippet: 'pub fn ${1:name}(${2:args}) -> ${3:Result<(), Box<dyn std::error::Error>>} {\n    ${0:Ok(())}\n}', doc: 'Rust function' },
    { label: 'struct', snippet: '#[derive(Debug, Clone)]\npub struct ${1:Name} {\n    pub ${2:field}: ${3:Type},\n}', doc: 'Rust struct declaration' }
  ]
};
