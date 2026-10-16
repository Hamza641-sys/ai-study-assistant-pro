import express from 'express';
import {
  createConversation,
  getConversations,
  getConversation,
  sendMessage,
  deleteConversation,
} from '../controllers/conversationController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import {
  createConversationValidator,
  sendMessageValidator,
} from '../validators/conversationValidators.js';
import { param } from 'express-validator';

const router = express.Router();

router.use(protect);

router.get('/',    getConversations);
router.post('/',   createConversationValidator, validate, createConversation);

router.get('/:id',
  [param('id').isMongoId().withMessage('Invalid conversation ID.')],
  validate,
  getConversation
);

router.post('/:conversationId/messages',
  aiLimiter,
  sendMessageValidator,
  validate,
  sendMessage
);

router.delete('/:id',
  [param('id').isMongoId().withMessage('Invalid conversation ID.')],
  validate,
  deleteConversation
);

export default router;
