const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      error: 'Rate limit exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
const generalLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX) || 100,
  'Too many requests from this IP'
);

const uploadLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  10, // 10 uploads per 5 minutes
  'Too many upload attempts'
);

const createLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  20, // 20 creates per minute
  'Too many creation attempts'
);

module.exports = {
  generalLimiter,
  uploadLimiter,
  createLimiter
};
