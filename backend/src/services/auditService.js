const { getFirestore } = require('../config/firebase');
const logger = require('../utils/logger');

/**
 * Audit Trail Service
 * Tracks all ticket-related actions for compliance and debugging
 */

class AuditService {
    constructor() {
        this.auditCollection = 'auditLogs';
    }

    // Lazy-load Firestore to avoid initialization issues
    getDb() {
        return getFirestore();
    }

    /**
     * Log an audit event
     * @param {Object} event - The audit event details
     */
    async logEvent(event) {
        try {
            const auditEntry = {
                timestamp: new Date(),
                action: event.action,
                entityType: event.entityType || 'ticket',
                entityId: event.entityId,
                userId: event.userId,
                userEmail: event.userEmail,
                userRole: event.userRole,
                changes: event.changes || {},
                metadata: event.metadata || {},
                ipAddress: event.ipAddress,
                userAgent: event.userAgent
            };

            const db = this.getDb();
            if (!db) {
                console.warn(`🛠️ Audit log skipped (Dev Mode): ${event.action}`);
                return;
            }

            await db.collection(this.auditCollection).add(auditEntry);

            logger.info('Audit event logged', {
                action: event.action,
                entityId: event.entityId,
                userId: event.userId
            });

            return auditEntry;
        } catch (error) {
            logger.error('Failed to log audit event', { error: error.message, event });
            // Don't throw - audit failures shouldn't break the main flow
        }
    }

    /**
     * Log ticket creation
     */
    async logTicketCreated(ticketId, userId, userEmail, userRole, ticketData, req) {
        return this.logEvent({
            action: 'TICKET_CREATED',
            entityId: ticketId,
            userId,
            userEmail,
            userRole,
            changes: {
                title: ticketData.title,
                category: ticketData.category,
                priority: ticketData.priority
            },
            metadata: ticketData,
            ipAddress: req?.ip,
            userAgent: req?.get('user-agent')
        });
    }

    /**
     * Log ticket update
     */
    async logTicketUpdated(ticketId, userId, userEmail, userRole, oldData, newData, req) {
        const changes = {};

        // Track what changed
        Object.keys(newData).forEach(key => {
            if (oldData[key] !== newData[key]) {
                changes[key] = {
                    from: oldData[key],
                    to: newData[key]
                };
            }
        });

        return this.logEvent({
            action: 'TICKET_UPDATED',
            entityId: ticketId,
            userId,
            userEmail,
            userRole,
            changes,
            ipAddress: req?.ip,
            userAgent: req?.get('user-agent')
        });
    }

    /**
     * Log status change
     */
    async logStatusChange(ticketId, userId, userEmail, userRole, oldStatus, newStatus, req) {
        return this.logEvent({
            action: 'STATUS_CHANGED',
            entityId: ticketId,
            userId,
            userEmail,
            userRole,
            changes: {
                status: {
                    from: oldStatus,
                    to: newStatus
                }
            },
            ipAddress: req?.ip,
            userAgent: req?.get('user-agent')
        });
    }

    /**
     * Log ticket resolution
     */
    async logTicketResolved(ticketId, userId, userEmail, userRole, resolution, req) {
        return this.logEvent({
            action: 'TICKET_RESOLVED',
            entityId: ticketId,
            userId,
            userEmail,
            userRole,
            metadata: {
                resolution
            },
            ipAddress: req?.ip,
            userAgent: req?.get('user-agent')
        });
    }

    /**
     * Log comment added
     */
    async logCommentAdded(ticketId, userId, userEmail, userRole, commentText, req) {
        return this.logEvent({
            action: 'COMMENT_ADDED',
            entityId: ticketId,
            userId,
            userEmail,
            userRole,
            metadata: {
                commentLength: commentText.length
            },
            ipAddress: req?.ip,
            userAgent: req?.get('user-agent')
        });
    }

    /**
     * Log ticket assigned
     */
    async logTicketAssigned(ticketId, userId, userEmail, userRole, assignedTo, assignedToEmail, req) {
        return this.logEvent({
            action: 'TICKET_ASSIGNED',
            entityId: ticketId,
            userId,
            userEmail,
            userRole,
            changes: {
                assignedTo: {
                    to: assignedTo
                }
            },
            metadata: {
                assignedToEmail
            },
            ipAddress: req?.ip,
            userAgent: req?.get('user-agent')
        });
    }

    /**
     * Log ticket rated
     */
    async logTicketRated(ticketId, userId, userEmail, userRole, rating, req) {
        return this.logEvent({
            action: 'TICKET_RATED',
            entityId: ticketId,
            userId,
            userEmail,
            userRole,
            metadata: {
                rating: rating.score,
                hasFeedback: !!rating.feedback
            },
            ipAddress: req?.ip,
            userAgent: req?.get('user-agent')
        });
    }

    /**
     * Get audit logs for a specific ticket
     */
    async getTicketAuditLogs(ticketId, limit = 50) {
        try {
            const snapshot = await this.getDb()
                .collection(this.auditCollection)
                .where('entityId', '==', ticketId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            logger.error('Failed to get audit logs', { error: error.message, ticketId });
            return [];
        }
    }

    /**
     * Get audit logs for a specific user
     */
    async getUserAuditLogs(userId, limit = 100) {
        try {
            const snapshot = await this.getDb()
                .collection(this.auditCollection)
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            logger.error('Failed to get user audit logs', { error: error.message, userId });
            return [];
        }
    }

    /**
     * Get recent audit logs
     */
    async getRecentAuditLogs(limit = 100) {
        try {
            const snapshot = await this.getDb()
                .collection(this.auditCollection)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            logger.error('Failed to get recent audit logs', { error: error.message });
            return [];
        }
    }
}

// Export singleton instance
module.exports = new AuditService();
