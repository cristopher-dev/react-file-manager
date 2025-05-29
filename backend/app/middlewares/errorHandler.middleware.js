const multer = require("multer");
const logger = require("../config/logger.config");

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    const multerErrors = {
      'LIMIT_FILE_SIZE': 'File size too large',
      'LIMIT_FILE_COUNT': 'Too many files',
      'LIMIT_FIELD_COUNT': 'Too many fields',
      'LIMIT_UNEXPECTED_FILE': 'Unexpected field name'
    };
    
    return res.status(400).json({
      success: false,
      message: multerErrors[err.code] || 'File upload error',
      error: err.code
    });
  }

  // Handle MongoDB validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
      error: 'Duplicate key error'
    });
  }

  // Handle cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: 'Cast error'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;
