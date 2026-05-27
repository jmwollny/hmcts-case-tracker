// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Validation errors
  if (err.details && Array.isArray(err.details)) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.details.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Database errors
  if (err.message && err.message.includes('SQLITE_CONSTRAINT')) {
    return res.status(409).json({
      success: false,
      message: 'Database constraint violation'
    });
  }

  // Not found errors
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      message: err.message || 'Resource not found'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
