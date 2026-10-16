import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
    .matches(/\d/).withMessage('Password must contain at least one number.'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters.'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Bio cannot exceed 200 characters.'),
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters.')
    .matches(/\d/).withMessage('New password must contain at least one number.'),
];
