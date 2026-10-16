import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store in user-specific subdirectory
    const userDir = path.join(uploadsDir, req.user.id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename and add timestamp to prevent collisions
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);
    const uniqueName = `${baseName}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter — accept PDFs only, validate mime type (not just extension)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf'];
  const allowedExtensions = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    const error = new Error('Only PDF files are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);

export const uploadPDF = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_MB * 1024 * 1024,
    files: 1,
  },
}).single('file');

/**
 * Wrapper to handle multer errors gracefully
 */
export const handleUpload = (req, res, next) => {
  uploadPDF(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: `File too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`,
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a PDF file.',
      });
    }

    next();
  });
};
