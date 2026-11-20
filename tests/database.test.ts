import { describe, it, expect } from 'vitest';
import path from 'path';
import { loadMigrations, parseSqlTables } from '../database/migrate';

describe('Database & SQLite Schema Migration (PHASE 10)', () => {
  it('loads initial migration file 001_initial_schema.sql', () => {
    const migrationsDir = path.resolve(__dirname, '../database/migrations');
    const migrations = loadMigrations(migrationsDir);

    expect(migrations.length).toBeGreaterThanOrEqual(1);
    expect(migrations[0].name).toBe('001_initial_schema.sql');
  });

  it('defines all required IDE tables in SQLite schema', () => {
    const migrationsDir = path.resolve(__dirname, '../database/migrations');
    const migrations = loadMigrations(migrationsDir);
    const tables = parseSqlTables(migrations[0].sql);

    expect(tables).toContain('ide_settings');
    expect(tables).toContain('recent_projects');
    expect(tables).toContain('ai_chat_sessions');
    expect(tables).toContain('ai_chat_messages');
    expect(tables).toContain('ai_agent_tasks');
    expect(tables).toContain('ai_agent_audit_logs');
  });

  it('validates schema foreign keys and constraints', () => {
    const migrationsDir = path.resolve(__dirname, '../database/migrations');
    const migrations = loadMigrations(migrationsDir);
    const sql = migrations[0].sql;

    expect(sql).toContain('FOREIGN KEY(session_id) REFERENCES ai_chat_sessions(id)');
    expect(sql).toContain('FOREIGN KEY(task_id) REFERENCES ai_agent_tasks(id)');
    expect(sql).toContain("CHECK(role IN ('user', 'assistant', 'system'))");
  });
});
