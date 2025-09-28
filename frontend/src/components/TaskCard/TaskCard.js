import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task, onUpdate, onDelete, onShare, currentUser }) => {
  const isOwner = task.owner._id === currentUser.id;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const handleStatusToggle = () => {
    onUpdate(task._id, { status: task.status === 'completed' ? 'pending' : 'completed' });
  };

  const handleEdit = () => {
    onUpdate(task._id, null, true); // true indicates edit mode
  };

  const handleShare = () => {
    onShare(task);
  };

  return (
    <div className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}>
      <div className="task-header">
        <div>
          <h3 className="task-title">{task.title}</h3>
          <span className={`task-priority priority-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>
        <div className="task-actions">
          <button 
            className={`btn-sm ${task.status === 'completed' ? 'btn-warning' : 'btn-success'}`}
            onClick={handleStatusToggle}
          >
            <i className={`fas fa-${task.status === 'completed' ? 'undo' : 'check'}`}></i>
            {task.status === 'completed' ? 'Reopen' : 'Complete'}
          </button>
          
          {(isOwner || task.collaborators.some(c => c.user._id === currentUser.id && c.permissions === 'edit')) && (
            <button className="btn-sm btn-secondary" onClick={handleEdit}>
              <i className="fas fa-edit"></i> Edit
            </button>
          )}
          
          {isOwner && (
            <button className="btn-sm btn-primary" onClick={handleShare}>
              <i className="fas fa-share"></i> Share
            </button>
          )}
          
          {isOwner && (
            <button className="btn-sm btn-danger" onClick={() => onDelete(task._id)}>
              <i className="fas fa-trash"></i> Delete
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div className="task-status">
          <i className={`fas fa-${task.status === 'completed' ? 'check-circle' : 'clock'}`}></i>
          <span className={`status-${task.status}`}>
            {task.status === 'completed' ? 'Completed' : 'Pending'}
          </span>
        </div>
        
        {task.dueDate && (
          <div className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
            <i className="fas fa-calendar"></i>
            {new Date(task.dueDate).toLocaleDateString()} {new Date(task.dueDate).toLocaleTimeString()}
          </div>
        )}
      </div>

      {(task.collaborators.length > 0 || !isOwner) && (
        <div className="collaborators">
          <h4><i className="fas fa-users"></i> Collaborators</h4>
          <div className="collaborator-list">
            <span className={`collaborator-badge ${isOwner ? 'owner' : ''}`}>
              <i className="fas fa-crown"></i>
              {task.owner.username} (Owner)
            </span>
            {task.collaborators.map((collab, index) => (
              <span key={index} className="collaborator-badge">
                <i className="fas fa-user"></i>
                {collab.user.username} ({collab.permissions})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
