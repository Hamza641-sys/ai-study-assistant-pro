import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const audioDir = path.join(__dirname, '..', 'uploads', 'audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, audioDir),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname) || '.webm';
    cb(null, `audio_${req.user.id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg',
                   'audio/mpeg', 'audio/x-m4a', 'audio/mp3'];
  if (allowed.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed.'), false);
  }
};

export const uploadAudio = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max (Groq limit)
}).single('audio');

export const handleAudioUpload = (req, res, next) => {
  uploadAudio(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Audio upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file uploaded.' });
    }
    next();
  });
};
