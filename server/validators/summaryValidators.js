import { body, param } from 'express-validator';

const VALID_TYPES = ['short', 'detailed', 'key_points', 'definitions', 'revision', 'chapter_wise'];

export const generateSummaryValidator = [
  body('summaryType')
    .notEmpty().withMessage('Summary type is required.')
    .isIn(VALID_TYPES)
    .withMessage(`Summary type must be one of: ${VALID_TYPES.join(', ')}.`),

  body('documentId')
    .optional()
    .isMongoId().withMessage('Invalid document ID.'),

  body('customText')
    .optional()
    .trim()
    .isLength({ min: 50, max: 20000 })
    .withMessage('Custom text must be 50–20,000 characters.'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters.'),
];

export const summaryIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid summary ID.'),
];
