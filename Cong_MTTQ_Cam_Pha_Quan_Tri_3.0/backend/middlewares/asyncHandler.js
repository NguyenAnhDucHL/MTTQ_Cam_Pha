/**
 * A middleware to wrap async route handlers.
 * It catches any errors and passes them to the next() error handler.
 */
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
