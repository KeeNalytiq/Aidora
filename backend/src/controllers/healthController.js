const { getFirestore } = require('../config/firebase');
const logger = require('../utils/logger');

/**
 * Health check endpoint
 */
const healthCheck = async (req, res) => {
    try {
        const db = getFirestore();
        const startTime = Date.now();

        // Check Firestore connection
        let dbStatus = 'unknown';
        if (!db) {
            dbStatus = 'not_configured';
        } else {
            try {
                await db.collection('_health_check').limit(1).get();
                dbStatus = 'connected';
            } catch (err) {
                dbStatus = 'disconnected';
                logger.error('Database health check failed', { error: err.message });
            }
        }

        // Check NLP service
        let nlpStatus = 'unknown';
        try {
            const axios = require('axios');
            const nlpUrl = process.env.NLP_SERVICE_URL || 'http://localhost:8000';
            await axios.get(`${nlpUrl}/health`, { timeout: 2000 });
            nlpStatus = 'reachable';
        } catch (err) {
            nlpStatus = 'unreachable';
            logger.warn('NLP service health check failed', { error: err.message });
        }

        const responseTime = Date.now() - startTime;
        const isHealthy = dbStatus === 'connected' || dbStatus === 'not_configured';

        const healthData = {
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime: `${responseTime}ms`,
            services: {
                database: dbStatus,
                nlpService: nlpStatus
            },
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0'
        };

        const statusCode = isHealthy ? 200 : 503;
        res.status(statusCode).json(healthData);

        logger.info('Health check performed', healthData);

    } catch (error) {
        logger.error('Health check error', { error: error.message, stack: error.stack });
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Readiness check (for Kubernetes)
 */
const readinessCheck = async (req, res) => {
    try {
        const db = getFirestore();
        if (!db) {
            return res.status(200).json({ status: 'ready', database: 'not_configured' });
        }
        await db.collection('_health_check').limit(1).get();
        res.status(200).json({ status: 'ready' });
    } catch (error) {
        res.status(503).json({ status: 'not ready' });
    }
};

/**
 * Liveness check (for Kubernetes)
 */
const livenessCheck = (req, res) => {
    res.status(200).json({ status: 'alive' });
};

module.exports = {
    healthCheck,
    readinessCheck,
    livenessCheck
};
