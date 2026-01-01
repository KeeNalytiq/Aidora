const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too Many Requests',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method
        });
        res.status(429).json({
            error: 'Too Many Requests',
            message: 'Too many requests, please try again later.'
        });
    }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
        error: 'Too Many Login Attempts',
        message: 'Too many login attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    handler: (req, res) => {
        logger.warn('Auth rate limit exceeded', {
            ip: req.ip,
            email: req.body.email
        });
        res.status(429).json({
            error: 'Too Many Login Attempts',
            message: 'Too many failed login attempts. Please try again in 15 minutes.'
        });
    }
});

// Moderate rate limiter for ticket creation
const createTicketLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 tickets per hour per IP
    message: {
        error: 'Ticket Creation Limit Exceeded',
        message: 'You can only create 10 tickets per hour.',
        retryAfter: '1 hour'
    },
    handler: (req, res) => {
        logger.warn('Ticket creation rate limit exceeded', {
            ip: req.ip,
            userId: req.user?.uid
        });
        res.status(429).json({
            error: 'Too Many Tickets',
            message: 'You have created too many tickets. Please wait before creating more.'
        });
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    createTicketLimiter
};
