import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './taskSlice';
import projectReducer from './projectSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    projects: projectReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // Ignore these action types
          'tasks/loadTasks/fulfilled',
          'tasks/createTask/fulfilled',
          'tasks/updateTask/fulfilled',
          'projects/loadProjects/fulfilled',
          'projects/createProject/fulfilled',
          'projects/updateProject/fulfilled',
        ],
        ignoredPaths: [
          // Ignore these paths in the state
          'tasks.tasks',
          'projects.projects',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;