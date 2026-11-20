import fs from 'fs';
import path from 'path';

export interface MigrationFile {
  name: string;
  version: number;
  sql: string;
}

export function loadMigrations(migrationsDir?: string): MigrationFile[] {
  const dir = migrationsDir || path.join(__dirname, 'migrations');
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  return files.map((f, idx) => ({
    name: f,
    version: idx + 1,
    sql: fs.readFileSync(path.join(dir, f), 'utf-8')
  }));
}

export function parseSqlTables(sql: string): string[] {
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi;
  const tables: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tableRegex.exec(sql)) !== null) {
    tables.push(match[1]);
  }
  return tables;
}
