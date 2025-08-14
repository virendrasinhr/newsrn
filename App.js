/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Redux Store
import { store } from './app/store/store';

// Services
import notificationService from './app/common/notifications';
import timeTrackerService from './app/common/timeTracker';

// Screens
import TaskDashboard from './app/screens/TaskDashboard';
import TaskList from './app/screens/TaskList';
import CreateTask from './app/screens/CreateTask';
import TaskDetail from './app/screens/TaskDetail';
import ProjectList from './app/screens/ProjectList';
import CreateProject from './app/screens/CreateProject';
import ProjectDetail from './app/screens/ProjectDetail';
import TimeTracking from './app/screens/TimeTracking';
import Reports from './app/screens/Reports';
import Settings from './app/screens/Settings';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigators for each tab
const TaskStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#2196F3' },
      headerTintColor: 'white',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="TaskDashboard" 
      component={TaskDashboard} 
      options={{ title: 'Task Dashboard' }}
    />
    <Stack.Screen 
      name="TaskList" 
      component={TaskList} 
      options={{ title: 'Tasks' }}
    />
    <Stack.Screen 
      name="CreateTask" 
      component={CreateTask} 
      options={{ title: 'Create Task' }}
    />
    <Stack.Screen 
      name="TaskDetail" 
      component={TaskDetail} 
      options={{ title: 'Task Details' }}
    />
  </Stack.Navigator>
);

const ProjectStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#9C27B0' },
      headerTintColor: 'white',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="ProjectList" 
      component={ProjectList} 
      options={{ title: 'Projects' }}
    />
    <Stack.Screen 
      name="CreateProject" 
      component={CreateProject} 
      options={{ title: 'Create Project' }}
    />
    <Stack.Screen 
      name="ProjectDetail" 
      component={ProjectDetail} 
      options={{ title: 'Project Details' }}
    />
  </Stack.Navigator>
);

const TimeStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#FF9800' },
      headerTintColor: 'white',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="TimeTracking" 
      component={TimeTracking} 
      options={{ title: 'Time Tracking' }}
    />
  </Stack.Navigator>
);

const ReportsStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#4CAF50' },
      headerTintColor: 'white',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="Reports" 
      component={Reports} 
      options={{ title: 'Reports & Analytics' }}
    />
  </Stack.Navigator>
);

const SettingsStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#607D8B' },
      headerTintColor: 'white',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="Settings" 
      component={Settings} 
      options={{ title: 'Settings' }}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'TasksTab':
            iconName = 'dashboard';
            break;
          case 'ProjectsTab':
            iconName = 'folder';
            break;
          case 'TimeTab':
            iconName = 'schedule';
            break;
          case 'ReportsTab':
            iconName = 'assessment';
            break;
          case 'SettingsTab':
            iconName = 'settings';
            break;
          default:
            iconName = 'help';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
      tabBarStyle: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
    })}
  >
    <Tab.Screen 
      name="TasksTab" 
      component={TaskStackNavigator}
      options={{ tabBarLabel: 'Tasks' }}
    />
    <Tab.Screen 
      name="ProjectsTab" 
      component={ProjectStackNavigator}
      options={{ tabBarLabel: 'Projects' }}
    />
    <Tab.Screen 
      name="TimeTab" 
      component={TimeStackNavigator}
      options={{ tabBarLabel: 'Time' }}
    />
    <Tab.Screen 
      name="ReportsTab" 
      component={ReportsStackNavigator}
      options={{ tabBarLabel: 'Reports' }}
    />
    <Tab.Screen 
      name="SettingsTab" 
      component={SettingsStackNavigator}
      options={{ tabBarLabel: 'Settings' }}
    />
  </Tab.Navigator>
);

// App Initialization Component
const AppInitializer = ({ children }) => {
  useEffect(() => {
    // Initialize services
    const initializeApp = async () => {
      try {
        console.log('Initializing Task Management App...');
        
        // Initialize notification service
        await notificationService.init();
        console.log('Notification service initialized');
        
        // Initialize time tracker service
        await timeTrackerService.init();
        console.log('Time tracker service initialized');
        
        // Request notification permissions
        await notificationService.requestPermissions();
        
        // Schedule daily reminders
        await notificationService.scheduleDailyTaskReminders();
        
        console.log('App initialization completed');
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();

    // Cleanup on app unmount
    return () => {
      console.log('Cleaning up services...');
      timeTrackerService.cleanup();
      notificationService.cleanup();
    };
  }, []);

  // Handle notification taps
  useEffect(() => {
    const unsubscribe = notificationService.addListener((event, data) => {
      if (event === 'notificationTapped') {
        console.log('Notification tapped:', data);
        // Handle navigation based on notification data
        // This would typically be handled by the navigation container
      }
    });

    return unsubscribe;
  }, []);

  return children;
};

// Main App Component
const App = () => {
  return (
    <Provider store={store}>
      <AppInitializer>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#2196F3" 
        />
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </AppInitializer>
    </Provider>
  );
};

export default App;