// Task Management Types and Models

export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  OVERDUE: 'overdue'
};

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const NotificationType = {
  TASK_START: 'task_start',
  TASK_DUE: 'task_due',
  TIME_UP: 'time_up',
  PROJECT_DEADLINE: 'project_deadline'
};

// Task Model
export class Task {
  constructor({
    id = null,
    title = '',
    description = '',
    projectId = null,
    status = TaskStatus.PENDING,
    priority = TaskPriority.MEDIUM,
    startTime = null,
    endTime = null,
    dueDate = null,
    estimatedDuration = null, // in minutes
    actualDuration = 0, // in minutes
    timeSpent = 0, // in minutes
    isTimerRunning = false,
    timerStartTime = null,
    notifications = [],
    tags = [],
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id || this.generateId();
    this.title = title;
    this.description = description;
    this.projectId = projectId;
    this.status = status;
    this.priority = priority;
    this.startTime = startTime;
    this.endTime = endTime;
    this.dueDate = dueDate;
    this.estimatedDuration = estimatedDuration;
    this.actualDuration = actualDuration;
    this.timeSpent = timeSpent;
    this.isTimerRunning = isTimerRunning;
    this.timerStartTime = timerStartTime;
    this.notifications = notifications;
    this.tags = tags;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      projectId: this.projectId,
      status: this.status,
      priority: this.priority,
      startTime: this.startTime,
      endTime: this.endTime,
      dueDate: this.dueDate,
      estimatedDuration: this.estimatedDuration,
      actualDuration: this.actualDuration,
      timeSpent: this.timeSpent,
      isTimerRunning: this.isTimerRunning,
      timerStartTime: this.timerStartTime,
      notifications: this.notifications,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Project Model
export class Project {
  constructor({
    id = null,
    name = '',
    description = '',
    color = '#007AFF',
    startDate = null,
    endDate = null,
    status = 'active',
    tasks = [],
    totalEstimatedTime = 0,
    totalActualTime = 0,
    progress = 0,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id || this.generateId();
    this.name = name;
    this.description = description;
    this.color = color;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.tasks = tasks;
    this.totalEstimatedTime = totalEstimatedTime;
    this.totalActualTime = totalActualTime;
    this.progress = progress;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  generateId() {
    return 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      color: this.color,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
      tasks: this.tasks,
      totalEstimatedTime: this.totalEstimatedTime,
      totalActualTime: this.totalActualTime,
      progress: this.progress,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Notification Model
export class TaskNotification {
  constructor({
    id = null,
    taskId = null,
    projectId = null,
    type = NotificationType.TASK_DUE,
    title = '',
    message = '',
    scheduledTime = null,
    isRecurring = false,
    recurringInterval = null, // in minutes
    isActive = true,
    createdAt = new Date().toISOString()
  }) {
    this.id = id || this.generateId();
    this.taskId = taskId;
    this.projectId = projectId;
    this.type = type;
    this.title = title;
    this.message = message;
    this.scheduledTime = scheduledTime;
    this.isRecurring = isRecurring;
    this.recurringInterval = recurringInterval;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }

  generateId() {
    return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      taskId: this.taskId,
      projectId: this.projectId,
      type: this.type,
      title: this.title,
      message: this.message,
      scheduledTime: this.scheduledTime,
      isRecurring: this.isRecurring,
      recurringInterval: this.recurringInterval,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }
}

// Time Entry Model for detailed time tracking
export class TimeEntry {
  constructor({
    id = null,
    taskId = null,
    projectId = null,
    startTime = null,
    endTime = null,
    duration = 0, // in minutes
    description = '',
    createdAt = new Date().toISOString()
  }) {
    this.id = id || this.generateId();
    this.taskId = taskId;
    this.projectId = projectId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.duration = duration;
    this.description = description;
    this.createdAt = createdAt;
  }

  generateId() {
    return 'time_entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      taskId: this.taskId,
      projectId: this.projectId,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      description: this.description,
      createdAt: this.createdAt
    };
  }
}