const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tasks for the authenticated user (owned + collaborated)
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;

    const tasks = await Task.find({
      $or: [
        { owner: userId },
        { 'collaborators.user': userId }
      ]
    })
    .populate('owner', 'username email')
    .populate('collaborators.user', 'username email')
    .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});

// Get a single task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    })
    .populate('owner', 'username email')
    .populate('collaborators.user', 'username email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
});

// Create a new task
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('priority')
    .optional()
    .isIn(['High', 'Medium', 'Low'])
    .withMessage('Priority must be High, Medium, or Low'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, priority, dueDate } = req.body;

    const task = new Task({
      title,
      description,
      priority: priority || 'Medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      owner: req.user._id
    });

    await task.save();
    await task.populate('owner', 'username email');

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
});

// Update a task
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('priority')
    .optional()
    .isIn(['High', 'Medium', 'Low'])
    .withMessage('Priority must be High, Medium, or Low'),
  body('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be pending or completed'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 
          'collaborators.user': req.user._id,
          'collaborators.permissions': 'edit'
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or no edit permission' });
    }

    // Check if user has edit permission
    const isOwner = task.owner.toString() === req.user._id.toString();
    const collaborator = task.collaborators.find(c => 
      c.user.toString() === req.user._id.toString() && c.permissions === 'edit'
    );

    if (!isOwner && !collaborator) {
      return res.status(403).json({ message: 'No edit permission for this task' });
    }

    // Update task fields
    const updateFields = {};
    if (req.body.title) updateFields.title = req.body.title;
    if (req.body.description !== undefined) updateFields.description = req.body.description;
    if (req.body.priority) updateFields.priority = req.body.priority;
    if (req.body.status) updateFields.status = req.body.status;
    if (req.body.dueDate !== undefined) {
      updateFields.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    }

    Object.assign(task, updateFields);
    await task.save();
    await task.populate('owner', 'username email');
    await task.populate('collaborators.user', 'username email');

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id // Only owner can delete
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or no delete permission' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
});

// Share task with another user
router.post('/:id/share', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('permissions')
    .optional()
    .isIn(['view', 'edit'])
    .withMessage('Permissions must be view or edit')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, permissions = 'edit' } = req.body;

    // Check if user is the owner
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or no permission to share' });
    }

    // Find the user to share with
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already shared with this user
    const alreadyShared = task.collaborators.some(c => 
      c.user.toString() === userToShare._id.toString()
    );

    if (alreadyShared) {
      return res.status(400).json({ message: 'Task already shared with this user' });
    }

    // Check if trying to share with self
    if (userToShare._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot share task with yourself' });
    }

    // Add collaborator
    task.collaborators.push({
      user: userToShare._id,
      permissions
    });
    task.isShared = true;

    await task.save();
    await task.populate('owner', 'username email');
    await task.populate('collaborators.user', 'username email');

    res.json({
      message: 'Task shared successfully',
      task
    });
  } catch (error) {
    console.error('Share task error:', error);
    res.status(500).json({ message: 'Server error while sharing task' });
  }
});

// Remove collaborator from task
router.delete('/:id/collaborators/:userId', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or no permission' });
    }

    task.collaborators = task.collaborators.filter(c => 
      c.user.toString() !== req.params.userId
    );

    // Update isShared status
    task.isShared = task.collaborators.length > 0;

    await task.save();
    await task.populate('owner', 'username email');
    await task.populate('collaborators.user', 'username email');

    res.json({
      message: 'Collaborator removed successfully',
      task
    });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ message: 'Server error while removing collaborator' });
  }
});

module.exports = router;
