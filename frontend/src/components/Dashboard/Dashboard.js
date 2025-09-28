import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TaskForm from '../TaskForm/TaskForm';
import TaskCard from '../TaskCard/TaskCard';
import ShareModal from '../ShareModal/ShareModal';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [sharingTask, setSharingTask] = useState(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const loadTasks = async () => {
    try {
      setLoading(true);
      const result = await api.getTasks(token);
      setTasks(result);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (taskData) => {
    try {
      const result = await api.createTask(taskData, token);
      if (result._id) {
        setTasks([result, ...tasks]);
        setShowTaskForm(false);
        setError('');
      } else {
        setError(result.message || 'Failed to create task');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleUpdateTask = async (taskId, updates, isEditMode = false) => {
    if (isEditMode) {
      const task = tasks.find(t => t._id === taskId);
      setEditingTask(task);
      setShowTaskForm(true);
      return;
    }

    try {
      const result = await api.updateTask(taskId, updates, token);
      if (result._id) {
        setTasks(tasks.map(t => t._id === taskId ? result : t));
        setEditingTask(null);
        setShowTaskForm(false);
        setError('');
      } else {
        setError(result.message || 'Failed to update task');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const result = await api.deleteTask(taskId, token);
      if (result.message === 'Task deleted successfully') {
        setTasks(tasks.filter(t => t._id !== taskId));
        setError('');
      } else {
        setError(result.message || 'Failed to delete task');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleShareTask = (task) => {
    setSharingTask(task);
  };

  const handleShareSubmit = async (taskId, email, permissions) => {
    const result = await api.shareTask(taskId, email, permissions, token);
    if (result.message === 'Task shared successfully') {
      // Update the task in the list
      setTasks(tasks.map(t => t._id === taskId ? result.task : t));
    }
    return result;
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const filteredTasks = tasks.filter(task => {
    // Show all tasks for now, but could add filtering here
    return true;
  });

  return (
    <div className="dashboard">
      <div className="header">
        <h1><i className="fas fa-tasks"></i> To-Do List</h1>
        <p>Stay organized and get things done</p>
      </div>

      <div className="app-container">
        <div className="app-header">
          <h2>My Tasks</h2>
          <div className="user-info">
            <span>Welcome, {user.username}!</span>
            <button className="logout-btn" onClick={onLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>

        <div className="task-management">
          {error && <div className="error">{error}</div>}

          {!showTaskForm && (
            <div className="add-task-section">
              <button 
                className="btn btn-primary add-task-btn"
                onClick={() => setShowTaskForm(true)}
              >
                <i className="fas fa-plus"></i> Add New Task
              </button>
            </div>
          )}

          {showTaskForm && (
            <TaskForm
              onSubmit={editingTask ? (data) => handleUpdateTask(editingTask._id, data) : handleCreateTask}
              initialData={editingTask}
              onCancel={handleCancelEdit}
            />
          )}

          {loading ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i> Loading tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-clipboard-list"></i>
              <h3>No tasks yet</h3>
              <p>Create your first task to get started with organizing your work!</p>
            </div>
          ) : (
            <div className="task-list">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onShare={handleShareTask}
                  currentUser={user}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {sharingTask && (
        <ShareModal
          task={sharingTask}
          onClose={() => setSharingTask(null)}
          onShare={handleShareSubmit}
        />
      )}
    </div>
  );
};

export default Dashboard;
