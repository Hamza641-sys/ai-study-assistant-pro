import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT token for a user
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify and decode a JWT token
 * Returns decoded payload or throws an error
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
