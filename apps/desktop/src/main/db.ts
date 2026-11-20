import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import {
  RecentProject,
  IDESettings,
  DEFAULT_SETTINGS,
  AIChatSession,
  AIChatMessage
} from '@nexcode/shared';

interface AppDatabaseData {
  recentProjects: RecentProject[];
  settings: IDESettings;
  chatSessions: AIChatSession[];
  chatMessages: Record<string, AIChatMessage[]>;
}

class DatabaseManager {
  private dataFilePath: string;
  private data: AppDatabaseData;

  constructor() {
    try {
      const userData = app.getPath('userData');
      this.dataFilePath = path.join(userData, 'nexcode_store.json');
    } catch {
      this.dataFilePath = path.join(process.cwd(), 'nexcode_store.json');
    }

    this.data = this.loadData();
  }

  private loadData(): AppDatabaseData {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          recentProjects: Array.isArray(parsed.recentProjects) ? parsed.recentProjects : [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          chatSessions: Array.isArray(parsed.chatSessions) ? parsed.chatSessions : [],
          chatMessages: parsed.chatMessages && typeof parsed.chatMessages === 'object' ? parsed.chatMessages : {}
        };
      }
    } catch (err) {
      console.warn('Failed to load local database, initializing fresh store:', err);
    }

    return {
      recentProjects: [],
      settings: { ...DEFAULT_SETTINGS },
      chatSessions: [],
      chatMessages: {}
    };
  }

  private persist() {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database:', err);
    }
  }

  // Projects
  public getRecentProjects(): RecentProject[] {
    return this.data.recentProjects.sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
  }

  public addRecentProject(name: string, projectPath: string): RecentProject {
    const existingIndex = this.data.recentProjects.findIndex((p) => p.path === projectPath);
    let project: RecentProject;

    if (existingIndex >= 0) {
      this.data.recentProjects[existingIndex].lastOpenedAt = Date.now();
      this.data.recentProjects[existingIndex].name = name;
      project = this.data.recentProjects[existingIndex];
    } else {
      project = {
        id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        path: projectPath,
        lastOpenedAt: Date.now(),
        isFavorite: false
      };
      this.data.recentProjects.unshift(project);
    }

    if (this.data.recentProjects.length > 25) {
      this.data.recentProjects = this.data.recentProjects.slice(0, 25);
    }

    this.persist();
    return project;
  }

  public removeRecentProject(id: string) {
    this.data.recentProjects = this.data.recentProjects.filter((p) => p.id !== id);
    this.persist();
  }

  // Settings
  public getSettings(): IDESettings {
    return this.data.settings;
  }

  public saveSettings(partial: Partial<IDESettings>): IDESettings {
    this.data.settings = { ...this.data.settings, ...partial };
    this.persist();
    return this.data.settings;
  }

  // AI Chat Sessions
  public getChatSessions(): AIChatSession[] {
    return [...this.data.chatSessions].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public createChatSession(title: string, model: string): AIChatSession {
    const session: AIChatSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title || 'New Conversation',
      model,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.data.chatSessions.unshift(session);
    this.data.chatMessages[session.id] = [];
    this.persist();
    return session;
  }

  public deleteChatSession(sessionId: string): boolean {
    this.data.chatSessions = this.data.chatSessions.filter((s) => s.id !== sessionId);
    delete this.data.chatMessages[sessionId];
    this.persist();
    return true;
  }

  public getChatMessages(sessionId: string): AIChatMessage[] {
    return this.data.chatMessages[sessionId] || [];
  }

  public saveChatMessage(sessionId: string, message: AIChatMessage): AIChatMessage {
    if (!this.data.chatMessages[sessionId]) {
      this.data.chatMessages[sessionId] = [];
    }
    const existingIndex = this.data.chatMessages[sessionId].findIndex((m) => m.id === message.id);
    if (existingIndex >= 0) {
      this.data.chatMessages[sessionId][existingIndex] = message;
    } else {
      this.data.chatMessages[sessionId].push(message);
    }

    // Update session updatedAt and title if first user message
    const session = this.data.chatSessions.find((s) => s.id === sessionId);
    if (session) {
      session.updatedAt = Date.now();
      if (message.role === 'user' && session.title === 'New Conversation') {
        const snippet = message.content.trim().slice(0, 36);
        session.title = snippet.length < message.content.trim().length ? `${snippet}...` : snippet;
      }
    }

    this.persist();
    return message;
  }

  public clearChatSession(sessionId: string): boolean {
    if (this.data.chatMessages[sessionId]) {
      this.data.chatMessages[sessionId] = [];
      this.persist();
      return true;
    }
    return false;
  }
}

export const dbManager = new DatabaseManager();
