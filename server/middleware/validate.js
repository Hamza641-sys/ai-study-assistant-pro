import { validationResult } from 'express-validator';

/**
 * Middleware to check express-validator results
 * Must be placed after validation chains in the route
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({
      success: false,
      message: messages[0], // Return the first error message
      errors: messages,
    });
  }
  next();
};
