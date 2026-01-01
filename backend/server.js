require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./src/utils/logger');
const { requestLogger, logRequest } = require('./src/middleware/requestLogger');
const cron = require('node-cron');
const { initializeFirebase } = require('./src/config/firebase');
const routes = require('./src/routes');
const { checkSLACompliance } = require('./src/services/slaService');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase
initializeFirebase();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use(requestLogger);
app.use(logRequest);
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const { apiLimiter } = require('./src/middleware/rateLimiter');
app.use('/api', apiLimiter);

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'TSE Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            auth: '/api/auth',
            tickets: '/api/tickets',
            analytics: '/api/analytics'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

// Schedule SLA compliance check every 15 minutes
cron.schedule('*/15 * * * *', () => {
    console.log('Running SLA compliance check...');
    checkSLACompliance();
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║   TSE Backend Server Started          ║
║   Port: ${PORT}                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}         ║
║   SLA monitoring: Active              ║
╚═══════════════════════════════════════╝
  `);

    // Run initial SLA check
    setTimeout(() => {
        checkSLACompliance();
    }, 5000);
});

module.exports = app;
