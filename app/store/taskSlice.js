import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../common/storage';
import timeTrackerService from '../common/timeTracker';
import notificationService from '../common/notifications';
import { TaskStatus, TaskPriority } from '../common/types';

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
  async (taskData, { rejectWithValue, dispatch }) => {
    try {
      const task = await storageService.createTask(taskData);
      
      // Schedule notifications if needed
      if (task.startTime) {
        await notificationService.scheduleTaskStartNotification(task.id, task.startTime);
      }
      if (task.dueDate) {
        await notificationService.scheduleTaskDueNotification(task.id, task.dueDate);
      }

      // Update project if task belongs to one
      if (task.projectId) {
        dispatch(updateProjectStats(task.projectId));
      }

      return task.toJSON();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, updateData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const oldTask = await storageService.getTaskById(taskId);
      const updatedTask = await storageService.updateTask(taskId, updateData);
      
      // Handle notification updates
      if (updateData.startTime !== oldTask.startTime && updateData.startTime) {
        await notificationService.scheduleTaskStartNotification(taskId, updateData.startTime);
      }
      if (updateData.dueDate !== oldTask.dueDate && updateData.dueDate) {
        await notificationService.scheduleTaskDueNotification(taskId, updateData.dueDate);
      }

      // Update project stats if needed
      if (updatedTask.projectId) {
        dispatch(updateProjectStats(updatedTask.projectId));
      }

      return updatedTask.toJSON();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue, dispatch }) => {
    try {
      const task = await storageService.getTaskById(taskId);
      const projectId = task?.projectId;
      
      // Stop timer if running
      if (timeTrackerService.isTimerRunning(taskId)) {
        await timeTrackerService.stopTimer(taskId);
      }
      
      // Cancel notifications
      await notificationService.cancelTaskNotifications(taskId);
      
      // Delete task
      await storageService.deleteTask(taskId);
      
      // Update project stats
      if (projectId) {
        dispatch(updateProjectStats(projectId));
      }

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

export const pauseTaskTimer = createAsyncThunk(
  'tasks/pauseTimer',
  async (taskId, { rejectWithValue, dispatch }) => {
    try {
      const success = await timeTrackerService.pauseTimer(taskId);
      if (success) {
        const timer = timeTrackerService.getActiveTimer(taskId);
        dispatch(setActiveTimer({ taskId, timer }));
        return taskId;
      }
      throw new Error('Failed to pause timer');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resumeTaskTimer = createAsyncThunk(
  'tasks/resumeTimer',
  async (taskId, { rejectWithValue, dispatch }) => {
    try {
      const success = await timeTrackerService.resumeTimer(taskId);
      if (success) {
        const timer = timeTrackerService.getActiveTimer(taskId);
        dispatch(setActiveTimer({ taskId, timer }));
        return taskId;
      }
      throw new Error('Failed to resume timer');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTasksByProject = createAsyncThunk(
  'tasks/getTasksByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const tasks = await storageService.getTasksByProject(projectId);
      return tasks.map(task => task.toJSON());
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTasksByStatus = createAsyncThunk(
  'tasks/getTasksByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const tasks = await storageService.getTasksByStatus(status);
      return tasks.map(task => task.toJSON());
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper thunk for updating project stats
export const updateProjectStats = createAsyncThunk(
  'tasks/updateProjectStats',
  async (projectId, { rejectWithValue }) => {
    try {
      const tasks = await storageService.getTasksByProject(projectId);
      const project = await storageService.getProjectById(projectId);
      
      if (!project) return null;

      const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED);
      const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0);
      const totalActualTime = tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
      const progress = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

      const updatedProject = await storageService.updateProject(projectId, {
        totalEstimatedTime,
        totalActualTime,
        progress: Math.round(progress),
        tasks: tasks.map(task => task.id)
      });

      return updatedProject.toJSON();
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
  timerUpdateCount: 0, // For triggering UI updates
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
    sortTasks: (state, action) => {
      const { field, direction } = action.payload;
      const tasksToSort = state.filteredTasks.length > 0 ? state.filteredTasks : state.tasks;
      
      const sorted = [...tasksToSort].sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];
        
        // Handle different data types
        if (field === 'createdAt' || field === 'updatedAt' || field === 'dueDate') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (field === 'priority') {
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
          aValue = priorityOrder[aValue] || 0;
          bValue = priorityOrder[bValue] || 0;
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      
      if (state.filteredTasks.length > 0) {
        state.filteredTasks = sorted;
      } else {
        state.tasks = sorted;
      }
    }
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
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
          state.filteredTasks = applyFilters(state.tasks, state.filters);
        }
        if (state.selectedTask?.id === action.payload.id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        state.filteredTasks = applyFilters(state.tasks, state.filters);
        if (state.selectedTask?.id === action.payload) {
          state.selectedTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
    // Status filter
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    
    // Priority filter
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    
    // Project filter
    if (filters.projectId && task.projectId !== filters.projectId) {
      return false;
    }
    
    // Search query filter
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
  clearError,
  sortTasks
} = taskSlice.actions;

// Selectors
export const selectAllTasks = (state) => state.tasks.tasks;
export const selectFilteredTasks = (state) => 
  state.tasks.filteredTasks.length > 0 ? state.tasks.filteredTasks : state.tasks.tasks;
export const selectSelectedTask = (state) => state.tasks.selectedTask;
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;
export const selectActiveTimers = (state) => state.tasks.activeTimers;
export const selectTaskFilters = (state) => state.tasks.filters;
export const selectTimerUpdateCount = (state) => state.tasks.timerUpdateCount;

export const selectTasksByStatus = (state, status) =>
  selectAllTasks(state).filter(task => task.status === status);

export const selectTasksByProject = (state, projectId) =>
  selectAllTasks(state).filter(task => task.projectId === projectId);

export const selectTasksByPriority = (state, priority) =>
  selectAllTasks(state).filter(task => task.priority === priority);

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