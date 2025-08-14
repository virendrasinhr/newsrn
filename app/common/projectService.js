import storageService from './storage';
import timeTrackerService from './timeTracker';
import notificationService from './notifications';
import { TaskStatus, Project } from './types';
import moment from 'moment';

class ProjectService {
  constructor() {
    this.listeners = new Set();
  }

  // Project Analytics
  async getProjectAnalytics(projectId) {
    try {
      const project = await storageService.getProjectById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const tasks = await storageService.getTasksByProject(projectId);
      const timeEntries = await storageService.getTimeEntriesByProject(projectId);
      
      // Basic statistics
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
      const inProgressTasks = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
      const pendingTasks = tasks.filter(task => task.status === TaskStatus.PENDING).length;
      const overdueTasks = tasks.filter(task => 
        task.dueDate && moment(task.dueDate).isBefore(moment()) && task.status !== TaskStatus.COMPLETED
      ).length;

      // Time statistics
      const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0);
      const totalActualTime = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
      
      // Add current active timer times
      let currentActiveTime = 0;
      for (const task of tasks) {
        currentActiveTime += timeTrackerService.getCurrentElapsedTime(task.id);
      }
      
      const totalTimeWithActive = totalActualTime + currentActiveTime;

      // Progress calculations
      const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const timeEfficiency = totalEstimatedTime > 0 ? (totalEstimatedTime / totalTimeWithActive) * 100 : 100;

      // Priority distribution
      const priorityDistribution = {
        low: tasks.filter(task => task.priority === 'low').length,
        medium: tasks.filter(task => task.priority === 'medium').length,
        high: tasks.filter(task => task.priority === 'high').length,
        urgent: tasks.filter(task => task.priority === 'urgent').length
      };

      // Timeline analysis
      const projectStartDate = project.startDate ? moment(project.startDate) : null;
      const projectEndDate = project.endDate ? moment(project.endDate) : null;
      const today = moment();
      
      let timelineStatus = 'on_track';
      let daysRemaining = null;
      let daysOverdue = null;
      
      if (projectEndDate) {
        if (projectEndDate.isBefore(today) && progressPercentage < 100) {
          timelineStatus = 'overdue';
          daysOverdue = today.diff(projectEndDate, 'days');
        } else if (projectEndDate.isAfter(today)) {
          daysRemaining = projectEndDate.diff(today, 'days');
          
          // Predict if project will be late based on current progress
          if (projectStartDate) {
            const totalProjectDays = projectEndDate.diff(projectStartDate, 'days');
            const daysPassed = today.diff(projectStartDate, 'days');
            const expectedProgress = totalProjectDays > 0 ? (daysPassed / totalProjectDays) * 100 : 0;
            
            if (progressPercentage < expectedProgress - 10) {
              timelineStatus = 'behind_schedule';
            } else if (progressPercentage > expectedProgress + 10) {
              timelineStatus = 'ahead_schedule';
            }
          }
        }
      }

      // Team productivity (if we had team members, this would be more detailed)
      const averageTaskCompletionTime = completedTasks > 0 ? 
        tasks.filter(task => task.status === TaskStatus.COMPLETED)
             .reduce((sum, task) => sum + (task.timeSpent || 0), 0) / completedTasks : 0;

      // Recent activity
      const recentTasks = tasks
        .filter(task => moment(task.updatedAt).isAfter(moment().subtract(7, 'days')))
        .sort((a, b) => moment(b.updatedAt).diff(moment(a.updatedAt)));

      return {
        projectId,
        projectName: project.name,
        
        // Task statistics
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          pending: pendingTasks,
          overdue: overdueTasks,
          completionRate: Math.round(progressPercentage)
        },
        
        // Time statistics
        timeStats: {
          totalEstimated: totalEstimatedTime,
          totalActual: totalTimeWithActive,
          efficiency: Math.round(timeEfficiency),
          averageTaskTime: Math.round(averageTaskCompletionTime),
          activeTime: currentActiveTime
        },
        
        // Priority distribution
        priorityDistribution,
        
        // Timeline information
        timeline: {
          status: timelineStatus,
          startDate: project.startDate,
          endDate: project.endDate,
          daysRemaining,
          daysOverdue,
          progress: Math.round(progressPercentage)
        },
        
        // Recent activity
        recentActivity: recentTasks.slice(0, 5),
        
        // Overall health score (0-100)
        healthScore: this.calculateProjectHealthScore({
          progressPercentage,
          timeEfficiency,
          overdueTasks,
          totalTasks,
          timelineStatus
        })
      };
    } catch (error) {
      console.error('Get project analytics error:', error);
      throw error;
    }
  }

  calculateProjectHealthScore({ progressPercentage, timeEfficiency, overdueTasks, totalTasks, timelineStatus }) {
    let score = 100;
    
    // Penalize for low progress
    if (progressPercentage < 25) score -= 20;
    else if (progressPercentage < 50) score -= 10;
    
    // Penalize for poor time efficiency
    if (timeEfficiency < 80) score -= 15;
    else if (timeEfficiency < 90) score -= 5;
    
    // Penalize for overdue tasks
    const overdueRatio = totalTasks > 0 ? (overdueTasks / totalTasks) : 0;
    score -= Math.round(overdueRatio * 30);
    
    // Penalize for timeline issues
    if (timelineStatus === 'overdue') score -= 25;
    else if (timelineStatus === 'behind_schedule') score -= 15;
    else if (timelineStatus === 'ahead_schedule') score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  // Project Templates
  async createProjectFromTemplate(templateName, projectData) {
    try {
      const templates = {
        'software_development': {
          name: 'Software Development Project',
          tasks: [
            { title: 'Requirements Analysis', estimatedDuration: 480, priority: 'high' },
            { title: 'System Design', estimatedDuration: 720, priority: 'high' },
            { title: 'Database Design', estimatedDuration: 360, priority: 'medium' },
            { title: 'Frontend Development', estimatedDuration: 1440, priority: 'high' },
            { title: 'Backend Development', estimatedDuration: 1440, priority: 'high' },
            { title: 'API Integration', estimatedDuration: 480, priority: 'medium' },
            { title: 'Testing', estimatedDuration: 720, priority: 'high' },
            { title: 'Deployment', estimatedDuration: 240, priority: 'medium' },
            { title: 'Documentation', estimatedDuration: 360, priority: 'low' }
          ]
        },
        'marketing_campaign': {
          name: 'Marketing Campaign',
          tasks: [
            { title: 'Market Research', estimatedDuration: 480, priority: 'high' },
            { title: 'Target Audience Analysis', estimatedDuration: 240, priority: 'high' },
            { title: 'Content Strategy', estimatedDuration: 360, priority: 'high' },
            { title: 'Creative Development', estimatedDuration: 720, priority: 'medium' },
            { title: 'Campaign Setup', estimatedDuration: 240, priority: 'medium' },
            { title: 'Launch Campaign', estimatedDuration: 120, priority: 'high' },
            { title: 'Monitor Performance', estimatedDuration: 480, priority: 'medium' },
            { title: 'Optimize Campaign', estimatedDuration: 360, priority: 'medium' },
            { title: 'Final Report', estimatedDuration: 240, priority: 'low' }
          ]
        },
        'product_launch': {
          name: 'Product Launch',
          tasks: [
            { title: 'Product Planning', estimatedDuration: 720, priority: 'urgent' },
            { title: 'Competitive Analysis', estimatedDuration: 360, priority: 'high' },
            { title: 'Feature Development', estimatedDuration: 1440, priority: 'urgent' },
            { title: 'Quality Assurance', estimatedDuration: 480, priority: 'high' },
            { title: 'Marketing Materials', estimatedDuration: 480, priority: 'medium' },
            { title: 'Pre-launch Testing', estimatedDuration: 240, priority: 'high' },
            { title: 'Launch Preparation', estimatedDuration: 360, priority: 'high' },
            { title: 'Product Launch', estimatedDuration: 120, priority: 'urgent' },
            { title: 'Post-launch Review', estimatedDuration: 240, priority: 'medium' }
          ]
        }
      };

      const template = templates[templateName];
      if (!template) {
        throw new Error('Template not found');
      }

      // Create project
      const project = await storageService.createProject({
        ...projectData,
        name: projectData.name || template.name
      });

      // Create tasks from template
      const createdTasks = [];
      for (const taskTemplate of template.tasks) {
        const task = await storageService.createTask({
          ...taskTemplate,
          projectId: project.id,
          status: TaskStatus.PENDING
        });
        createdTasks.push(task);
      }

      return {
        project,
        tasks: createdTasks
      };
    } catch (error) {
      console.error('Create project from template error:', error);
      throw error;
    }
  }

  // Project Automation
  async setupProjectAutomation(projectId, automationRules) {
    try {
      const project = await storageService.getProjectById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Schedule automatic notifications
      if (automationRules.dailyStandupReminder) {
        await this.scheduleDailyStandupReminder(projectId, automationRules.dailyStandupReminder);
      }

      if (automationRules.weeklyProgressReport) {
        await this.scheduleWeeklyProgressReport(projectId);
      }

      if (automationRules.deadlineAlerts) {
        await this.setupDeadlineAlerts(projectId, automationRules.deadlineAlerts);
      }

      // Auto-status updates
      if (automationRules.autoStatusUpdates) {
        await this.setupAutoStatusUpdates(projectId);
      }

      return true;
    } catch (error) {
      console.error('Setup project automation error:', error);
      return false;
    }
  }

  async scheduleDailyStandupReminder(projectId, time) {
    const project = await storageService.getProjectById(projectId);
    const tomorrow = moment().add(1, 'day').hour(parseInt(time.split(':')[0])).minute(parseInt(time.split(':')[1]));
    
    await notificationService.scheduleNotification({
      id: `daily_standup_${projectId}`,
      projectId,
      title: 'Daily Standup Reminder',
      message: `Time for daily standup for "${project.name}"`,
      scheduledTime: tomorrow.toISOString(),
      isRecurring: true,
      recurringInterval: 24 * 60, // 24 hours
      type: 'project_reminder'
    });
  }

  async scheduleWeeklyProgressReport(projectId) {
    const project = await storageService.getProjectById(projectId);
    const nextFriday = moment().day(5).hour(17).minute(0); // Next Friday at 5 PM
    
    await notificationService.scheduleNotification({
      id: `weekly_report_${projectId}`,
      projectId,
      title: 'Weekly Progress Report',
      message: `Weekly progress report for "${project.name}" is ready`,
      scheduledTime: nextFriday.toISOString(),
      isRecurring: true,
      recurringInterval: 7 * 24 * 60, // 7 days
      type: 'project_report'
    });
  }

  async setupDeadlineAlerts(projectId, alertSettings) {
    const tasks = await storageService.getTasksByProject(projectId);
    
    for (const task of tasks) {
      if (task.dueDate) {
        // Alert 1 day before
        if (alertSettings.oneDayBefore) {
          const alertTime = moment(task.dueDate).subtract(1, 'day');
          await notificationService.scheduleNotification({
            id: `deadline_1day_${task.id}`,
            taskId: task.id,
            projectId,
            title: 'Task Due Tomorrow',
            message: `"${task.title}" is due tomorrow`,
            scheduledTime: alertTime.toISOString(),
            type: 'deadline_alert'
          });
        }

        // Alert 1 hour before
        if (alertSettings.oneHourBefore) {
          const alertTime = moment(task.dueDate).subtract(1, 'hour');
          await notificationService.scheduleNotification({
            id: `deadline_1hour_${task.id}`,
            taskId: task.id,
            projectId,
            title: 'Task Due Soon',
            message: `"${task.title}" is due in 1 hour`,
            scheduledTime: alertTime.toISOString(),
            type: 'deadline_alert'
          });
        }
      }
    }
  }

  async setupAutoStatusUpdates(projectId) {
    // This would typically be handled by a background service
    // For now, we'll set up periodic checks
    const project = await storageService.getProjectById(projectId);
    
    // Auto-complete project when all tasks are completed
    const tasks = await storageService.getTasksByProject(projectId);
    const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
    
    if (tasks.length > 0 && completedTasks.length === tasks.length && project.status !== 'completed') {
      await storageService.updateProject(projectId, {
        status: 'completed',
        progress: 100
      });
      
      await notificationService.sendImmediateNotification({
        title: 'Project Completed!',
        message: `Congratulations! "${project.name}" has been completed.`,
        projectId,
        type: 'project_completed'
      });
    }
  }

  // Project Collaboration (for future team features)
  async getProjectCollaborators(projectId) {
    // This would integrate with a user management system
    // For now, return empty array
    return [];
  }

  async addCollaborator(projectId, userId, role = 'member') {
    // Future implementation for team collaboration
    console.log(`Adding collaborator ${userId} to project ${projectId} with role ${role}`);
    return true;
  }

  async removeCollaborator(projectId, userId) {
    // Future implementation for team collaboration
    console.log(`Removing collaborator ${userId} from project ${projectId}`);
    return true;
  }

  // Project Export/Import
  async exportProject(projectId, format = 'json') {
    try {
      const project = await storageService.getProjectById(projectId);
      const tasks = await storageService.getTasksByProject(projectId);
      const timeEntries = await storageService.getTimeEntriesByProject(projectId);
      const analytics = await this.getProjectAnalytics(projectId);

      const exportData = {
        project: project.toJSON(),
        tasks: tasks.map(task => task.toJSON()),
        timeEntries: timeEntries.map(entry => entry.toJSON()),
        analytics,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      if (format === 'json') {
        return JSON.stringify(exportData, null, 2);
      } else if (format === 'csv') {
        return this.convertToCSV(exportData);
      }

      return exportData;
    } catch (error) {
      console.error('Export project error:', error);
      throw error;
    }
  }

  convertToCSV(data) {
    // Simple CSV conversion for tasks
    const headers = ['Task ID', 'Title', 'Status', 'Priority', 'Estimated Duration', 'Actual Time', 'Due Date'];
    const rows = [headers.join(',')];
    
    data.tasks.forEach(task => {
      const row = [
        task.id,
        `"${task.title}"`,
        task.status,
        task.priority,
        task.estimatedDuration || 0,
        task.timeSpent || 0,
        task.dueDate || ''
      ];
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  }

  async importProject(projectData) {
    try {
      const importedProject = await storageService.createProject(projectData.project);
      
      const importedTasks = [];
      for (const taskData of projectData.tasks) {
        const task = await storageService.createTask({
          ...taskData,
          projectId: importedProject.id
        });
        importedTasks.push(task);
      }

      return {
        project: importedProject,
        tasks: importedTasks
      };
    } catch (error) {
      console.error('Import project error:', error);
      throw error;
    }
  }

  // Event Listeners
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Project service listener callback error:', error);
      }
    });
  }
}

// Export singleton instance
export const projectService = new ProjectService();
export default projectService;