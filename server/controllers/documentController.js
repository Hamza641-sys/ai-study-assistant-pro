import path from 'path';
import fs from 'fs';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { processPDF } from '../services/pdfProcessor.js';

/**
 * @route   POST /api/documents/upload
 * @desc    Upload and process a PDF document
 * @access  Private
 */
export const uploadDocument = asyncHandler(async (req, res) => {
  const file = req.file;
  const title = req.body.title || path.parse(file.originalname).name;

  // Create document record with 'uploading' status
  const document = await Document.create({
    userId: req.user.id,
    title: title.substring(0, 200),
    originalName: file.originalname,
    filePath: file.path,
    fileSize: file.size,
    mimeType: file.mimetype,
    status: 'processing',
  });

  // Respond immediately so the client doesn't wait
  res.status(202).json({
    success: true,
    message: 'File uploaded. Processing started.',
    document: {
      _id: document._id,
      title: document.title,
      originalName: document.originalName,
      fileSize: document.fileSize,
      status: document.status,
      createdAt: document.createdAt,
    },
  });

  // Process PDF asynchronously (don't await — already responded)
  processPDF(document, req.user.id).catch(async (err) => {
    console.error(`PDF processing failed for document ${document._id}:`, err.message);
    await Document.findByIdAndUpdate(document._id, {
      status: 'failed',
      processingError: err.message,
    });
  });
});

/**
 * @route   GET /api/documents
 * @desc    Get all documents for the authenticated user
 * @access  Private
 */
export const getDocuments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    Document.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-filePath'), // Never expose file system path to client
    Document.countDocuments({ userId: req.user.id }),
  ]);

  res.status(200).json({
    success: true,
    data: documents,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @route   GET /api/documents/:id
 * @desc    Get a single document (owner only)
 * @access  Private
 */
export const getDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user.id, // Ownership check
  }).select('-filePath');

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found.',
    });
  }

  res.status(200).json({
    success: true,
    data: document,
  });
});

/**
 * @route   GET /api/documents/:id/status
 * @desc    Get processing status of a document
 * @access  Private
 */
export const getDocumentStatus = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).select('status processingError chunkCount pageCount wordCount');

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found.',
    });
  }

  res.status(200).json({
    success: true,
    data: document,
  });
});

/**
 * @route   PUT /api/documents/:id
 * @desc    Update document title
 * @access  Private
 */
export const updateDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found.',
    });
  }

  if (req.body.title) document.title = req.body.title;
  await document.save();

  res.status(200).json({
    success: true,
    message: 'Document updated successfully.',
    data: document,
  });
});

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document and its chunks (owner only)
 * @access  Private
 */
export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user.id, // Ownership check
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found.',
    });
  }

  // Delete file from disk
  if (document.filePath && fs.existsSync(document.filePath)) {
    fs.unlinkSync(document.filePath);
  }

  // Delete all chunks associated with this document
  await DocumentChunk.deleteMany({ documentId: document._id });

  // Delete the document record
  await document.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Document deleted successfully.',
  });
});
