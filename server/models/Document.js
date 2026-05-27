const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
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
    kind: {
      type: String,
      enum: ['Resume', 'Cover Letter', 'Portfolio', 'Other'],
      default: 'Resume'
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      default: 'application/pdf'
    },
    size: {
      type: Number,
      default: 0
    },
    // stored locally under /uploads/ in server
    path: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

documentSchema.index({ application: 1, user: 1 });

module.exports = mongoose.model('Document', documentSchema);
