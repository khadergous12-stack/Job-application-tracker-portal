const express = require('express');
const { getDocuments, uploadDocument, downloadDocument, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/multer');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/',                        getDocuments);                       // GET    /api/jobs/:jobId/documents
router.post('/',  upload.single('file'), uploadDocument);                  // POST   /api/jobs/:jobId/documents
router.get('/:docId/download',         downloadDocument);                  // GET    /api/jobs/:jobId/documents/:docId/download
router.delete('/:docId',               deleteDocument);                    // DELETE /api/jobs/:jobId/documents/:docId

module.exports = router;
