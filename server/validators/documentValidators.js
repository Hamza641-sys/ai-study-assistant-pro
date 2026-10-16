import { param, body } from 'express-validator';

export const documentIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid document ID.'),
];

export const updateDocumentValidator = [
  param('id')
    .isMongoId().withMessage('Invalid document ID.'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1–200 characters.'),
];
