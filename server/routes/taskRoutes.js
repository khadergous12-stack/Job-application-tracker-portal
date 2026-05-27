const express = require('express');
const { getTasks, createTask, toggleTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true }); // mergeParams to access :jobId

router.use(protect);

router.get('/',                    getTasks);       // GET    /api/jobs/:jobId/tasks
router.post('/',                   createTask);     // POST   /api/jobs/:jobId/tasks
router.patch('/:taskId/toggle',    toggleTask);     // PATCH  /api/jobs/:jobId/tasks/:taskId/toggle
router.delete('/:taskId',          deleteTask);     // DELETE /api/jobs/:jobId/tasks/:taskId

module.exports = router;
