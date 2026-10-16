import { body, param } from 'express-validator';

export const generateQuizValidator = [
  body('sourceType')
    .notEmpty().withMessage('sourceType is required.')
    .isIn(['document', 'topic']).withMessage('sourceType must be "document" or "topic".'),

  body('documentId')
    .if(body('sourceType').equals('document'))
    .notEmpty().withMessage('documentId is required for document-based quizzes.')
    .isMongoId().withMessage('Invalid document ID.'),

  body('topic')
    .if(body('sourceType').equals('topic'))
    .trim()
    .notEmpty().withMessage('Topic is required for topic-based quizzes.')
    .isLength({ max: 200 }).withMessage('Topic cannot exceed 200 characters.'),

  body('numQuestions')
    .optional()
    .isInt({ min: 3, max: 20 })
    .withMessage('Number of questions must be between 3 and 20.'),
];

export const submitQuizValidator = [
  param('id')
    .isMongoId().withMessage('Invalid quiz attempt ID.'),

  body('answers')
    .notEmpty().withMessage('Answers are required.')
    .isArray({ min: 1 }).withMessage('Answers must be a non-empty array.'),

  body('answers.*.questionNumber')
    .isInt({ min: 1 }).withMessage('Each answer must have a valid questionNumber.'),

  body('answers.*.answer')
    .isIn(['A', 'B', 'C', 'D']).withMessage('Each answer must be A, B, C, or D.'),

  body('timeTaken')
    .optional()
    .isInt({ min: 0 }).withMessage('timeTaken must be a positive integer (seconds).'),
];

export const quizIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid quiz attempt ID.'),
];
