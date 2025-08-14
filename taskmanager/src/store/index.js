import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './taskSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'tasks/loadTasks/fulfilled',
          'tasks/createTask/fulfilled',
          'tasks/updateTask/fulfilled',
        ],
        ignoredPaths: ['tasks.tasks'],
      },
    }),
});

export default store;