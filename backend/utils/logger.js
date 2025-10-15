const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime
});

const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = {
  logger,
  morganStream
};
