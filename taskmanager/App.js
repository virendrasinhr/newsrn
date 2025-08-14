import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';

// Redux Store
import { store } from './src/store';

// Services
import notificationService from './src/services/notifications';
import timeTrackerService from './src/services/timeTracker';
import storageService from './src/services/storage';

// Screens
import TaskDashboard from './src/screens/TaskDashboard';
import TaskList from './src/screens/TaskList';
import CreateTask from './src/screens/CreateTask';
import CreateProject from './src/screens/CreateProject';
import TimeTracking from './src/screens/TimeTracking';
import Reports from './src/screens/Reports';

const Stack = createNativeStackNavigator();

const AppInitializer = ({ children }) => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing Task Management App...');
        
        // Initialize services
        await storageService.init();
        await notificationService.init();
        await timeTrackerService.init();
        
        // Request notification permissions
        await notificationService.requestPermissions();
        
        console.log('App initialization completed');
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();

    // Cleanup function
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
        // Handle navigation based on notification type
        // This would need navigation ref to work properly
      }
    });

    return unsubscribe;
  }, []);

  return children;
};

const App = () => {
  return (
    <Provider store={store}>
      <AppInitializer>
        <StatusBar style="light" backgroundColor="#1976D2" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="TaskDashboard"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#2196F3',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="TaskDashboard" 
              component={TaskDashboard}
              options={{ title: 'Task Manager' }}
            />
            <Stack.Screen 
              name="TaskList" 
              component={TaskList}
              options={{ title: 'Tasks' }}
            />
            <Stack.Screen 
              name="CreateTask" 
              component={CreateTask}
              options={{ title: 'New Task' }}
            />
            <Stack.Screen 
              name="CreateProject" 
              component={CreateProject}
              options={{ title: 'New Project' }}
            />
            <Stack.Screen 
              name="TimeTracking" 
              component={TimeTracking}
              options={{ title: 'Time Tracking' }}
            />
            <Stack.Screen 
              name="Reports" 
              component={Reports}
              options={{ title: 'Reports' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppInitializer>
    </Provider>
  );
};

export default App;
