import BackgroundTimer from 'react-native-background-timer';
import moment from 'moment';
import storageService from './storage';
import { TaskStatus, TimeEntry } from './types';
import { notificationService } from './notifications';

class TimeTrackerService {
  constructor() {
    this.activeTimers = new Map();
    this.timerInterval = null;
    this.listeners = new Set();
    this.init();
  }

  async init() {
    // Restore active timers from storage on app start
    try {
      const activeTimers = await storageService.getActiveTimers();
      const now = moment();

      for (const [taskId, timerData] of Object.entries(activeTimers)) {
        const startTime = moment(timerData.startTime);
        const elapsedTime = now.diff(startTime, 'minutes');
        
        this.activeTimers.set(taskId, {
          ...timerData,
          elapsedTime: elapsedTime
        });

        // Update task with current time
        await this.updateTaskTimeSpent(taskId, elapsedTime);
      }

      this.startTimerUpdates();
    } catch (error) {
      console.error('TimeTracker init error:', error);
    }
  }

  // Timer Management
  async startTimer(taskId) {
    try {
      const task = await storageService.getTaskById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Stop any other running timer for this task
      if (this.activeTimers.has(taskId)) {
        await this.stopTimer(taskId);
      }

      const startTime = moment();
      const timerData = {
        taskId: taskId,
        projectId: task.projectId,
        startTime: startTime.toISOString(),
        elapsedTime: 0,
        isRunning: true
      };

      this.activeTimers.set(taskId, timerData);
      
      // Update task status and timer info
      await storageService.updateTask(taskId, {
        status: TaskStatus.IN_PROGRESS,
        isTimerRunning: true,
        timerStartTime: startTime.toISOString()
      });

      // Save to persistent storage
      await storageService.setActiveTimer(taskId, timerData);

      // Start background timer if not already running
      if (!this.timerInterval) {
        this.startTimerUpdates();
      }

      // Schedule notifications if task has estimated duration
      if (task.estimatedDuration) {
        await this.scheduleTimeUpNotification(taskId, task.estimatedDuration);
      }

      this.notifyListeners('timerStarted', { taskId, task });
      return true;
    } catch (error) {
      console.error('Start timer error:', error);
      return false;
    }
  }

  async stopTimer(taskId) {
    try {
      const timerData = this.activeTimers.get(taskId);
      if (!timerData) {
        return false;
      }

      const endTime = moment();
      const startTime = moment(timerData.startTime);
      const totalMinutes = endTime.diff(startTime, 'minutes');

      // Create time entry
      const timeEntry = await storageService.createTimeEntry({
        taskId: taskId,
        projectId: timerData.projectId,
        startTime: timerData.startTime,
        endTime: endTime.toISOString(),
        duration: totalMinutes,
        description: `Timer session: ${totalMinutes} minutes`
      });

      // Update task
      const task = await storageService.getTaskById(taskId);
      const newTimeSpent = (task.timeSpent || 0) + totalMinutes;
      
      await storageService.updateTask(taskId, {
        timeSpent: newTimeSpent,
        isTimerRunning: false,
        timerStartTime: null
      });

      // Remove from active timers
      this.activeTimers.delete(taskId);
      await storageService.removeActiveTimer(taskId);

      // Cancel scheduled notifications
      await this.cancelScheduledNotifications(taskId);

      // Stop timer updates if no active timers
      if (this.activeTimers.size === 0) {
        this.stopTimerUpdates();
      }

      this.notifyListeners('timerStopped', { taskId, timeEntry, totalMinutes });
      return { timeEntry, totalMinutes };
    } catch (error) {
      console.error('Stop timer error:', error);
      return false;
    }
  }

  async pauseTimer(taskId) {
    try {
      const timerData = this.activeTimers.get(taskId);
      if (!timerData || !timerData.isRunning) {
        return false;
      }

      // Calculate elapsed time and update
      const now = moment();
      const startTime = moment(timerData.startTime);
      const elapsedTime = now.diff(startTime, 'minutes');

      const updatedTimerData = {
        ...timerData,
        elapsedTime: elapsedTime,
        isRunning: false,
        pausedAt: now.toISOString()
      };

      this.activeTimers.set(taskId, updatedTimerData);
      await storageService.setActiveTimer(taskId, updatedTimerData);

      // Update task
      await storageService.updateTask(taskId, {
        isTimerRunning: false,
        timeSpent: (await storageService.getTaskById(taskId)).timeSpent + elapsedTime
      });

      this.notifyListeners('timerPaused', { taskId, elapsedTime });
      return true;
    } catch (error) {
      console.error('Pause timer error:', error);
      return false;
    }
  }

  async resumeTimer(taskId) {
    try {
      const timerData = this.activeTimers.get(taskId);
      if (!timerData || timerData.isRunning) {
        return false;
      }

      const now = moment();
      const updatedTimerData = {
        ...timerData,
        startTime: now.toISOString(),
        isRunning: true,
        pausedAt: null
      };

      this.activeTimers.set(taskId, updatedTimerData);
      await storageService.setActiveTimer(taskId, updatedTimerData);

      // Update task
      await storageService.updateTask(taskId, {
        isTimerRunning: true,
        timerStartTime: now.toISOString()
      });

      // Restart timer updates if needed
      if (!this.timerInterval) {
        this.startTimerUpdates();
      }

      this.notifyListeners('timerResumed', { taskId });
      return true;
    } catch (error) {
      console.error('Resume timer error:', error);
      return false;
    }
  }

  // Timer Updates
  startTimerUpdates() {
    if (this.timerInterval) {
      return;
    }

    this.timerInterval = BackgroundTimer.setInterval(() => {
      this.updateActiveTimers();
    }, 60000); // Update every minute
  }

  stopTimerUpdates() {
    if (this.timerInterval) {
      BackgroundTimer.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  async updateActiveTimers() {
    const now = moment();
    
    for (const [taskId, timerData] of this.activeTimers.entries()) {
      if (!timerData.isRunning) continue;

      const startTime = moment(timerData.startTime);
      const elapsedTime = now.diff(startTime, 'minutes');

      // Update timer data
      const updatedTimerData = {
        ...timerData,
        elapsedTime: elapsedTime
      };
      
      this.activeTimers.set(taskId, updatedTimerData);
      await storageService.setActiveTimer(taskId, updatedTimerData);

      // Update task time spent
      await this.updateTaskTimeSpent(taskId, elapsedTime);

      // Check for time up notifications
      const task = await storageService.getTaskById(taskId);
      if (task && task.estimatedDuration && elapsedTime >= task.estimatedDuration) {
        await this.handleTimeUp(taskId, task);
      }
    }

    this.notifyListeners('timersUpdated', { activeTimers: this.activeTimers });
  }

  async updateTaskTimeSpent(taskId, additionalMinutes) {
    try {
      const task = await storageService.getTaskById(taskId);
      if (task) {
        const baseTimeSpent = task.timeSpent || 0;
        const currentTimerTime = this.activeTimers.has(taskId) ? 
          this.activeTimers.get(taskId).elapsedTime || 0 : 0;
        
        await storageService.updateTask(taskId, {
          timeSpent: baseTimeSpent + currentTimerTime
        });
      }
    } catch (error) {
      console.error('Update task time spent error:', error);
    }
  }

  // Notification Handling
  async scheduleTimeUpNotification(taskId, estimatedDuration) {
    try {
      const task = await storageService.getTaskById(taskId);
      if (!task) return;

      const notificationTime = moment().add(estimatedDuration, 'minutes');
      
      await notificationService.scheduleNotification({
        id: `time_up_${taskId}`,
        taskId: taskId,
        title: 'Time Up!',
        message: `Estimated time for "${task.title}" has elapsed`,
        scheduledTime: notificationTime.toISOString(),
        type: 'time_up'
      });
    } catch (error) {
      console.error('Schedule time up notification error:', error);
    }
  }

  async cancelScheduledNotifications(taskId) {
    try {
      await notificationService.cancelNotification(`time_up_${taskId}`);
    } catch (error) {
      console.error('Cancel scheduled notifications error:', error);
    }
  }

  async handleTimeUp(taskId, task) {
    try {
      // Send immediate notification
      await notificationService.sendImmediateNotification({
        title: 'Time Up!',
        message: `Estimated time for "${task.title}" has elapsed`,
        data: { taskId, type: 'time_up' }
      });

      // Update task status if needed
      if (task.status !== TaskStatus.OVERDUE) {
        await storageService.updateTask(taskId, {
          status: TaskStatus.OVERDUE
        });
      }

      this.notifyListeners('timeUp', { taskId, task });
    } catch (error) {
      console.error('Handle time up error:', error);
    }
  }

  // Getters
  getActiveTimer(taskId) {
    return this.activeTimers.get(taskId) || null;
  }

  getAllActiveTimers() {
    return Array.from(this.activeTimers.entries()).map(([taskId, timerData]) => ({
      taskId,
      ...timerData
    }));
  }

  isTimerRunning(taskId) {
    const timer = this.activeTimers.get(taskId);
    return timer ? timer.isRunning : false;
  }

  getCurrentElapsedTime(taskId) {
    const timer = this.activeTimers.get(taskId);
    if (!timer || !timer.isRunning) {
      return timer ? timer.elapsedTime : 0;
    }

    const now = moment();
    const startTime = moment(timer.startTime);
    return now.diff(startTime, 'minutes');
  }

  // Statistics
  async getTaskTimeStatistics(taskId) {
    try {
      const timeEntries = await storageService.getTimeEntriesByTask(taskId);
      const task = await storageService.getTaskById(taskId);
      
      const totalTime = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
      const currentSessionTime = this.getCurrentElapsedTime(taskId);
      const totalTimeWithCurrent = totalTime + currentSessionTime;

      return {
        totalTime: totalTimeWithCurrent,
        sessionsCount: timeEntries.length + (currentSessionTime > 0 ? 1 : 0),
        estimatedTime: task ? task.estimatedDuration : 0,
        remainingTime: task && task.estimatedDuration ? 
          Math.max(0, task.estimatedDuration - totalTimeWithCurrent) : 0,
        isOvertime: task && task.estimatedDuration ? 
          totalTimeWithCurrent > task.estimatedDuration : false,
        currentSessionTime: currentSessionTime,
        timeEntries: timeEntries
      };
    } catch (error) {
      console.error('Get task time statistics error:', error);
      return null;
    }
  }

  async getProjectTimeStatistics(projectId) {
    try {
      const tasks = await storageService.getTasksByProject(projectId);
      const timeEntries = await storageService.getTimeEntriesByProject(projectId);
      
      const totalTime = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
      const estimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0);
      
      // Add current active timer times
      let activeTimerTime = 0;
      for (const task of tasks) {
        activeTimerTime += this.getCurrentElapsedTime(task.id);
      }

      const totalTimeWithActive = totalTime + activeTimerTime;

      return {
        totalTime: totalTimeWithActive,
        estimatedTime: estimatedTime,
        remainingTime: Math.max(0, estimatedTime - totalTimeWithActive),
        isOvertime: totalTimeWithActive > estimatedTime,
        tasksCount: tasks.length,
        completedTasksCount: tasks.filter(task => task.status === TaskStatus.COMPLETED).length,
        activeTimersCount: tasks.filter(task => this.isTimerRunning(task.id)).length
      };
    } catch (error) {
      console.error('Get project time statistics error:', error);
      return null;
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
        console.error('Listener callback error:', error);
      }
    });
  }

  // Cleanup
  async cleanup() {
    // Stop all active timers
    const activeTimerIds = Array.from(this.activeTimers.keys());
    for (const taskId of activeTimerIds) {
      await this.stopTimer(taskId);
    }

    this.stopTimerUpdates();
    this.listeners.clear();
  }

  // Utility Methods
  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  formatTimeDetailed(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const seconds = Math.floor((minutes % 1) * 60);
    
    return {
      hours,
      minutes: mins,
      seconds,
      formatted: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  }
}

// Export singleton instance
export const timeTrackerService = new TimeTrackerService();
export default timeTrackerService;