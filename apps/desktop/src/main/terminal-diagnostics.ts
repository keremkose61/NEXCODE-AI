import { TerminalDiagnostic } from '@nexcode/shared';
import fs from 'fs/promises';
import path from 'path';

export class TerminalDiagnosticsManager {
  private errorPatterns = [
    /error TS\d+:\s*(.*)/i,
    /([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+):(\d+):(\d+):\s*error:\s*(.*)/i,
    /SyntaxError:\s*(.*)/i,
    /TypeError:\s*(.*)/i,
    /ReferenceError:\s*(.*)/i,
    /Cannot find module '([^']+)'/i,
    /npm ERR!\s*(.*)/i,
    /Module not found:\s*(.*)/i,
    /panic:\s*(.*)/i,
    /Traceback \(most recent call last\):/i
  ];

  public detectError(output: string): { hasError: boolean; summary?: string; filePath?: string; line?: number } {
    for (const pattern of this.errorPatterns) {
      const match = output.match(pattern);
      if (match) {
        // Check if there is a file path and line number
        const fileMatch = output.match(/([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+):(\d+)(?::(\d+))?/);
        return {
          hasError: true,
          summary: match[0].trim(),
          filePath: fileMatch ? fileMatch[1] : undefined,
          line: fileMatch ? parseInt(fileMatch[2], 10) : undefined
        };
      }
    }

    if (output.includes('FAILED') || output.includes('Error:') || output.includes('ERR!')) {
      const lines = output.split('\n').filter((l) => l.toLowerCase().includes('error'));
      return {
        hasError: true,
        summary: lines[0]?.trim() || 'Command encountered an error.'
      };
    }

    return { hasError: false };
  }

  public async createDiagnostic(
    tabId: string,
    command: string,
    errorOutput: string,
    workspacePath: string
  ): Promise<TerminalDiagnostic | null> {
    const errorInfo = this.detectError(errorOutput);
    if (!errorInfo.hasError) return null;

    let diagnosis = `Diagnostic Analysis for: \`${command}\`\n\n**Detected Error:** ${errorInfo.summary}\n`;
    let fileSnippet = '';

    if (errorInfo.filePath) {
      const fullPath = path.isAbsolute(errorInfo.filePath)
        ? errorInfo.filePath
        : path.join(workspacePath, errorInfo.filePath);

      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        const lines = content.split('\n');
        const errLine = errorInfo.line || 1;
        const start = Math.max(0, errLine - 5);
        const end = Math.min(lines.length, errLine + 5);
        fileSnippet = lines.slice(start, end).join('\n');
        diagnosis += `\n**Origin File:** \`${errorInfo.filePath}:${errLine}\`\n\`\`\`\n${fileSnippet}\n\`\`\``;
      } catch {
        // file unreadable or not found
      }
    }

    return {
      tabId,
      command,
      errorOutput: errorOutput.slice(-2000), // last 2000 chars of output
      diagnosis,
      timestamp: Date.now()
    };
  }
}

export const terminalDiagnostics = new TerminalDiagnosticsManager();
