import * as SQLite from 'expo-sqlite';
import { Task, Project, TimeEntry } from '../types';

class StorageService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Open database
      this.db = await SQLite.openDatabaseAsync('taskmanager.db');
      
      // Create tables
      await this.createTables();
      
      this.isInitialized = true;
      console.log('Storage service initialized');
    } catch (error) {
      console.error('Storage initialization error:', error);
      throw error;
    }
  }

  async createTables() {
    // Tasks table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        projectId TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        startTime TEXT,
        endTime TEXT,
        dueDate TEXT,
        estimatedDuration INTEGER,
        actualDuration INTEGER DEFAULT 0,
        timeSpent INTEGER DEFAULT 0,
        isTimerRunning INTEGER DEFAULT 0,
        timerStartTime TEXT,
        tags TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
    `);

    // Projects table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#007AFF',
        startDate TEXT,
        endDate TEXT,
        status TEXT DEFAULT 'active',
        totalEstimatedTime INTEGER DEFAULT 0,
        totalActualTime INTEGER DEFAULT 0,
        progress INTEGER DEFAULT 0,
        createdAt TEXT,
        updatedAt TEXT
      );
    `);

    // Time entries table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS time_entries (
        id TEXT PRIMARY KEY,
        taskId TEXT,
        projectId TEXT,
        startTime TEXT,
        endTime TEXT,
        duration INTEGER,
        description TEXT,
        createdAt TEXT,
        FOREIGN KEY (taskId) REFERENCES tasks (id),
        FOREIGN KEY (projectId) REFERENCES projects (id)
      );
    `);

    // Settings table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    console.log('Database tables created');
  }

  // Task CRUD Operations
  async getAllTasks() {
    await this.init();
    const result = await this.db.getAllAsync('SELECT * FROM tasks ORDER BY createdAt DESC');
    return result.map(row => new Task({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : [],
      isTimerRunning: Boolean(row.isTimerRunning)
    }));
  }

  async getTaskById(taskId) {
    await this.init();
    const result = await this.db.getFirstAsync('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!result) return null;
    
    return new Task({
      ...result,
      tags: result.tags ? JSON.parse(result.tags) : [],
      isTimerRunning: Boolean(result.isTimerRunning)
    });
  }

  async getTasksByProject(projectId) {
    await this.init();
    const result = await this.db.getAllAsync('SELECT * FROM tasks WHERE projectId = ? ORDER BY createdAt DESC', [projectId]);
    return result.map(row => new Task({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : [],
      isTimerRunning: Boolean(row.isTimerRunning)
    }));
  }

  async getTasksByStatus(status) {
    await this.init();
    const result = await this.db.getAllAsync('SELECT * FROM tasks WHERE status = ? ORDER BY createdAt DESC', [status]);
    return result.map(row => new Task({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : [],
      isTimerRunning: Boolean(row.isTimerRunning)
    }));
  }

  async createTask(taskData) {
    await this.init();
    const task = new Task(taskData);
    
    await this.db.runAsync(`
      INSERT INTO tasks (
        id, title, description, projectId, status, priority, startTime, endTime, dueDate,
        estimatedDuration, actualDuration, timeSpent, isTimerRunning, timerStartTime,
        tags, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      task.id, task.title, task.description, task.projectId, task.status, task.priority,
      task.startTime, task.endTime, task.dueDate, task.estimatedDuration, task.actualDuration,
      task.timeSpent, task.isTimerRunning ? 1 : 0, task.timerStartTime,
      JSON.stringify(task.tags), task.createdAt, task.updatedAt
    ]);

    return task;
  }

  async updateTask(taskId, updateData) {
    await this.init();
    const task = await this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');

    const updatedTask = new Task({
      ...task.toJSON(),
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    await this.db.runAsync(`
      UPDATE tasks SET
        title = ?, description = ?, projectId = ?, status = ?, priority = ?,
        startTime = ?, endTime = ?, dueDate = ?, estimatedDuration = ?,
        actualDuration = ?, timeSpent = ?, isTimerRunning = ?, timerStartTime = ?,
        tags = ?, updatedAt = ?
      WHERE id = ?
    `, [
      updatedTask.title, updatedTask.description, updatedTask.projectId, updatedTask.status,
      updatedTask.priority, updatedTask.startTime, updatedTask.endTime, updatedTask.dueDate,
      updatedTask.estimatedDuration, updatedTask.actualDuration, updatedTask.timeSpent,
      updatedTask.isTimerRunning ? 1 : 0, updatedTask.timerStartTime,
      JSON.stringify(updatedTask.tags), updatedTask.updatedAt, taskId
    ]);

    return updatedTask;
  }

  async deleteTask(taskId) {
    await this.init();
    await this.db.runAsync('DELETE FROM time_entries WHERE taskId = ?', [taskId]);
    await this.db.runAsync('DELETE FROM tasks WHERE id = ?', [taskId]);
    return true;
  }

  // Project CRUD Operations
  async getAllProjects() {
    await this.init();
    const result = await this.db.getAllAsync('SELECT * FROM projects ORDER BY createdAt DESC');
    return result.map(row => new Project(row));
  }

  async getProjectById(projectId) {
    await this.init();
    const result = await this.db.getFirstAsync('SELECT * FROM projects WHERE id = ?', [projectId]);
    return result ? new Project(result) : null;
  }

  async createProject(projectData) {
    await this.init();
    const project = new Project(projectData);
    
    await this.db.runAsync(`
      INSERT INTO projects (
        id, name, description, color, startDate, endDate, status,
        totalEstimatedTime, totalActualTime, progress, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      project.id, project.name, project.description, project.color, project.startDate,
      project.endDate, project.status, project.totalEstimatedTime, project.totalActualTime,
      project.progress, project.createdAt, project.updatedAt
    ]);

    return project;
  }

  async updateProject(projectId, updateData) {
    await this.init();
    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const updatedProject = new Project({
      ...project.toJSON(),
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    await this.db.runAsync(`
      UPDATE projects SET
        name = ?, description = ?, color = ?, startDate = ?, endDate = ?,
        status = ?, totalEstimatedTime = ?, totalActualTime = ?, progress = ?, updatedAt = ?
      WHERE id = ?
    `, [
      updatedProject.name, updatedProject.description, updatedProject.color,
      updatedProject.startDate, updatedProject.endDate, updatedProject.status,
      updatedProject.totalEstimatedTime, updatedProject.totalActualTime,
      updatedProject.progress, updatedProject.updatedAt, projectId
    ]);

    return updatedProject;
  }

  async deleteProject(projectId) {
    await this.init();
    // Delete related time entries and tasks
    await this.db.runAsync('DELETE FROM time_entries WHERE projectId = ?', [projectId]);
    await this.db.runAsync('DELETE FROM tasks WHERE projectId = ?', [projectId]);
    await this.db.runAsync('DELETE FROM projects WHERE id = ?', [projectId]);
    return true;
  }

  // Time Entry Operations
  async getAllTimeEntries() {
    await this.init();
    const result = await this.db.getAllAsync('SELECT * FROM time_entries ORDER BY createdAt DESC');
    return result.map(row => new TimeEntry(row));
  }

  async getTimeEntriesByTask(taskId) {
    await this.init();
    const result = await this.db.getAllAsync('SELECT * FROM time_entries WHERE taskId = ? ORDER BY createdAt DESC', [taskId]);
    return result.map(row => new TimeEntry(row));
  }

  async getTimeEntriesByProject(projectId) {
    await this.init();
    const result = await this.db.getAllAsync('SELECT * FROM time_entries WHERE projectId = ? ORDER BY createdAt DESC', [projectId]);
    return result.map(row => new TimeEntry(row));
  }

  async createTimeEntry(entryData) {
    await this.init();
    const entry = new TimeEntry(entryData);
    
    await this.db.runAsync(`
      INSERT INTO time_entries (id, taskId, projectId, startTime, endTime, duration, description, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      entry.id, entry.taskId, entry.projectId, entry.startTime,
      entry.endTime, entry.duration, entry.description, entry.createdAt
    ]);

    return entry;
  }

  // Settings Operations
  async getSetting(key, defaultValue = null) {
    await this.init();
    const result = await this.db.getFirstAsync('SELECT value FROM settings WHERE key = ?', [key]);
    return result ? JSON.parse(result.value) : defaultValue;
  }

  async setSetting(key, value) {
    await this.init();
    await this.db.runAsync(`
      INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)
    `, [key, JSON.stringify(value)]);
  }

  async getSettings() {
    await this.init();
    const defaultSettings = {
      notifications: {
        enabled: true,
        soundEnabled: true,
        vibrationEnabled: true
      },
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      defaultTaskDuration: 60,
      autoStartTimer: false
    };

    const result = await this.db.getAllAsync('SELECT * FROM settings');
    const settings = { ...defaultSettings };
    
    result.forEach(row => {
      settings[row.key] = JSON.parse(row.value);
    });

    return settings;
  }

  // Utility methods
  async clearAllData() {
    await this.init();
    await this.db.execAsync(`
      DELETE FROM time_entries;
      DELETE FROM tasks;
      DELETE FROM projects;
      DELETE FROM settings;
    `);
    console.log('All data cleared');
  }

  async getStats() {
    await this.init();
    const stats = {};
    
    const taskCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM tasks');
    const projectCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM projects');
    const timeEntryCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM time_entries');
    
    stats.tasks = taskCount.count;
    stats.projects = projectCount.count;
    stats.timeEntries = timeEntryCount.count;
    
    return stats;
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;