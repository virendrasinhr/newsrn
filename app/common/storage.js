import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Project, TimeEntry, TaskNotification } from './types';

// Storage Keys
const STORAGE_KEYS = {
  TASKS: '@TaskManager:tasks',
  PROJECTS: '@TaskManager:projects',
  TIME_ENTRIES: '@TaskManager:timeEntries',
  NOTIFICATIONS: '@TaskManager:notifications',
  SETTINGS: '@TaskManager:settings',
  ACTIVE_TIMERS: '@TaskManager:activeTimers'
};

class StorageService {
  // Generic storage methods
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('Storage setItem error:', error);
      return false;
    }
  }

  async getItem(key, defaultValue = null) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return defaultValue;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage removeItem error:', error);
      return false;
    }
  }

  // Task CRUD Operations
  async getAllTasks() {
    const tasks = await this.getItem(STORAGE_KEYS.TASKS, []);
    return tasks.map(taskData => new Task(taskData));
  }

  async getTaskById(taskId) {
    const tasks = await this.getAllTasks();
    return tasks.find(task => task.id === taskId) || null;
  }

  async getTasksByProject(projectId) {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.projectId === projectId);
  }

  async getTasksByStatus(status) {
    const tasks = await this.getAllTasks();
    return tasks.filter(task => task.status === status);
  }

  async createTask(taskData) {
    try {
      const tasks = await this.getAllTasks();
      const newTask = new Task(taskData);
      tasks.push(newTask);
      
      await this.setItem(STORAGE_KEYS.TASKS, tasks.map(task => task.toJSON()));
      return newTask;
    } catch (error) {
      console.error('Create task error:', error);
      return null;
    }
  }

  async updateTask(taskId, updateData) {
    try {
      const tasks = await this.getAllTasks();
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const updatedTask = new Task({
        ...tasks[taskIndex].toJSON(),
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      tasks[taskIndex] = updatedTask;
      await this.setItem(STORAGE_KEYS.TASKS, tasks.map(task => task.toJSON()));
      return updatedTask;
    } catch (error) {
      console.error('Update task error:', error);
      return null;
    }
  }

  async deleteTask(taskId) {
    try {
      const tasks = await this.getAllTasks();
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      
      await this.setItem(STORAGE_KEYS.TASKS, filteredTasks.map(task => task.toJSON()));
      
      // Also delete related time entries
      await this.deleteTimeEntriesByTask(taskId);
      
      return true;
    } catch (error) {
      console.error('Delete task error:', error);
      return false;
    }
  }

  // Project CRUD Operations
  async getAllProjects() {
    const projects = await this.getItem(STORAGE_KEYS.PROJECTS, []);
    return projects.map(projectData => new Project(projectData));
  }

  async getProjectById(projectId) {
    const projects = await this.getAllProjects();
    return projects.find(project => project.id === projectId) || null;
  }

  async createProject(projectData) {
    try {
      const projects = await this.getAllProjects();
      const newProject = new Project(projectData);
      projects.push(newProject);
      
      await this.setItem(STORAGE_KEYS.PROJECTS, projects.map(project => project.toJSON()));
      return newProject;
    } catch (error) {
      console.error('Create project error:', error);
      return null;
    }
  }

  async updateProject(projectId, updateData) {
    try {
      const projects = await this.getAllProjects();
      const projectIndex = projects.findIndex(project => project.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }

      const updatedProject = new Project({
        ...projects[projectIndex].toJSON(),
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      projects[projectIndex] = updatedProject;
      await this.setItem(STORAGE_KEYS.PROJECTS, projects.map(project => project.toJSON()));
      return updatedProject;
    } catch (error) {
      console.error('Update project error:', error);
      return null;
    }
  }

  async deleteProject(projectId) {
    try {
      const projects = await this.getAllProjects();
      const filteredProjects = projects.filter(project => project.id !== projectId);
      
      await this.setItem(STORAGE_KEYS.PROJECTS, filteredProjects.map(project => project.toJSON()));
      
      // Also delete related tasks and time entries
      const tasks = await this.getTasksByProject(projectId);
      for (const task of tasks) {
        await this.deleteTask(task.id);
      }
      
      return true;
    } catch (error) {
      console.error('Delete project error:', error);
      return false;
    }
  }

  // Time Entry Operations
  async getAllTimeEntries() {
    const timeEntries = await this.getItem(STORAGE_KEYS.TIME_ENTRIES, []);
    return timeEntries.map(entryData => new TimeEntry(entryData));
  }

  async getTimeEntriesByTask(taskId) {
    const timeEntries = await this.getAllTimeEntries();
    return timeEntries.filter(entry => entry.taskId === taskId);
  }

  async getTimeEntriesByProject(projectId) {
    const timeEntries = await this.getAllTimeEntries();
    return timeEntries.filter(entry => entry.projectId === projectId);
  }

  async createTimeEntry(entryData) {
    try {
      const timeEntries = await this.getAllTimeEntries();
      const newEntry = new TimeEntry(entryData);
      timeEntries.push(newEntry);
      
      await this.setItem(STORAGE_KEYS.TIME_ENTRIES, timeEntries.map(entry => entry.toJSON()));
      return newEntry;
    } catch (error) {
      console.error('Create time entry error:', error);
      return null;
    }
  }

  async deleteTimeEntriesByTask(taskId) {
    try {
      const timeEntries = await this.getAllTimeEntries();
      const filteredEntries = timeEntries.filter(entry => entry.taskId !== taskId);
      
      await this.setItem(STORAGE_KEYS.TIME_ENTRIES, filteredEntries.map(entry => entry.toJSON()));
      return true;
    } catch (error) {
      console.error('Delete time entries by task error:', error);
      return false;
    }
  }

  // Notification Operations
  async getAllNotifications() {
    const notifications = await this.getItem(STORAGE_KEYS.NOTIFICATIONS, []);
    return notifications.map(notificationData => new TaskNotification(notificationData));
  }

  async createNotification(notificationData) {
    try {
      const notifications = await this.getAllNotifications();
      const newNotification = new TaskNotification(notificationData);
      notifications.push(newNotification);
      
      await this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications.map(notification => notification.toJSON()));
      return newNotification;
    } catch (error) {
      console.error('Create notification error:', error);
      return null;
    }
  }

  async updateNotification(notificationId, updateData) {
    try {
      const notifications = await this.getAllNotifications();
      const notificationIndex = notifications.findIndex(notification => notification.id === notificationId);
      
      if (notificationIndex === -1) {
        throw new Error('Notification not found');
      }

      const updatedNotification = new TaskNotification({
        ...notifications[notificationIndex].toJSON(),
        ...updateData
      });

      notifications[notificationIndex] = updatedNotification;
      await this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications.map(notification => notification.toJSON()));
      return updatedNotification;
    } catch (error) {
      console.error('Update notification error:', error);
      return null;
    }
  }

  async deleteNotification(notificationId) {
    try {
      const notifications = await this.getAllNotifications();
      const filteredNotifications = notifications.filter(notification => notification.id !== notificationId);
      
      await this.setItem(STORAGE_KEYS.NOTIFICATIONS, filteredNotifications.map(notification => notification.toJSON()));
      return true;
    } catch (error) {
      console.error('Delete notification error:', error);
      return false;
    }
  }

  // Active Timer Operations
  async getActiveTimers() {
    return await this.getItem(STORAGE_KEYS.ACTIVE_TIMERS, {});
  }

  async setActiveTimer(taskId, timerData) {
    try {
      const activeTimers = await this.getActiveTimers();
      activeTimers[taskId] = timerData;
      await this.setItem(STORAGE_KEYS.ACTIVE_TIMERS, activeTimers);
      return true;
    } catch (error) {
      console.error('Set active timer error:', error);
      return false;
    }
  }

  async removeActiveTimer(taskId) {
    try {
      const activeTimers = await this.getActiveTimers();
      delete activeTimers[taskId];
      await this.setItem(STORAGE_KEYS.ACTIVE_TIMERS, activeTimers);
      return true;
    } catch (error) {
      console.error('Remove active timer error:', error);
      return false;
    }
  }

  // Settings Operations
  async getSettings() {
    return await this.getItem(STORAGE_KEYS.SETTINGS, {
      notifications: {
        enabled: true,
        soundEnabled: true,
        vibrationEnabled: true
      },
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      defaultTaskDuration: 60, // minutes
      autoStartTimer: false
    });
  }

  async updateSettings(settings) {
    return await this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // Utility methods
  async clearAllData() {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Clear all data error:', error);
      return false;
    }
  }

  async exportData() {
    try {
      const data = {
        tasks: await this.getAllTasks(),
        projects: await this.getAllProjects(),
        timeEntries: await this.getAllTimeEntries(),
        notifications: await this.getAllNotifications(),
        settings: await this.getSettings()
      };
      return data;
    } catch (error) {
      console.error('Export data error:', error);
      return null;
    }
  }

  async importData(data) {
    try {
      if (data.tasks) {
        await this.setItem(STORAGE_KEYS.TASKS, data.tasks.map(task => new Task(task).toJSON()));
      }
      if (data.projects) {
        await this.setItem(STORAGE_KEYS.PROJECTS, data.projects.map(project => new Project(project).toJSON()));
      }
      if (data.timeEntries) {
        await this.setItem(STORAGE_KEYS.TIME_ENTRIES, data.timeEntries.map(entry => new TimeEntry(entry).toJSON()));
      }
      if (data.notifications) {
        await this.setItem(STORAGE_KEYS.NOTIFICATIONS, data.notifications.map(notification => new TaskNotification(notification).toJSON()));
      }
      if (data.settings) {
        await this.setItem(STORAGE_KEYS.SETTINGS, data.settings);
      }
      return true;
    } catch (error) {
      console.error('Import data error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;