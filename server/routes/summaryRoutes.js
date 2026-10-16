import express from 'express';
import {
  generateSummaryHandler,
  getSummaries,
  getSummary,
  deleteSummary,
} from '../controllers/summaryController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import {
  generateSummaryValidator,
  summaryIdValidator,
} from '../validators/summaryValidators.js';

const router = express.Router();

router.use(protect);

router.get('/',            getSummaries);
router.post('/generate',   aiLimiter, generateSummaryValidator, validate, generateSummaryHandler);
router.get('/:id',         summaryIdValidator, validate, getSummary);
router.delete('/:id',      summaryIdValidator, validate, deleteSummary);

export default router;
