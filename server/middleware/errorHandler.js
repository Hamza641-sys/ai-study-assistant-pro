/**
 * Central error handling middleware
 * Catches all errors thrown by controllers and returns consistent JSON responses
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log the full error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  } else {
    // Production: log without sensitive details
    console.error(`Error [${statusCode}]: ${message}`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join('. ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = `File too large. Maximum allowed size is ${process.env.MAX_FILE_SIZE_MB || 10}MB.`;
  }

  // OpenAI API errors — don't leak details to client
  if (err.name === 'APIError' || err.constructor?.name === 'APIError') {
    statusCode = 502;
    message = 'AI service is temporarily unavailable. Please try again.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler — must be registered after all routes
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async wrapper — eliminates try/catch boilerplate in controllers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
