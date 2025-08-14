# Task Management System

A comprehensive React Native task management application with offline functionality, time tracking, notifications, and project organization.

## Features

### ✅ Core Task Management
- **Task CRUD Operations**: Create, read, update, and delete tasks
- **Task Status Management**: Pending, In Progress, Completed, Cancelled, Overdue
- **Priority System**: Low, Medium, High, Urgent priority levels
- **Due Dates & Start Times**: Schedule tasks with specific timing
- **Task Dependencies**: Link tasks to projects
- **Tags & Categories**: Organize tasks with custom tags

### ⏱️ Time Tracking
- **Built-in Timer**: Start/stop/pause timers for tasks
- **Automatic Time Logging**: Track time spent on each task
- **Background Tracking**: Timers continue running in background
- **Time Statistics**: Detailed time analytics per task and project
- **Estimated vs Actual Time**: Compare planned vs actual time spent
- **Time Entries**: Detailed log of all time tracking sessions

### 🔔 Smart Notifications
- **Task Reminders**: Notifications for task start times and due dates
- **Time Up Alerts**: Notifications when estimated time is exceeded
- **Daily Summaries**: Daily task overview notifications
- **Project Deadlines**: Alerts for approaching project deadlines
- **Offline Notifications**: Works even when app is closed
- **Customizable Settings**: Configure notification preferences

### 📁 Project Management
- **Project Organization**: Group tasks by projects
- **Project Templates**: Pre-built templates for common project types
- **Progress Tracking**: Visual progress indicators
- **Project Analytics**: Comprehensive project statistics
- **Timeline Management**: Track project deadlines and milestones
- **Team Collaboration**: (Framework ready for team features)

### 📱 Offline Functionality
- **Local Storage**: All data stored locally using AsyncStorage
- **Offline-First**: Works completely offline
- **Data Persistence**: No data loss when app is closed
- **Background Services**: Time tracking continues in background
- **Export/Import**: Backup and restore data

### 📊 Analytics & Reports
- **Task Statistics**: Completion rates, time efficiency
- **Project Health Scores**: Overall project performance metrics
- **Time Analytics**: Detailed time tracking reports
- **Productivity Insights**: Personal productivity metrics
- **Visual Charts**: (Ready for chart integration)

## Technical Architecture

### 🏗️ Technology Stack
- **React Native 0.69.7**: Mobile app framework
- **Redux Toolkit**: State management
- **AsyncStorage**: Local data persistence
- **React Navigation 6**: Navigation system
- **Moment.js**: Date/time handling
- **React Native Push Notifications**: Local notifications
- **Background Timer**: Background time tracking

### 📦 Project Structure
```
app/
├── common/
│   ├── types.js              # Data models and types
│   ├── storage.js            # AsyncStorage service
│   ├── timeTracker.js        # Time tracking service
│   ├── notifications.js     # Notification service
│   └── projectService.js    # Project management service
├── store/
│   ├── store.js             # Redux store configuration
│   ├── taskSlice.js         # Task state management
│   └── projectSlice.js      # Project state management
└── screens/
    ├── TaskDashboard.js     # Main dashboard
    ├── TaskList.js          # Task listing
    ├── CreateTask.js        # Task creation
    ├── TaskDetail.js        # Task details
    ├── ProjectList.js       # Project listing
    ├── CreateProject.js     # Project creation
    ├── ProjectDetail.js     # Project details
    ├── TimeTracking.js      # Time tracking interface
    ├── Reports.js           # Analytics dashboard
    └── Settings.js          # App settings
```

### 🔧 Core Services

#### Storage Service (`storage.js`)
- Handles all local data persistence
- Provides CRUD operations for tasks, projects, time entries
- Manages data relationships and integrity
- Supports data export/import functionality

#### Time Tracker Service (`timeTracker.js`)
- Real-time timer management
- Background time tracking
- Automatic time calculations
- Integration with notification system
- Persistent timer state across app restarts

#### Notification Service (`notifications.js`)
- Local push notifications
- Scheduled notifications for tasks and projects
- Background notification handling
- Customizable notification preferences
- Deep linking support for notification taps

#### Project Service (`projectService.js`)
- Advanced project analytics
- Project templates and automation
- Health score calculations
- Export/import functionality
- Team collaboration framework

### 🎨 UI Components

#### TaskDashboard
- Overview of all tasks and projects
- Active timer display
- Quick action buttons
- Today's schedule
- Overdue task alerts
- Project statistics

#### Navigation System
- Tab-based navigation with 5 main sections
- Stack navigation for detailed views
- Consistent header styling
- Deep linking support

## Installation & Setup

### Prerequisites
- Node.js 14+
- React Native development environment
- Android Studio / Xcode for device testing

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **iOS Setup** (if targeting iOS)
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Run the Application**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

### Required Permissions

#### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

#### iOS (`ios/[ProjectName]/Info.plist`)
```xml
<key>UIBackgroundModes</key>
<array>
    <string>background-processing</string>
    <string>background-fetch</string>
</array>
```

## Usage Guide

### Creating Tasks
1. Navigate to Tasks tab
2. Tap the "+" button or "Add Task" quick action
3. Fill in task details:
   - Title and description
   - Priority level
   - Due date and start time
   - Estimated duration
   - Project assignment
   - Tags

### Time Tracking
1. Start timer from task dashboard or task detail view
2. Timer runs in background automatically
3. Receive notifications when estimated time is exceeded
4. Stop timer to log time entry
5. View time statistics in reports

### Project Management
1. Create projects from Projects tab
2. Use project templates for common workflows
3. Assign tasks to projects
4. Track project progress and health scores
5. Set up project automation and notifications

### Notifications
1. Configure notification preferences in Settings
2. Automatic notifications for:
   - Task start times (15 minutes before)
   - Due dates (1 hour before)
   - Time up alerts
   - Daily task summaries
   - Project deadlines

## Data Models

### Task Model
```javascript
{
  id: string,
  title: string,
  description: string,
  projectId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  startTime: string,
  endTime: string,
  dueDate: string,
  estimatedDuration: number, // minutes
  timeSpent: number, // minutes
  isTimerRunning: boolean,
  tags: string[],
  createdAt: string,
  updatedAt: string
}
```

### Project Model
```javascript
{
  id: string,
  name: string,
  description: string,
  color: string,
  startDate: string,
  endDate: string,
  status: 'active' | 'completed' | 'paused',
  progress: number, // 0-100
  totalEstimatedTime: number,
  totalActualTime: number,
  tasks: string[], // task IDs
  createdAt: string,
  updatedAt: string
}
```

## API Reference

### Task Management
```javascript
// Create task
const task = await storageService.createTask(taskData);

// Update task
const updatedTask = await storageService.updateTask(taskId, updateData);

// Get tasks by status
const pendingTasks = await storageService.getTasksByStatus('pending');

// Get tasks by project
const projectTasks = await storageService.getTasksByProject(projectId);
```

### Time Tracking
```javascript
// Start timer
await timeTrackerService.startTimer(taskId);

// Stop timer
const result = await timeTrackerService.stopTimer(taskId);

// Get time statistics
const stats = await timeTrackerService.getTaskTimeStatistics(taskId);
```

### Notifications
```javascript
// Schedule notification
await notificationService.scheduleNotification({
  id: 'unique_id',
  title: 'Notification Title',
  message: 'Notification message',
  scheduledTime: '2024-01-01T10:00:00.000Z'
});

// Send immediate notification
await notificationService.sendImmediateNotification({
  title: 'Immediate Alert',
  message: 'This shows immediately'
});
```

## Customization

### Adding New Task Status
1. Update `TaskStatus` enum in `types.js`
2. Add status handling in Redux slices
3. Update UI components to handle new status
4. Add status-specific logic in services

### Custom Notification Types
1. Add new type to `NotificationType` enum
2. Implement notification logic in `notifications.js`
3. Add UI controls in Settings screen

### Project Templates
1. Add template definition in `projectService.js`
2. Include template in `createProjectFromTemplate` method
3. Add template selection in CreateProject screen

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Load data on demand
- **Pagination**: Limit large data sets
- **Memoization**: Cache expensive calculations
- **Background Processing**: Handle heavy operations in background
- **Storage Optimization**: Efficient data structures and cleanup

### Memory Management
- Cleanup timers and listeners on component unmount
- Limit active timer count
- Regular data cleanup for old entries
- Efficient Redux state structure

## Troubleshooting

### Common Issues

#### Notifications Not Working
1. Check device notification permissions
2. Verify notification channels (Android)
3. Ensure background app refresh enabled (iOS)

#### Timer Not Persisting
1. Check AsyncStorage permissions
2. Verify background app execution permissions
3. Ensure proper cleanup on app termination

#### Data Loss
1. Verify AsyncStorage write permissions
2. Check available device storage
3. Implement data backup/restore

## Future Enhancements

### Planned Features
- [ ] Team collaboration and sharing
- [ ] Cloud synchronization
- [ ] Advanced reporting with charts
- [ ] Voice commands and dictation
- [ ] Calendar integration
- [ ] Habit tracking
- [ ] AI-powered task suggestions
- [ ] Dark mode theme
- [ ] Widget support
- [ ] Apple Watch / Wear OS integration

### Technical Improvements
- [ ] TypeScript migration
- [ ] Performance monitoring
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Code splitting and lazy loading
- [ ] Offline-first sync architecture

## Contributing

### Development Guidelines
1. Follow React Native best practices
2. Maintain consistent code style
3. Add proper error handling
4. Include comprehensive comments
5. Test on both iOS and Android
6. Ensure offline functionality

### Code Style
- Use functional components with hooks
- Implement proper TypeScript types
- Follow Redux Toolkit patterns
- Use consistent naming conventions
- Add JSDoc comments for public APIs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please refer to the project repository or contact the development team.

---

**Built with ❤️ for productive task management**