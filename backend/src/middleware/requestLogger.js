const morgan = require('morgan');
const logger = require('../utils/logger');

// Create a stream object for Morgan to use
const stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// Custom Morgan format
const morganFormat = ':remote-addr :method :url :status :res[content-length] - :response-time ms';

// Create Morgan middleware
const requestLogger = morgan(morganFormat, { stream });

// Log request details
const logRequest = (req, res, next) => {
    const startTime = Date.now();

    // Log response when it finishes
    res.on('finish', () => {
        const duration = Date.now() - startTime;

        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
        };

        // Add user info if authenticated
        if (req.user) {
            logData.userId = req.user.uid;
            logData.userRole = req.user.role;
        }

        // Log as error if status >= 400
        if (res.statusCode >= 400) {
            logger.error('HTTP Request Failed', logData);
        } else {
            logger.info('HTTP Request', logData);
        }
    });

    next();
};

module.exports = { requestLogger, logRequest };
