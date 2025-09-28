import React, { useState } from 'react';
import './ShareModal.css';

const ShareModal = ({ task, onClose, onShare }) => {
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState('edit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await onShare(task._id, email, permissions);
      if (result.message === 'Task shared successfully') {
        setSuccess('Task shared successfully!');
        setEmail('');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.message || 'Failed to share task');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share Task</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="share-email">Email Address</label>
            <input
              type="email"
              id="share-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter user's email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="share-permissions">Permissions</label>
            <select
              id="share-permissions"
              value={permissions}
              onChange={(e) => setPermissions(e.target.value)}
            >
              <option value="edit">Edit Access</option>
              <option value="view">View Only</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sharing...' : 'Share Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
