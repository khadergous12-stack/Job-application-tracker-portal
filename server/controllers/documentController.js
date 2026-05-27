const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const JobApplication = require('../models/JobApplication');
const { uploadsDir } = require('../config/multer');

// ─── @desc   Get all documents for a job application
// ─── @route  GET /api/jobs/:jobId/documents
// ─── @access Private
const getDocuments = async (req, res) => {
  try {
    const job = await JobApplication.findOne({ _id: req.params.jobId, user: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job application not found' });

    const docs = await Document.find({ application: req.params.jobId, user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching documents' });
  }
};

// ─── @desc   Upload a document for a job application
// ─── @route  POST /api/jobs/:jobId/documents
// ─── @access Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const job = await JobApplication.findOne({ _id: req.params.jobId, user: req.user._id });
    if (!job) {
      // cleanup uploaded file if job not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Job application not found' });
    }

    const doc = await Document.create({
      application: req.params.jobId,
      user: req.user._id,
      kind: req.body.kind || 'Resume',
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });

    res.status(201).json({ message: 'Document uploaded successfully', document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error uploading document' });
  }
};

// ─── @desc   Download a document
// ─── @route  GET /api/jobs/:jobId/documents/:docId/download
// ─── @access Private
const downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.docId,
      application: req.params.jobId,
      user: req.user._id,
    });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (!fs.existsSync(doc.path)) {
      return res.status(404).json({ message: 'File no longer exists on server' });
    }

    res.download(doc.path, doc.originalName);
  } catch (err) {
    res.status(500).json({ message: 'Server error downloading document' });
  }
};

// ─── @desc   Delete a document
// ─── @route  DELETE /api/jobs/:jobId/documents/:docId
// ─── @access Private
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({
      _id: req.params.docId,
      application: req.params.jobId,
      user: req.user._id,
    });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    // Remove file from disk
    if (fs.existsSync(doc.path)) {
      fs.unlinkSync(doc.path);
    }

    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting document' });
  }
};

module.exports = { getDocuments, uploadDocument, downloadDocument, deleteDocument };
