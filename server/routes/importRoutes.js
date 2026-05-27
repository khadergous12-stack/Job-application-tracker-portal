const express = require('express');
const { importCSV, downloadTemplate } = require('../controllers/importController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Temp storage for CSV uploads
const tmpDir = path.join(__dirname, '..', 'uploads', 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const csvUpload = multer({
  dest: tmpDir,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max for CSV
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

router.use(protect);

router.get('/template',          downloadTemplate);               // GET  /api/import/template
router.post('/csv', csvUpload.single('file'), importCSV);        // POST /api/import/csv

module.exports = router;
