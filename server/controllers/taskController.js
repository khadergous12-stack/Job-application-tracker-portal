const Task = require('../models/Task');
const JobApplication = require('../models/JobApplication');
const { scheduleReminder, cancelReminder } = require('../config/queue');

// ─── @desc   Get all tasks for a job application
// ─── @route  GET /api/jobs/:jobId/tasks
// ─── @access Private
const getTasks = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.jobId, user: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job application not found' });

    const tasks = await Task.find({ application: req.params.jobId, user: req.user._id })
      .sort({ dueAt: 1, createdAt: -1 });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// ─── @desc   Create a task for a job application
// ─── @route  POST /api/jobs/:jobId/tasks
// ─── @access Private
const createTask = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.jobId, user: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job application not found' });

    const { title, dueAt } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const task = await Task.create({
      application: req.params.jobId,
      user: req.user._id,
      title,
      dueAt: dueAt ? new Date(dueAt) : null
    });

    // ─── Schedule BullMQ reminder if dueAt is in the future ──────────────────
    if (dueAt && new Date(dueAt) > new Date()) {
      await scheduleReminder({
        userId: req.user._id.toString(),
        applicationId: req.params.jobId,
        taskId: task._id.toString(),
        taskTitle: title,
        companyName: job.companyName,
        roleTitle: job.roleTitle,
        dueAt,
      });
    }

    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

// ─── @desc   Toggle task done/undone
// ─── @route  PATCH /api/jobs/:jobId/tasks/:taskId/toggle
// ─── @access Private
const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      application: req.params.jobId,
      user: req.user._id,
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.done = !task.done;
    await task.save();

    res.json({ message: `Task marked as ${task.done ? 'done' : 'pending'}`, task });
  } catch (err) {
    res.status(500).json({ message: 'Server error toggling task' });
  }
};

// ─── @desc   Delete a task
// ─── @route  DELETE /api/jobs/:jobId/tasks/:taskId
// ─── @access Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      application: req.params.jobId,
      user: req.user._id,
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

module.exports = { getTasks, createTask, toggleTask, deleteTask };
