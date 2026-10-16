import express from 'express';
import { transcribeAudioHandler } from '../controllers/voiceController.js';
import { protect } from '../middleware/auth.js';
import { handleAudioUpload } from '../middleware/uploadAudio.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

// POST /api/voice/transcribe — audio file → text (Groq Whisper)
router.post('/transcribe', aiLimiter, handleAudioUpload, transcribeAudioHandler);

export default router;
