import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';

import {
  loadTasks,
  selectAllTasks,
  selectTasksByStatus,
  selectOverdueTasks,
  selectTasksStartingToday,
  selectTasksDueToday,
  selectActiveTimers,
  startTaskTimer,
  stopTaskTimer,
  updateTimerElapsed
} from '../store/taskSlice';
import timeTrackerService from '../services/timeTracker';

const { width } = Dimensions.get('window');

const TaskDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(moment());

  const allTasks = useSelector(selectAllTasks);
  const pendingTasks = useSelector(state => selectTasksByStatus(state, 'pending'));
  const inProgressTasks = useSelector(state => selectTasksByStatus(state, 'in_progress'));
  const completedTasks = useSelector(state => selectTasksByStatus(state, 'completed'));
  const overdueTasks = useSelector(selectOverdueTasks);
  const tasksStartingToday = useSelector(selectTasksStartingToday);
  const tasksDueToday = useSelector(selectTasksDueToday);
  const activeTimers = useSelector(selectActiveTimers);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Load data on component mount
  useEffect(() => {
    dispatch(loadTasks());
  }, [dispatch]);

  // Set up timer listener for real-time updates
  useEffect(() => {
    const unsubscribe = timeTrackerService.addListener((event, data) => {
      if (event === 'timersUpdated') {
        Object.entries(data.activeTimers).forEach(([taskId, timer]) => {
          dispatch(updateTimerElapsed({ taskId, elapsedTime: timer.elapsedTime }));
        });
      }
    });

    return unsubscribe;
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(loadTasks());
    setRefreshing(false);
  }, [dispatch]);

  const handleTimerAction = async (taskId, isRunning) => {
    try {
      if (isRunning) {
        await dispatch(stopTaskTimer(taskId));
        Alert.alert('Timer Stopped', 'Task timer has been stopped and time logged.');
      } else {
        await dispatch(startTaskTimer(taskId));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update timer. Please try again.');
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const StatCard = ({ title, value, color, icon, onPress }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]} 
      onPress={onPress}
    >
      <View style={styles.statCardHeader}>
        <MaterialIcons name={icon} size={24} color={color} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const TaskQuickView = ({ task, showTimer = false }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
        <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
      </View>
      
      {task.dueDate && (
        <Text style={[
          styles.taskDue,
          { color: moment(task.dueDate).isBefore(moment()) ? '#FF4444' : '#666' }
        ]}>
          Due: {moment(task.dueDate).format('MMM DD, HH:mm')}
        </Text>
      )}
      
      {showTimer && activeTimers[task.id] && (
        <View style={styles.timerSection}>
          <Text style={styles.timerText}>
            {formatTime(activeTimers[task.id].elapsedTime || 0)}
          </Text>
          <TouchableOpacity
            style={[styles.timerButton, { backgroundColor: activeTimers[task.id].isRunning ? '#FF4444' : '#4CAF50' }]}
            onPress={() => handleTimerAction(task.id, activeTimers[task.id].isRunning)}
          >
            <MaterialIcons 
              name={activeTimers[task.id].isRunning ? 'stop' : 'play-arrow'} 
              size={16} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#FFD700';
      case 'low': return '#4CAF50';
      default: return '#999';
    }
  };

  const getGreeting = () => {
    const hour = moment().hour();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{currentTime.format('dddd, MMMM DD, YYYY')}</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateTask')}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Total Tasks"
          value={allTasks.length}
          color="#2196F3"
          icon="assignment"
          onPress={() => navigation.navigate('TaskList')}
        />
        <StatCard
          title="In Progress"
          value={inProgressTasks.length}
          color="#FF9800"
          icon="trending-up"
          onPress={() => navigation.navigate('TaskList', { filter: 'in_progress' })}
        />
        <StatCard
          title="Completed"
          value={completedTasks.length}
          color="#4CAF50"
          icon="check-circle"
          onPress={() => navigation.navigate('TaskList', { filter: 'completed' })}
        />
        <StatCard
          title="Overdue"
          value={overdueTasks.length}
          color="#F44336"
          icon="warning"
          onPress={() => navigation.navigate('TaskList', { filter: 'overdue' })}
        />
      </View>

      {/* Active Timers */}
      {Object.keys(activeTimers).length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="timer" size={20} color="#FF9800" />
            <Text style={styles.sectionTitle}>Active Timers</Text>
          </View>
          {Object.keys(activeTimers).map(taskId => {
            const task = allTasks.find(t => t.id === taskId);
            return task ? (
              <TaskQuickView key={taskId} task={task} showTimer={true} />
            ) : null;
          })}
        </View>
      )}

      {/* Today's Schedule */}
      {(tasksStartingToday.length > 0 || tasksDueToday.length > 0) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="today" size={20} color="#2196F3" />
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
          </View>
          
          {tasksStartingToday.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Starting Today</Text>
              {tasksStartingToday.slice(0, 3).map(task => (
                <TaskQuickView key={task.id} task={task} />
              ))}
            </View>
          )}
          
          {tasksDueToday.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Due Today</Text>
              {tasksDueToday.slice(0, 3).map(task => (
                <TaskQuickView key={task.id} task={task} />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { backgroundColor: '#FFEBEE' }]}>
            <MaterialIcons name="warning" size={20} color="#F44336" />
            <Text style={[styles.sectionTitle, { color: '#F44336' }]}>Overdue Tasks</Text>
          </View>
          {overdueTasks.slice(0, 3).map(task => (
            <TaskQuickView key={task.id} task={task} />
          ))}
          {overdueTasks.length > 3 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('TaskList', { filter: 'overdue' })}
            >
              <Text style={styles.viewAllText}>View All {overdueTasks.length} Overdue Tasks</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('CreateTask')}
          >
            <MaterialIcons name="add-task" size={24} color="#2196F3" />
            <Text style={styles.quickActionText}>Add Task</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('CreateProject')}
          >
            <MaterialIcons name="create-new-folder" size={24} color="#9C27B0" />
            <Text style={styles.quickActionText}>New Project</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('TimeTracking')}
          >
            <MaterialIcons name="schedule" size={24} color="#FF9800" />
            <Text style={styles.quickActionText}>Time Tracking</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Reports')}
          >
            <MaterialIcons name="assessment" size={24} color="#4CAF50" />
            <Text style={styles.quickActionText}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Empty State */}
      {allTasks.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialIcons name="assignment" size={64} color="#E0E0E0" />
          <Text style={styles.emptyStateTitle}>No Tasks Yet</Text>
          <Text style={styles.emptyStateText}>
            Get started by creating your first task!
          </Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => navigation.navigate('CreateTask')}
          >
            <Text style={styles.emptyStateButtonText}>Create Task</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 5,
    width: (width - 30) / 2,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  taskItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priorityIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  taskDue: {
    fontSize: 12,
    marginLeft: 16,
    marginTop: 4,
  },
  timerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 16,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  timerButton: {
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2196F3',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 16,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskDashboard;