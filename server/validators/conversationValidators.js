import { body, param, query } from 'express-validator';

export const createConversationValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters.'),

  body('mode')
    .optional()
    .isIn(['general', 'rag']).withMessage('Mode must be "general" or "rag".'),

  body('documentIds')
    .optional()
    .isArray().withMessage('documentIds must be an array.'),

  body('documentIds.*')
    .optional()
    .isMongoId().withMessage('Each documentId must be a valid ID.'),
];

export const sendMessageValidator = [
  param('conversationId')
    .isMongoId().withMessage('Invalid conversation ID.'),

  body('content')
    .trim()
    .notEmpty().withMessage('Message content is required.')
    .isLength({ max: 4000 }).withMessage('Message cannot exceed 4000 characters.'),

  body('documentIds')
    .optional()
    .isArray().withMessage('documentIds must be an array.'),
];

export const ragQuestionValidator = [
  body('question')
    .trim()
    .notEmpty().withMessage('Question is required.')
    .isLength({ max: 1000 }).withMessage('Question cannot exceed 1000 characters.'),

  body('documentIds')
    .notEmpty().withMessage('At least one document ID is required.')
    .isArray({ min: 1 }).withMessage('documentIds must be a non-empty array.'),

  body('documentIds.*')
    .isMongoId().withMessage('Each documentId must be a valid ID.'),

  body('conversationId')
    .optional()
    .isMongoId().withMessage('Invalid conversation ID.'),
];
