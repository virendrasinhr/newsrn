# 📱 Task Management App - Expo Version

A comprehensive task management application built with **React Native Expo**, featuring offline functionality, time tracking, notifications, and project organization.

## ✨ Features

### Core Functionality
- ✅ **Task Management**: Create, update, delete, and organize tasks
- 📊 **Status Tracking**: Pending, In Progress, Completed, Cancelled, Overdue
- 🎯 **Priority Levels**: Low, Medium, High, Urgent
- ⏱️ **Time Tracking**: Start/stop timers, track time spent on tasks
- 🔔 **Smart Notifications**: Task reminders, due date alerts, time-up notifications
- 📁 **Project Organization**: Group tasks by projects
- 📱 **Offline Support**: Works completely offline with SQLite storage
- 📈 **Dashboard**: Beautiful overview with statistics and quick actions

### Advanced Features
- 🔄 **Real-time Updates**: Live timer updates and sync
- 📅 **Smart Scheduling**: Today's tasks, upcoming deadlines
- ⚠️ **Overdue Alerts**: Visual indicators for overdue tasks
- 🎨 **Modern UI**: Clean, intuitive interface with Material Design icons
- 📊 **Quick Stats**: Task counts, progress tracking
- 🔍 **Filtering**: Filter tasks by status, priority, project

## 🛠️ Technical Stack

### Frontend
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **Redux Toolkit**: State management
- **React Navigation**: Navigation solution
- **Expo Vector Icons**: Material Design icons

### Backend & Storage
- **Expo SQLite**: Local database for offline storage
- **Expo Notifications**: Local push notifications
- **Moment.js**: Date/time manipulation
- **App State**: Background processing support

### Architecture
- **Service-Oriented**: Separate services for storage, notifications, time tracking
- **Redux Pattern**: Centralized state management with async thunks
- **Component-Based**: Reusable UI components
- **Offline-First**: All functionality works without internet

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device (optional)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd taskmanager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on device/simulator:**
   - **Android**: Press `a` in terminal or scan QR code with Expo Go
   - **iOS**: Press `i` in terminal or scan QR code with Camera app
   - **Web**: Press `w` in terminal

## 📁 Project Structure

```
taskmanager/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   │   ├── TaskDashboard.js    # Main dashboard
│   │   ├── TaskList.js         # Task listing
│   │   ├── CreateTask.js       # Task creation form
│   │   ├── CreateProject.js    # Project creation
│   │   ├── TimeTracking.js     # Time tracking interface
│   │   └── Reports.js          # Reports and analytics
│   ├── services/           # Business logic services
│   │   ├── storage.js          # SQLite database operations
│   │   ├── timeTracker.js      # Time tracking logic
│   │   └── notifications.js    # Notification management
│   ├── store/             # Redux store and slices
│   │   ├── index.js           # Store configuration
│   │   └── taskSlice.js       # Task state management
│   ├── types/             # Data models and types
│   │   └── index.js           # Task, Project, TimeEntry models
│   └── utils/             # Utility functions
├── App.js                 # Main app component
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🎯 Core Services

### Storage Service (`src/services/storage.js`)
- SQLite database operations
- CRUD operations for tasks, projects, time entries
- Offline data persistence
- Settings management

### Time Tracker Service (`src/services/timeTracker.js`)
- Start/stop/pause/resume timers
- Background time tracking
- Time entry creation
- Statistics calculation

### Notification Service (`src/services/notifications.js`)
- Local push notifications
- Task reminders and alerts
- Due date notifications
- Time-up alerts

## 📊 Data Models

### Task
```javascript
{
  id: string,
  title: string,
  description: string,
  projectId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  startTime: ISO string,
  endTime: ISO string,
  dueDate: ISO string,
  estimatedDuration: number (minutes),
  timeSpent: number (minutes),
  isTimerRunning: boolean,
  tags: string[],
  createdAt: ISO string,
  updatedAt: ISO string
}
```

### Project
```javascript
{
  id: string,
  name: string,
  description: string,
  color: string,
  startDate: ISO string,
  endDate: ISO string,
  status: 'active' | 'completed' | 'archived',
  progress: number (0-100),
  createdAt: ISO string,
  updatedAt: ISO string
}
```

## 🎨 UI Features

### Dashboard
- **Greeting & Date**: Personalized welcome message
- **Quick Stats**: Task counts by status
- **Active Timers**: Real-time timer display
- **Today's Schedule**: Tasks starting/due today
- **Overdue Alerts**: Highlighted overdue tasks
- **Quick Actions**: Fast access to common functions

### Navigation
- **Stack Navigation**: Smooth screen transitions
- **Parameter Passing**: Filter states between screens
- **Back Navigation**: Intuitive navigation flow

## 🔔 Notification System

### Types
- **Task Start Reminders**: 15 minutes before scheduled start
- **Due Date Alerts**: 1 hour before due time
- **Time Up Notifications**: When estimated time is reached
- **Daily Reminders**: Morning task summary

### Features
- **Local Notifications**: No internet required
- **Background Processing**: Works when app is closed
- **Smart Scheduling**: Only schedules future notifications
- **Tap Handling**: Navigate to relevant screens

## ⏱️ Time Tracking

### Capabilities
- **Multiple Timers**: Track multiple tasks simultaneously
- **Background Tracking**: Continues when app is backgrounded
- **Pause/Resume**: Flexible timer control
- **Time Entries**: Detailed time logging
- **Statistics**: Time analysis and reporting

### Background Processing
- **App State Monitoring**: Detects background/foreground transitions
- **Time Persistence**: Maintains timer state across app restarts
- **Accurate Tracking**: Precise time calculation

## 📱 Offline Functionality

### Storage
- **SQLite Database**: Local data persistence
- **No Internet Required**: Fully functional offline
- **Data Integrity**: Reliable data storage and retrieval
- **Performance**: Fast local queries

### Sync Strategy
- **Local-First**: All operations work locally
- **Future Enhancement**: Cloud sync can be added later
- **Export/Import**: Data portability options

## 🎯 Usage Guide

### Getting Started
1. **Create Your First Task**: Tap the "+" button on dashboard
2. **Set Priority**: Choose task importance level
3. **Add Due Date**: Set deadlines for better planning
4. **Start Timer**: Begin tracking time spent
5. **Organize Projects**: Group related tasks together

### Best Practices
- **Set Realistic Estimates**: Use estimated duration for better planning
- **Use Priorities**: Focus on high-priority tasks first
- **Regular Updates**: Mark tasks complete when finished
- **Review Overdue**: Address overdue tasks promptly

## 🔧 Development

### Available Scripts
```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
npm run web        # Run in web browser
npm run eject      # Eject from Expo (irreversible)
```

### Adding New Features
1. **Create Service**: Add business logic to `src/services/`
2. **Update Redux**: Add state management to `src/store/`
3. **Create UI**: Build components in `src/components/` or `src/screens/`
4. **Add Navigation**: Update navigation in `App.js`

### Testing
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react-native jest

# Run tests
npm test
```

## 🚀 Deployment

### Expo Build
```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios

# Publish to Expo
expo publish
```

### Standalone Apps
```bash
# Create standalone APK
expo build:android -t apk

# Create iOS app
expo build:ios -t archive
```

## 🔮 Future Enhancements

### Planned Features
- [ ] **Cloud Sync**: Firebase/Supabase integration
- [ ] **Team Collaboration**: Share projects and tasks
- [ ] **Advanced Reports**: Charts and analytics
- [ ] **Calendar Integration**: Sync with device calendar
- [ ] **Voice Commands**: Voice-controlled task creation
- [ ] **Widget Support**: Home screen widgets
- [ ] **Dark Theme**: Dark mode support
- [ ] **Export Options**: PDF, CSV export

### Technical Improvements
- [ ] **Automated Testing**: Unit and integration tests
- [ ] **Performance Optimization**: Large dataset handling
- [ ] **Accessibility**: Screen reader support
- [ ] **Internationalization**: Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team**: For the amazing development platform
- **React Native Community**: For the robust ecosystem
- **Material Design**: For the beautiful icons and design system
- **Redux Toolkit**: For simplified state management

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourrepo/taskmanager/issues) page
2. Create a new issue with detailed description
3. Include device info and error logs

---

**Happy Task Managing! 🎯**