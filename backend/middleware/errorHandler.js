const { logger } = require('../utils/logger');

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Resource not found'
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isServerError = status >= 500;

  logger.error(
    {
      err,
      path: req.path,
      method: req.method,
      status
    },
    'Request failed'
  );

  if (res.headersSent) {
    return;
  }

  res.status(status).json({
    error: isServerError ? 'Internal server error' : err.message || 'Request failed'
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
