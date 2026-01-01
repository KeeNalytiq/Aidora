const logger = require('../utils/logger');

/**
 * Rule-based fallback classifier
 * Used when AI/NLP service is unavailable
 */
const ruleBasedClassification = (title, description) => {
    const text = (title + ' ' + description).toLowerCase();

    logger.info('Using rule-based classification fallback');

    // Payment/Billing
    if (text.match(/payment|billing|charge|refund|invoice|transaction|card/i)) {
        return {
            category: 'payment',
            priority: text.match(/urgent|asap|immediately/i) ? 'high' : 'medium',
            confidence: 0.7,
            method: 'rule-based-fallback'
        };
    }

    // Authentication/Login
    if (text.match(/login|sign in|password|auth|access|account|2fa|reset/i)) {
        return {
            category: 'authentication',
            priority: text.match(/locked|can't login|cannot access/i) ? 'high' : 'medium',
            confidence: 0.7,
            method: 'rule-based-fallback'
        };
    }

    // API Issues
    if (text.match(/api|endpoint|request|response|integration|webhook/i)) {
        return {
            category: 'api',
            priority: text.match(/down|not working|failing|error 500/i) ? 'critical' : 'medium',
            confidence: 0.7,
            method: 'rule-based-fallback'
        };
    }

    // Performance
    if (text.match(/slow|performance|lag|timeout|loading|speed/i)) {
        return {
            category: 'performance',
            priority: text.match(/completely|not loading|down/i) ? 'high' : 'medium',
            confidence: 0.6,
            method: 'rule-based-fallback'
        };
    }

    // Bug Reports
    if (text.match(/bug|error|crash|broken|not working|issue|problem/i)) {
        return {
            category: 'bug',
            priority: text.match(/critical|urgent|production|data loss/i) ? 'critical' : 'medium',
            confidence: 0.6,
            method: 'rule-based-fallback'
        };
    }

    // Feature Requests
    if (text.match(/feature|enhancement|suggestion|would like|could you add|want/i)) {
        return {
            category: 'feature',
            priority: 'low',
            confidence: 0.6,
            method: 'rule-based-fallback'
        };
    }

    // Default fallback
    return {
        category: 'bug',
        priority: 'medium',
        confidence: 0.5,
        method: 'rule-based-fallback'
    };
};

module.exports = { ruleBasedClassification };
