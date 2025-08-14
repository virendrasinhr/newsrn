import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';
import moment from 'moment';
import storageService from './storage';
import { NotificationType } from './types';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.scheduledNotifications = new Map();
    this.init();
  }

  async init() {
    try {
      // Configure push notifications
      PushNotification.configure({
        // Called when token is generated
        onRegister: function (token) {
          console.log('Push notification token:', token);
        },

        // Called when a remote or local notification is opened or received
        onNotification: function (notification) {
          console.log('Notification received:', notification);
          
          // Handle notification tap
          if (notification.userInteraction) {
            // User tapped on notification
            this.handleNotificationTap(notification);
          }

          // Required on iOS only
          if (Platform.OS === 'ios') {
            notification.finish(PushNotificationIOS.FetchResult.NoData);
          }
        }.bind(this),

        // Called when the user fails to register for remote notifications
        onRegistrationError: function(err) {
          console.error('Push notification registration error:', err.message, err);
        },

        // IOS ONLY (optional): default: all - Permissions to register
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },

        // Should the initial notification be popped automatically
        popInitialNotification: true,

        // (optional) default: true
        requestPermissions: Platform.OS === 'ios',
      });

      // Create notification channels for Android
      if (Platform.OS === 'android') {
        PushNotification.createChannel(
          {
            channelId: 'task-reminders',
            channelName: 'Task Reminders',
            channelDescription: 'Notifications for task reminders and alerts',
            playSound: true,
            soundName: 'default',
            importance: 4,
            vibrate: true,
          },
          (created) => console.log(`Task reminders channel created: ${created}`)
        );

        PushNotification.createChannel(
          {
            channelId: 'time-alerts',
            channelName: 'Time Alerts',
            channelDescription: 'Notifications for time up and timer alerts',
            playSound: true,
            soundName: 'default',
            importance: 4,
            vibrate: true,
          },
          (created) => console.log(`Time alerts channel created: ${created}`)
        );
      }

      // Load scheduled notifications from storage
      await this.loadScheduledNotifications();

      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Notification service initialization error:', error);
    }
  }

  async loadScheduledNotifications() {
    try {
      const notifications = await storageService.getAllNotifications();
      const activeNotifications = notifications.filter(n => n.isActive);
      
      for (const notification of activeNotifications) {
        this.scheduledNotifications.set(notification.id, notification);
      }
    } catch (error) {
      console.error('Load scheduled notifications error:', error);
    }
  }

  // Schedule a notification
  async scheduleNotification({
    id,
    taskId = null,
    projectId = null,
    title,
    message,
    scheduledTime,
    type = NotificationType.TASK_DUE,
    isRecurring = false,
    recurringInterval = null,
    data = {}
  }) {
    try {
      if (!this.isInitialized) {
        console.warn('Notification service not initialized yet');
        return false;
      }

      const notificationTime = moment(scheduledTime);
      const now = moment();

      // Don't schedule notifications in the past
      if (notificationTime.isBefore(now)) {
        console.warn('Cannot schedule notification in the past');
        return false;
      }

      // Cancel existing notification with same ID
      await this.cancelNotification(id);

      // Create notification object
      const notificationData = {
        id,
        taskId,
        projectId,
        type,
        title,
        message,
        scheduledTime: notificationTime.toISOString(),
        isRecurring,
        recurringInterval,
        isActive: true,
        data
      };

      // Schedule the notification
      PushNotification.localNotificationSchedule({
        id: id,
        title: title,
        message: message,
        date: notificationTime.toDate(),
        playSound: true,
        soundName: 'default',
        vibrate: true,
        vibration: 300,
        channelId: type === NotificationType.TIME_UP ? 'time-alerts' : 'task-reminders',
        userInfo: {
          id,
          taskId,
          projectId,
          type,
          ...data
        },
        repeatType: isRecurring ? this.getRepeatType(recurringInterval) : undefined,
      });

      // Store in memory and persistent storage
      this.scheduledNotifications.set(id, notificationData);
      await storageService.createNotification(notificationData);

      console.log(`Notification scheduled: ${title} at ${notificationTime.format('YYYY-MM-DD HH:mm')}`);
      return true;
    } catch (error) {
      console.error('Schedule notification error:', error);
      return false;
    }
  }

  // Send immediate notification
  async sendImmediateNotification({
    title,
    message,
    taskId = null,
    projectId = null,
    type = NotificationType.TASK_DUE,
    data = {}
  }) {
    try {
      if (!this.isInitialized) {
        console.warn('Notification service not initialized yet');
        return false;
      }

      const settings = await storageService.getSettings();
      
      if (!settings.notifications.enabled) {
        console.log('Notifications are disabled');
        return false;
      }

      PushNotification.localNotification({
        title: title,
        message: message,
        playSound: settings.notifications.soundEnabled,
        soundName: 'default',
        vibrate: settings.notifications.vibrationEnabled,
        vibration: 300,
        channelId: type === NotificationType.TIME_UP ? 'time-alerts' : 'task-reminders',
        userInfo: {
          taskId,
          projectId,
          type,
          timestamp: new Date().toISOString(),
          ...data
        }
      });

      console.log(`Immediate notification sent: ${title}`);
      return true;
    } catch (error) {
      console.error('Send immediate notification error:', error);
      return false;
    }
  }

  // Cancel a scheduled notification
  async cancelNotification(notificationId) {
    try {
      // Cancel from system
      PushNotification.cancelLocalNotifications({ id: notificationId });

      // Remove from memory and storage
      this.scheduledNotifications.delete(notificationId);
      
      const notifications = await storageService.getAllNotifications();
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        await storageService.updateNotification(notificationId, { isActive: false });
      }

      console.log(`Notification cancelled: ${notificationId}`);
      return true;
    } catch (error) {
      console.error('Cancel notification error:', error);
      return false;
    }
  }

  // Cancel all notifications for a task
  async cancelTaskNotifications(taskId) {
    try {
      const notifications = await storageService.getAllNotifications();
      const taskNotifications = notifications.filter(n => n.taskId === taskId && n.isActive);

      for (const notification of taskNotifications) {
        await this.cancelNotification(notification.id);
      }

      console.log(`Cancelled ${taskNotifications.length} notifications for task ${taskId}`);
      return true;
    } catch (error) {
      console.error('Cancel task notifications error:', error);
      return false;
    }
  }

  // Cancel all notifications for a project
  async cancelProjectNotifications(projectId) {
    try {
      const notifications = await storageService.getAllNotifications();
      const projectNotifications = notifications.filter(n => n.projectId === projectId && n.isActive);

      for (const notification of projectNotifications) {
        await this.cancelNotification(notification.id);
      }

      console.log(`Cancelled ${projectNotifications.length} notifications for project ${projectId}`);
      return true;
    } catch (error) {
      console.error('Cancel project notifications error:', error);
      return false;
    }
  }

  // Schedule task-specific notifications
  async scheduleTaskStartNotification(taskId, startTime) {
    try {
      const task = await storageService.getTaskById(taskId);
      if (!task) return false;

      const notificationId = `task_start_${taskId}`;
      const scheduledTime = moment(startTime).subtract(15, 'minutes'); // 15 minutes before start

      return await this.scheduleNotification({
        id: notificationId,
        taskId,
        projectId: task.projectId,
        title: 'Task Starting Soon',
        message: `"${task.title}" is scheduled to start in 15 minutes`,
        scheduledTime: scheduledTime.toISOString(),
        type: NotificationType.TASK_START,
        data: { taskId, startTime }
      });
    } catch (error) {
      console.error('Schedule task start notification error:', error);
      return false;
    }
  }

  async scheduleTaskDueNotification(taskId, dueDate) {
    try {
      const task = await storageService.getTaskById(taskId);
      if (!task) return false;

      const notificationId = `task_due_${taskId}`;
      const scheduledTime = moment(dueDate).subtract(1, 'hour'); // 1 hour before due

      return await this.scheduleNotification({
        id: notificationId,
        taskId,
        projectId: task.projectId,
        title: 'Task Due Soon',
        message: `"${task.title}" is due in 1 hour`,
        scheduledTime: scheduledTime.toISOString(),
        type: NotificationType.TASK_DUE,
        data: { taskId, dueDate }
      });
    } catch (error) {
      console.error('Schedule task due notification error:', error);
      return false;
    }
  }

  async scheduleProjectDeadlineNotification(projectId, deadline) {
    try {
      const project = await storageService.getProjectById(projectId);
      if (!project) return false;

      const notificationId = `project_deadline_${projectId}`;
      const scheduledTime = moment(deadline).subtract(24, 'hours'); // 24 hours before deadline

      return await this.scheduleNotification({
        id: notificationId,
        projectId,
        title: 'Project Deadline Approaching',
        message: `"${project.name}" deadline is tomorrow`,
        scheduledTime: scheduledTime.toISOString(),
        type: NotificationType.PROJECT_DEADLINE,
        data: { projectId, deadline }
      });
    } catch (error) {
      console.error('Schedule project deadline notification error:', error);
      return false;
    }
  }

  // Handle notification tap
  handleNotificationTap(notification) {
    try {
      const { taskId, projectId, type } = notification.userInfo || {};
      
      console.log('Notification tapped:', { taskId, projectId, type });

      // Emit event for app to handle navigation
      this.emit('notificationTapped', {
        taskId,
        projectId,
        type,
        notification
      });
    } catch (error) {
      console.error('Handle notification tap error:', error);
    }
  }

  // Daily task reminders
  async scheduleDailyTaskReminders() {
    try {
      const tasks = await storageService.getTasksByStatus('pending');
      const settings = await storageService.getSettings();
      
      if (!settings.notifications.enabled) {
        return false;
      }

      // Schedule reminder for tomorrow morning
      const tomorrow = moment().add(1, 'day').hour(9).minute(0).second(0);
      
      const pendingTasksCount = tasks.length;
      if (pendingTasksCount > 0) {
        await this.scheduleNotification({
          id: 'daily_reminder',
          title: 'Daily Task Reminder',
          message: `You have ${pendingTasksCount} pending tasks for today`,
          scheduledTime: tomorrow.toISOString(),
          type: NotificationType.TASK_DUE,
          isRecurring: true,
          recurringInterval: 24 * 60, // 24 hours in minutes
          data: { pendingTasksCount }
        });
      }

      return true;
    } catch (error) {
      console.error('Schedule daily task reminders error:', error);
      return false;
    }
  }

  // Utility methods
  getRepeatType(intervalMinutes) {
    if (!intervalMinutes) return undefined;
    
    const hours = intervalMinutes / 60;
    const days = hours / 24;
    
    if (days >= 7) return 'week';
    if (days >= 1) return 'day';
    if (hours >= 1) return 'hour';
    return 'minute';
  }

  // Get all scheduled notifications
  getScheduledNotifications() {
    return Array.from(this.scheduledNotifications.values());
  }

  // Clear all notifications
  async clearAllNotifications() {
    try {
      PushNotification.cancelAllLocalNotifications();
      this.scheduledNotifications.clear();
      
      // Mark all notifications as inactive in storage
      const notifications = await storageService.getAllNotifications();
      for (const notification of notifications) {
        if (notification.isActive) {
          await storageService.updateNotification(notification.id, { isActive: false });
        }
      }

      console.log('All notifications cleared');
      return true;
    } catch (error) {
      console.error('Clear all notifications error:', error);
      return false;
    }
  }

  // Check and update notification permissions
  async checkPermissions() {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        console.log('Notification permissions:', permissions);
        resolve(permissions);
      });
    });
  }

  async requestPermissions() {
    return new Promise((resolve) => {
      PushNotification.requestPermissions()
        .then((permissions) => {
          console.log('Notification permissions granted:', permissions);
          resolve(permissions);
        })
        .catch((error) => {
          console.error('Notification permissions denied:', error);
          resolve(null);
        });
    });
  }

  // Event emitter functionality
  listeners = new Set();

  emit(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Notification listener callback error:', error);
      }
    });
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Cleanup
  cleanup() {
    this.clearAllNotifications();
    this.listeners.clear();
  }

  // Background task scheduling (for when app is closed)
  async scheduleBackgroundNotificationCheck() {
    try {
      // This would typically be handled by a background task
      // For now, we'll just ensure notifications are properly scheduled
      const tasks = await storageService.getAllTasks();
      const now = moment();

      for (const task of tasks) {
        // Check for overdue tasks
        if (task.dueDate && moment(task.dueDate).isBefore(now) && task.status !== 'completed') {
          await this.sendImmediateNotification({
            title: 'Task Overdue',
            message: `"${task.title}" is overdue`,
            taskId: task.id,
            type: NotificationType.TASK_DUE
          });
        }

        // Check for tasks starting soon
        if (task.startTime && moment(task.startTime).subtract(15, 'minutes').isBefore(now) 
            && moment(task.startTime).isAfter(now)) {
          await this.sendImmediateNotification({
            title: 'Task Starting Soon',
            message: `"${task.title}" starts in 15 minutes`,
            taskId: task.id,
            type: NotificationType.TASK_START
          });
        }
      }
    } catch (error) {
      console.error('Background notification check error:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;