const { getFirestore } = require('../config/firebase');

/**
 * Get analytics dashboard data
 */
const getAnalytics = async (req, res) => {
    try {
        const db = getFirestore();

        // Get all tickets
        const ticketsSnapshot = await db.collection('tickets').get();

        const analytics = {
            totalTickets: 0,
            categoryBreakdown: {},
            priorityBreakdown: {},
            statusBreakdown: {},
            avgResolutionTime: 0,
            slaCompliance: 0
        };

        let totalResolutionTime = 0;
        let resolvedCount = 0;
        let compliantCount = 0;

        ticketsSnapshot.forEach(doc => {
            const ticket = doc.data();
            analytics.totalTickets++;

            // Category breakdown
            analytics.categoryBreakdown[ticket.category] =
                (analytics.categoryBreakdown[ticket.category] || 0) + 1;

            // Priority breakdown
            analytics.priorityBreakdown[ticket.priority] =
                (analytics.priorityBreakdown[ticket.priority] || 0) + 1;

            // Status breakdown
            analytics.statusBreakdown[ticket.status] =
                (analytics.statusBreakdown[ticket.status] || 0) + 1;

            // Resolution time
            if (ticket.status === 'resolved' && ticket.sla.resolutionTime) {
                totalResolutionTime += ticket.sla.resolutionTime;
                resolvedCount++;
            }

            // SLA compliance
            if (ticket.sla.slaStatus === 'compliant') {
                compliantCount++;
            }
        });

        // Calculate averages
        if (resolvedCount > 0) {
            analytics.avgResolutionTime = Math.round(totalResolutionTime / resolvedCount);
        }

        if (analytics.totalTickets > 0) {
            analytics.slaCompliance = (compliantCount / analytics.totalTickets * 100).toFixed(2);
        }

        res.json(analytics);

    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve analytics'
        });
    }
};

/**
 * Get ticket trends over time
 */
const getTicketTrends = async (req, res) => {
    try {
        const db = getFirestore();
        const { days = 7 } = req.query;

        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(days));

        const snapshot = await db
            .collection('tickets')
            .where('createdAt', '>=', daysAgo)
            .orderBy('createdAt', 'asc')
            .get();

        // Group tickets by day
        const trends = {};

        snapshot.forEach(doc => {
            const ticket = doc.data();
            const date = ticket.createdAt.toDate().toISOString().split('T')[0];

            if (!trends[date]) {
                trends[date] = { date, count: 0, categories: {} };
            }

            trends[date].count++;
            trends[date].categories[ticket.category] =
                (trends[date].categories[ticket.category] || 0) + 1;
        });

        res.json(Object.values(trends));

    } catch (error) {
        console.error('Get ticket trends error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve ticket trends'
        });
    }
};

module.exports = {
    getAnalytics,
    getTicketTrends
};
