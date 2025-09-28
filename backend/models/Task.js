const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  dueDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      type: String,
      enum: ['view', 'edit'],
      default: 'edit'
    }
  }],
  isShared: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ 'collaborators.user': 1 });

module.exports = mongoose.model('Task', taskSchema);
