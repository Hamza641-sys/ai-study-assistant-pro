import express from 'express';
import { askQuestion } from '../controllers/ragController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { ragQuestionValidator } from '../validators/conversationValidators.js';

const router = express.Router();

router.use(protect);

// POST /api/rag/ask  — ask a question grounded in documents
router.post('/ask', aiLimiter, ragQuestionValidator, validate, askQuestion);

export default router;
