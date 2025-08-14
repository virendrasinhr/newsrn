import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import moment from 'moment';

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.listeners = new Set();
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('task-reminders', {
          name: 'Task Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        await Notifications.setNotificationChannelAsync('time-alerts', {
          name: 'Time Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF9800',
        });
      }

      // Add notification received listener
      this.notificationListener = Notifications.addNotificationReceivedListener(
        this.handleNotificationReceived.bind(this)
      );

      // Add notification response listener (when user taps notification)
      this.responseListener = Notifications.addNotificationResponseReceivedListener(
        this.handleNotificationResponse.bind(this)
      );

      this.isInitialized = true;
      console.log('Notification service initialized');
      return true;
    } catch (error) {
      console.error('Notification service initialization error:', error);
      return false;
    }
  }

  async scheduleNotification({ identifier, content, trigger }) {
    try {
      await this.init();

      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: content.title,
          body: content.body,
          data: content.data || {},
          sound: true,
        },
        trigger: trigger || null, // null for immediate notification
      });

      console.log(`Notification scheduled: ${content.title} (ID: ${notificationId})`);
      return notificationId;
    } catch (error) {
      console.error('Schedule notification error:', error);
      return null;
    }
  }

  async cancelScheduledNotification(identifier) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log(`Notification cancelled: ${identifier}`);
      return true;
    } catch (error) {
      console.error('Cancel notification error:', error);
      return false;
    }
  }

  async cancelAllScheduledNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All scheduled notifications cancelled');
      return true;
    } catch (error) {
      console.error('Cancel all notifications error:', error);
      return false;
    }
  }

  // Task-specific notification helpers
  async scheduleTaskStartNotification(taskId, taskTitle, startTime) {
    try {
      const scheduledTime = moment(startTime).subtract(15, 'minutes'); // 15 minutes before start
      
      if (scheduledTime.isBefore(moment())) {
        console.log('Task start time is in the past, skipping notification');
        return null;
      }

      return await this.scheduleNotification({
        identifier: `task_start_${taskId}`,
        content: {
          title: 'Task Starting Soon',
          body: `"${taskTitle}" is scheduled to start in 15 minutes`,
          data: { taskId, type: 'task_start', startTime }
        },
        trigger: {
          date: scheduledTime.toDate()
        }
      });
    } catch (error) {
      console.error('Schedule task start notification error:', error);
      return null;
    }
  }

  async scheduleTaskDueNotification(taskId, taskTitle, dueDate) {
    try {
      const scheduledTime = moment(dueDate).subtract(1, 'hour'); // 1 hour before due
      
      if (scheduledTime.isBefore(moment())) {
        console.log('Task due time is in the past, skipping notification');
        return null;
      }

      return await this.scheduleNotification({
        identifier: `task_due_${taskId}`,
        content: {
          title: 'Task Due Soon',
          body: `"${taskTitle}" is due in 1 hour`,
          data: { taskId, type: 'task_due', dueDate }
        },
        trigger: {
          date: scheduledTime.toDate()
        }
      });
    } catch (error) {
      console.error('Schedule task due notification error:', error);
      return null;
    }
  }

  async scheduleTimeUpNotification(taskId, taskTitle, estimatedDuration) {
    try {
      const scheduledTime = moment().add(estimatedDuration, 'minutes');

      return await this.scheduleNotification({
        identifier: `time_up_${taskId}`,
        content: {
          title: 'Time Up!',
          body: `Estimated time for "${taskTitle}" has elapsed`,
          data: { taskId, type: 'time_up', estimatedDuration }
        },
        trigger: {
          date: scheduledTime.toDate()
        }
      });
    } catch (error) {
      console.error('Schedule time up notification error:', error);
      return null;
    }
  }

  async scheduleProjectDeadlineNotification(projectId, projectName, deadline) {
    try {
      const scheduledTime = moment(deadline).subtract(24, 'hours'); // 24 hours before deadline
      
      if (scheduledTime.isBefore(moment())) {
        console.log('Project deadline is in the past, skipping notification');
        return null;
      }

      return await this.scheduleNotification({
        identifier: `project_deadline_${projectId}`,
        content: {
          title: 'Project Deadline Approaching',
          body: `"${projectName}" deadline is tomorrow`,
          data: { projectId, type: 'project_deadline', deadline }
        },
        trigger: {
          date: scheduledTime.toDate()
        }
      });
    } catch (error) {
      console.error('Schedule project deadline notification error:', error);
      return null;
    }
  }

  async scheduleDailyReminder(taskCount = 0) {
    try {
      if (taskCount === 0) return null;

      const tomorrow = moment().add(1, 'day').hour(9).minute(0).second(0);

      return await this.scheduleNotification({
        identifier: 'daily_reminder',
        content: {
          title: 'Daily Task Reminder',
          body: `You have ${taskCount} pending tasks for today`,
          data: { type: 'daily_reminder', taskCount }
        },
        trigger: {
          date: tomorrow.toDate(),
          repeats: true
        }
      });
    } catch (error) {
      console.error('Schedule daily reminder error:', error);
      return null;
    }
  }

  // Immediate notifications
  async sendImmediateNotification(title, body, data = {}) {
    try {
      return await this.scheduleNotification({
        identifier: `immediate_${Date.now()}`,
        content: {
          title,
          body,
          data
        },
        trigger: null // Immediate
      });
    } catch (error) {
      console.error('Send immediate notification error:', error);
      return null;
    }
  }

  // Notification handlers
  handleNotificationReceived(notification) {
    console.log('Notification received:', notification);
    this.notifyListeners('notificationReceived', notification);
  }

  handleNotificationResponse(response) {
    console.log('Notification tapped:', response);
    
    const data = response.notification.request.content.data;
    if (data && data.type) {
      this.notifyListeners('notificationTapped', {
        type: data.type,
        taskId: data.taskId,
        projectId: data.projectId,
        data: data
      });
    }
  }

  // Get scheduled notifications
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Get scheduled notifications error:', error);
      return [];
    }
  }

  // Permission helpers
  async checkPermissions() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Check permissions error:', error);
      return false;
    }
  }

  async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Request permissions error:', error);
      return false;
    }
  }

  // Event listeners
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Notification listener callback error:', error);
      }
    });
  }

  // Cleanup
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    this.listeners.clear();
    console.log('Notification service cleaned up');
  }

  // Utility methods
  async getBadgeCount() {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Get badge count error:', error);
      return 0;
    }
  }

  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
      return true;
    } catch (error) {
      console.error('Set badge count error:', error);
      return false;
    }
  }

  async clearBadge() {
    try {
      await Notifications.setBadgeCountAsync(0);
      return true;
    } catch (error) {
      console.error('Clear badge error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;