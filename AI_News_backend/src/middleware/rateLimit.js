const rateLimit = require("express-rate-limit");

// Generic limiter
exports.generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth limiter (strict)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many attempts. Try again later."
});

// Search limiter
exports.searchLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  message: "Too many searches. Slow down."
});

// Interaction limiter (likes/comments)
exports.interactionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: "Too many actions. Please slow down."
});
