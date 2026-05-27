const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    dueAt: {
      type: Date,
      default: null
    },
    done: {
      type: Boolean,
      default: false
    },
    reminderSent: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

taskSchema.index({ application: 1, user: 1 });

module.exports = mongoose.model('Task', taskSchema);
