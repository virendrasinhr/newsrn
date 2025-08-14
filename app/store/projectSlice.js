import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../common/storage';
import notificationService from '../common/notifications';
import timeTrackerService from '../common/timeTracker';

// Async thunks for project operations
export const loadProjects = createAsyncThunk(
  'projects/loadProjects',
  async (_, { rejectWithValue }) => {
    try {
      const projects = await storageService.getAllProjects();
      return projects.map(project => project.toJSON());
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const project = await storageService.createProject(projectData);
      
      // Schedule deadline notification if project has end date
      if (project.endDate) {
        await notificationService.scheduleProjectDeadlineNotification(project.id, project.endDate);
      }

      return project.toJSON();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, updateData }, { rejectWithValue }) => {
    try {
      const oldProject = await storageService.getProjectById(projectId);
      const updatedProject = await storageService.updateProject(projectId, updateData);
      
      // Handle deadline notification updates
      if (updateData.endDate !== oldProject.endDate && updateData.endDate) {
        await notificationService.scheduleProjectDeadlineNotification(projectId, updateData.endDate);
      } else if (updateData.endDate === null) {
        // Cancel notification if deadline was removed
        await notificationService.cancelProjectNotifications(projectId);
      }

      return updatedProject.toJSON();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      // Get all tasks in the project and stop any running timers
      const tasks = await storageService.getTasksByProject(projectId);
      for (const task of tasks) {
        if (timeTrackerService.isTimerRunning(task.id)) {
          await timeTrackerService.stopTimer(task.id);
        }
      }
      
      // Cancel all project notifications
      await notificationService.cancelProjectNotifications(projectId);
      
      // Delete the project (this will also delete related tasks)
      await storageService.deleteProject(projectId);

      return projectId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProjectStatistics = createAsyncThunk(
  'projects/getProjectStatistics',
  async (projectId, { rejectWithValue }) => {
    try {
      const statistics = await timeTrackerService.getProjectTimeStatistics(projectId);
      return { projectId, statistics };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const calculateAllProjectsProgress = createAsyncThunk(
  'projects/calculateAllProjectsProgress',
  async (_, { rejectWithValue, getState }) => {
    try {
      const projects = getState().projects.projects;
      const progressUpdates = [];

      for (const project of projects) {
        const tasks = await storageService.getTasksByProject(project.id);
        const completedTasks = tasks.filter(task => task.status === 'completed');
        const progress = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
        
        const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0);
        const totalActualTime = tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);

        // Add current active timer times
        let activeTimerTime = 0;
        for (const task of tasks) {
          activeTimerTime += timeTrackerService.getCurrentElapsedTime(task.id);
        }

        progressUpdates.push({
          id: project.id,
          progress: Math.round(progress),
          totalEstimatedTime,
          totalActualTime: totalActualTime + activeTimerTime,
          tasks: tasks.map(task => task.id)
        });
      }

      // Update all projects in storage
      for (const update of progressUpdates) {
        await storageService.updateProject(update.id, {
          progress: update.progress,
          totalEstimatedTime: update.totalEstimatedTime,
          totalActualTime: update.totalActualTime,
          tasks: update.tasks
        });
      }

      return progressUpdates;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  projects: [],
  selectedProject: null,
  projectStatistics: {},
  loading: false,
  error: null,
  filters: {
    status: null,
    searchQuery: ''
  }
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
    setProjectFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearProjectFilters: (state) => {
      state.filters = {
        status: null,
        searchQuery: ''
      };
    },
    updateProjectProgress: (state, action) => {
      const { projectId, progress, totalActualTime } = action.payload;
      const projectIndex = state.projects.findIndex(project => project.id === projectId);
      if (projectIndex !== -1) {
        state.projects[projectIndex].progress = progress;
        state.projects[projectIndex].totalActualTime = totalActualTime;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    sortProjects: (state, action) => {
      const { field, direction } = action.payload;
      
      const sorted = [...state.projects].sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];
        
        // Handle different data types
        if (field === 'createdAt' || field === 'updatedAt' || field === 'startDate' || field === 'endDate') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      
      state.projects = sorted;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load projects
      .addCase(loadProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(loadProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(project => project.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.selectedProject?.id === action.payload.id) {
          state.selectedProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(project => project.id !== action.payload);
        if (state.selectedProject?.id === action.payload) {
          state.selectedProject = null;
        }
        // Remove statistics for deleted project
        delete state.projectStatistics[action.payload];
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Project statistics
      .addCase(getProjectStatistics.fulfilled, (state, action) => {
        const { projectId, statistics } = action.payload;
        state.projectStatistics[projectId] = statistics;
      })
      
      // Calculate all projects progress
      .addCase(calculateAllProjectsProgress.fulfilled, (state, action) => {
        const progressUpdates = action.payload;
        progressUpdates.forEach(update => {
          const projectIndex = state.projects.findIndex(project => project.id === update.id);
          if (projectIndex !== -1) {
            state.projects[projectIndex].progress = update.progress;
            state.projects[projectIndex].totalEstimatedTime = update.totalEstimatedTime;
            state.projects[projectIndex].totalActualTime = update.totalActualTime;
            state.projects[projectIndex].tasks = update.tasks;
          }
        });
      });
  },
});

export const {
  setSelectedProject,
  clearSelectedProject,
  setProjectFilters,
  clearProjectFilters,
  updateProjectProgress,
  clearError,
  sortProjects
} = projectSlice.actions;

// Selectors
export const selectAllProjects = (state) => state.projects.projects;

export const selectFilteredProjects = (state) => {
  const { projects, filters } = state.projects;
  
  return projects.filter(project => {
    // Status filter
    if (filters.status && project.status !== filters.status) {
      return false;
    }
    
    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableFields = [project.name, project.description];
      const matches = searchableFields.some(field => 
        field && field.toLowerCase().includes(query)
      );
      if (!matches) {
        return false;
      }
    }
    
    return true;
  });
};

export const selectSelectedProject = (state) => state.projects.selectedProject;
export const selectProjectsLoading = (state) => state.projects.loading;
export const selectProjectsError = (state) => state.projects.error;
export const selectProjectStatistics = (state) => state.projects.projectStatistics;
export const selectProjectFilters = (state) => state.projects.filters;

export const selectProjectById = (state, projectId) =>
  state.projects.projects.find(project => project.id === projectId);

export const selectActiveProjects = (state) =>
  state.projects.projects.filter(project => project.status === 'active');

export const selectCompletedProjects = (state) =>
  state.projects.projects.filter(project => project.status === 'completed');

export const selectProjectsWithDeadlines = (state) => {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return state.projects.projects.filter(project => 
    project.endDate && 
    new Date(project.endDate) <= nextWeek && 
    new Date(project.endDate) >= today
  );
};

export const selectOverdueProjects = (state) => {
  const today = new Date();
  return state.projects.projects.filter(project => 
    project.endDate && 
    new Date(project.endDate) < today && 
    project.status !== 'completed'
  );
};

export const selectProjectProgress = (state, projectId) => {
  const project = selectProjectById(state, projectId);
  return project ? project.progress : 0;
};

export const selectProjectTimeStatistics = (state, projectId) => 
  state.projects.projectStatistics[projectId];

// Complex selectors
export const selectProjectsOverview = (state) => {
  const projects = selectAllProjects(state);
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const overdueProjects = selectOverdueProjects(state).length;
  
  const totalEstimatedTime = projects.reduce((sum, p) => sum + (p.totalEstimatedTime || 0), 0);
  const totalActualTime = projects.reduce((sum, p) => sum + (p.totalActualTime || 0), 0);
  const averageProgress = totalProjects > 0 ? 
    projects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects : 0;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    overdueProjects,
    totalEstimatedTime,
    totalActualTime,
    averageProgress: Math.round(averageProgress),
    efficiency: totalEstimatedTime > 0 ? (totalEstimatedTime / totalActualTime) * 100 : 100
  };
};

export default projectSlice.reducer;