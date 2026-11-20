import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { RecentProject, IDESettings, DEFAULT_SETTINGS } from '@nexcode/shared';

interface AppDatabaseData {
  recentProjects: RecentProject[];
  settings: IDESettings;
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
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to load local database, initializing fresh store:', err);
    }

    return {
      recentProjects: [],
      settings: { ...DEFAULT_SETTINGS }
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

    // Keep only last 25 recent projects
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

  public getSettings(): IDESettings {
    return this.data.settings;
  }

  public saveSettings(partial: Partial<IDESettings>): IDESettings {
    this.data.settings = { ...this.data.settings, ...partial };
    this.persist();
    return this.data.settings;
  }
}

export const dbManager = new DatabaseManager();
