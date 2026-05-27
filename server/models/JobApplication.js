const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    roleTitle: {
      type: String,
      required: [true, 'Role/Job title is required'],
      trim: true
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    jobUrl: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      enum: ['LinkedIn', 'Indeed', 'Naukri', 'Company Website', 'Referral', 'GitHub Jobs', 'Other'],
      default: 'Other'
    },
    status: {
      type: String,
      enum: ['Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Withdrawn'],
      default: 'Saved'
    },
    appliedDate: {
      type: Date,
      default: null
    },
    interviewDate: {
      type: Date,
      default: null
    },
    salaryNote: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    }
  },
  {
    timestamps: true
  }
);

// ─── Index for fast user-specific queries ─────────────────────────────────────
jobApplicationSchema.index({ user: 1, status: 1 });
jobApplicationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
