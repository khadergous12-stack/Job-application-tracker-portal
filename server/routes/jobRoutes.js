const express = require('express');
const { body } = require('express-validator');
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getAnalytics
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All job routes are protected
router.use(protect);

// Validation rules for creating a job
const jobValidation = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('roleTitle').trim().notEmpty().withMessage('Role/job title is required')
];

// Routes
router.get('/analytics', getAnalytics);        // GET  /api/jobs/analytics
router.get('/', getJobs);                       // GET  /api/jobs
router.post('/', jobValidation, createJob);     // POST /api/jobs
router.get('/:id', getJobById);                 // GET  /api/jobs/:id
router.put('/:id', updateJob);                  // PUT  /api/jobs/:id
router.delete('/:id', deleteJob);               // DELETE /api/jobs/:id

module.exports = router;
