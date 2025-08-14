import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../services/storage';
import timeTrackerService from '../services/timeTracker';
import notificationService from '../services/notifications';
import { TaskStatus } from '../types';

// Async thunks for task operations
export const loadTasks = createAsyncThunk(
  'tasks/loadTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await storageService.getAllTasks();
      return tasks.map(task => task.toJSON());
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const task = await storageService.createTask(taskData);
      
      // Schedule notifications if needed
      if (task.startTime) {
        await notificationService.scheduleTaskStartNotification(task.id, task.title, task.startTime);
      }
      if (task.dueDate) {
        await notificationService.scheduleTaskDueNotification(task.id, task.title, task.dueDate);
      }

      return task.toJSON();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, updateData }, { rejectWithValue }) => {
    try {
      const oldTask = await storageService.getTaskById(taskId);
      const updatedTask = await storageService.updateTask(taskId, updateData);
      
      // Handle notification updates
      if (updateData.startTime !== oldTask.startTime && updateData.startTime) {
        await notificationService.scheduleTaskStartNotification(taskId, updatedTask.title, updateData.startTime);
      }
      if (updateData.dueDate !== oldTask.dueDate && updateData.dueDate) {
        await notificationService.scheduleTaskDueNotification(taskId, updatedTask.title, updateData.dueDate);
      }

      return updatedTask.toJSON();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      // Stop timer if running
      if (timeTrackerService.isTimerRunning(taskId)) {
        await timeTrackerService.stopTimer(taskId);
      }
      
      // Cancel notifications
      await notificationService.cancelScheduledNotification(`task_start_${taskId}`);
      await notificationService.cancelScheduledNotification(`task_due_${taskId}`);
      await notificationService.cancelScheduledNotification(`time_up_${taskId}`);
      
      // Delete task
      await storageService.deleteTask(taskId);

      return taskId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const startTaskTimer = createAsyncThunk(
  'tasks/startTimer',
  async (taskId, { rejectWithValue, dispatch }) => {
    try {
      const success = await timeTrackerService.startTimer(taskId);
      if (success) {
        const timer = timeTrackerService.getActiveTimer(taskId);
        dispatch(setActiveTimer({ taskId, timer }));
        return taskId;
      }
      throw new Error('Failed to start timer');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const stopTaskTimer = createAsyncThunk(
  'tasks/stopTimer',
  async (taskId, { rejectWithValue, dispatch }) => {
    try {
      const result = await timeTrackerService.stopTimer(taskId);
      if (result) {
        dispatch(removeActiveTimer(taskId));
        dispatch(loadTasks()); // Reload to get updated time
        return { taskId, ...result };
      }
      throw new Error('Failed to stop timer');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  tasks: [],
  filteredTasks: [],
  activeTimers: {},
  selectedTask: null,
  filters: {
    status: null,
    priority: null,
    projectId: null,
    searchQuery: ''
  },
  loading: false,
  error: null,
  timerUpdateCount: 0,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredTasks = applyFilters(state.tasks, state.filters);
    },
    clearFilters: (state) => {
      state.filters = {
        status: null,
        priority: null,
        projectId: null,
        searchQuery: ''
      };
      state.filteredTasks = state.tasks;
    },
    setActiveTimer: (state, action) => {
      const { taskId, timer } = action.payload;
      state.activeTimers[taskId] = timer;
    },
    removeActiveTimer: (state, action) => {
      const taskId = action.payload;
      delete state.activeTimers[taskId];
    },
    updateTimerElapsed: (state, action) => {
      const { taskId, elapsedTime } = action.payload;
      if (state.activeTimers[taskId]) {
        state.activeTimers[taskId].elapsedTime = elapsedTime;
      }
      state.timerUpdateCount += 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load tasks
      .addCase(loadTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.filteredTasks = applyFilters(action.payload, state.filters);
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
        state.filteredTasks = applyFilters(state.tasks, state.filters);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
          state.filteredTasks = applyFilters(state.tasks, state.filters);
        }
        if (state.selectedTask?.id === action.payload.id) {
          state.selectedTask = action.payload;
        }
      })
      
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        state.filteredTasks = applyFilters(state.tasks, state.filters);
        if (state.selectedTask?.id === action.payload) {
          state.selectedTask = null;
        }
      })
      
      // Timer operations
      .addCase(startTaskTimer.fulfilled, (state, action) => {
        const taskIndex = state.tasks.findIndex(task => task.id === action.payload);
        if (taskIndex !== -1) {
          state.tasks[taskIndex].isTimerRunning = true;
          state.tasks[taskIndex].status = TaskStatus.IN_PROGRESS;
        }
        state.filteredTasks = applyFilters(state.tasks, state.filters);
      })
      .addCase(stopTaskTimer.fulfilled, (state, action) => {
        const { taskId } = action.payload;
        const taskIndex = state.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          state.tasks[taskIndex].isTimerRunning = false;
        }
        state.filteredTasks = applyFilters(state.tasks, state.filters);
      });
  },
});

// Helper function to apply filters
function applyFilters(tasks, filters) {
  return tasks.filter(task => {
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    if (filters.projectId && task.projectId !== filters.projectId) {
      return false;
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableFields = [task.title, task.description, ...(task.tags || [])];
      const matches = searchableFields.some(field => 
        field && field.toLowerCase().includes(query)
      );
      if (!matches) {
        return false;
      }
    }
    return true;
  });
}

export const {
  setSelectedTask,
  clearSelectedTask,
  setFilters,
  clearFilters,
  setActiveTimer,
  removeActiveTimer,
  updateTimerElapsed,
  clearError
} = taskSlice.actions;

// Selectors
export const selectAllTasks = (state) => state.tasks.tasks;
export const selectFilteredTasks = (state) => 
  state.tasks.filteredTasks.length > 0 ? state.tasks.filteredTasks : state.tasks.tasks;
export const selectSelectedTask = (state) => state.tasks.selectedTask;
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;
export const selectActiveTimers = (state) => state.tasks.activeTimers;

export const selectTasksByStatus = (state, status) =>
  selectAllTasks(state).filter(task => task.status === status);

export const selectOverdueTasks = (state) =>
  selectAllTasks(state).filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED
  );

export const selectTasksStartingToday = (state) => {
  const today = new Date().toDateString();
  return selectAllTasks(state).filter(task => 
    task.startTime && new Date(task.startTime).toDateString() === today
  );
};

export const selectTasksDueToday = (state) => {
  const today = new Date().toDateString();
  return selectAllTasks(state).filter(task => 
    task.dueDate && new Date(task.dueDate).toDateString() === today
  );
};

export default taskSlice.reducer;