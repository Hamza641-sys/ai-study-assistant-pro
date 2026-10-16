import express from 'express';
import {
  generateQuizHandler,
  submitQuiz,
  getQuizAttempts,
  getQuizAttempt,
} from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import {
  generateQuizValidator,
  submitQuizValidator,
  quizIdValidator,
} from '../validators/quizValidators.js';

const router = express.Router();

router.use(protect);

router.get('/',              getQuizAttempts);
router.post('/generate',     aiLimiter, generateQuizValidator, validate, generateQuizHandler);
router.post('/:id/submit',   submitQuizValidator, validate, submitQuiz);
router.get('/:id',           quizIdValidator, validate, getQuizAttempt);

export default router;
