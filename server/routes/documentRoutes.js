import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  getDocumentStatus,
  updateDocument,
  deleteDocument,
} from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';
import { handleUpload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import {
  documentIdValidator,
  updateDocumentValidator,
} from '../validators/documentValidators.js';

const router = express.Router();

// All document routes require authentication
router.use(protect);

router.get('/',                          getDocuments);
router.post('/upload', uploadLimiter, handleUpload, uploadDocument);
router.get('/:id',    documentIdValidator, validate, getDocument);
router.get('/:id/status', documentIdValidator, validate, getDocumentStatus);
router.put('/:id',    updateDocumentValidator, validate, updateDocument);
router.delete('/:id', documentIdValidator, validate, deleteDocument);

export default router;
