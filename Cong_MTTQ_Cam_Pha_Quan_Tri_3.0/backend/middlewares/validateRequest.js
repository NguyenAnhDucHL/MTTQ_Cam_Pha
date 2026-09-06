const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return first error message for simplicity or all errors
    return res.status(400).json({
      error: errors.array()[0].msg,
      details: errors.array()
    });
  }
  next();
};

module.exports = { validateRequest };
