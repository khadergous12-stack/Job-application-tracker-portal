const { validationResult } = require('express-validator');
const JobApplication = require('../models/JobApplication');

// ─── @desc    Get all job applications for logged-in user
// ─── @route   GET /api/jobs
// ─── @access  Private
const getJobs = async (req, res) => {
  try {
    const { status, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build filter query
    const filter = { user: req.user._id };
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { roleTitle: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const jobs = await JobApplication.find(filter)
      .sort({ [sortBy]: sortOrder })
      .lean();

    // Build stats summary
    const allJobs = await JobApplication.find({ user: req.user._id }).lean();
    const stats = {
      total: allJobs.length,
      saved: allJobs.filter(j => j.status === 'Saved').length,
      applied: allJobs.filter(j => j.status === 'Applied').length,
      oa: allJobs.filter(j => j.status === 'OA').length,
      interview: allJobs.filter(j => j.status === 'Interview').length,
      offer: allJobs.filter(j => j.status === 'Offer').length,
      rejected: allJobs.filter(j => j.status === 'Rejected').length,
      withdrawn: allJobs.filter(j => j.status === 'Withdrawn').length
    };

    res.json({ jobs, stats });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
};

// ─── @desc    Get single job application
// ─── @route   GET /api/jobs/:id
// ─── @access  Private
const getJobById = async (req, res) => {
  try {
    const job = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!job) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error fetching job' });
  }
};

// ─── @desc    Create job application
// ─── @route   POST /api/jobs
// ─── @access  Private
const createJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const job = await JobApplication.create({
      ...req.body,
      user: req.user._id
    });

    res.status(201).json({ message: 'Job application added successfully', job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error creating job' });
  }
};

// ─── @desc    Update job application
// ─── @route   PUT /api/jobs/:id
// ─── @access  Private
const updateJob = async (req, res) => {
  try {
    const job = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    res.json({ message: 'Job application updated successfully', job });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error updating job' });
  }
};

// ─── @desc    Delete job application
// ─── @route   DELETE /api/jobs/:id
// ─── @access  Private
const deleteJob = async (req, res) => {
  try {
    const job = await JobApplication.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!job) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    res.json({ message: 'Job application deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error deleting job' });
  }
};

// ─── @desc    Get analytics/reports
// ─── @route   GET /api/jobs/analytics
// ─── @access  Private
const getAnalytics = async (req, res) => {
  try {
    const jobs = await JobApplication.find({ user: req.user._id }).lean();

    // Funnel data
    const funnel = ['Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Withdrawn'].map(s => ({
      stage: s,
      count: jobs.filter(j => j.status === s).length
    }));

    // Applications per month (last 6 months)
    const monthlyData = {};
    jobs.forEach(job => {
      const month = new Date(job.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    // Source distribution
    const sourceData = {};
    jobs.forEach(job => {
      sourceData[job.source] = (sourceData[job.source] || 0) + 1;
    });

    // Response rate = (Interview + OA + Offer) / Applied * 100
    const applied = jobs.filter(j => ['Applied', 'OA', 'Interview', 'Offer'].includes(j.status)).length;
    const responded = jobs.filter(j => ['OA', 'Interview', 'Offer'].includes(j.status)).length;
    const responseRate = applied > 0 ? Math.round((responded / applied) * 100) : 0;

    res.json({ funnel, monthlyData, sourceData, responseRate, total: jobs.length });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getAnalytics };
