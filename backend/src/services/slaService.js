const { getFirestore } = require('../config/firebase');

/**
 * SLA time thresholds (in minutes)
 */
const SLA_TARGETS = {
    critical: 2 * 60,    // 2 hours
    high: 8 * 60,        // 8 hours
    medium: 24 * 60,     // 24 hours
    low: 72 * 60         // 72 hours
};

/**
 * Check and update SLA status for all open tickets
 */
const checkSLACompliance = async () => {
    try {
        const db = getFirestore();
        if (!db) return; // Silent return if Firebase is not ready

        const now = new Date();

        // Get all open/in-progress tickets
        const snapshot = await db
            .collection('tickets')
            .where('status', 'in', ['open', 'in_progress'])
            .get();

        console.log(`Checking SLA compliance for ${snapshot.size} active tickets...`);

        const batch = db.batch();
        let updatedCount = 0;

        snapshot.forEach(doc => {
            const ticket = doc.data();
            const createdAt = ticket.createdAt.toDate();
            const elapsedMinutes = Math.round((now - createdAt) / (1000 * 60));
            const targetTime = SLA_TARGETS[ticket.priority];

            let newStatus = 'compliant';

            // Calculate SLA status
            if (elapsedMinutes >= targetTime) {
                newStatus = 'breached';
            } else if (elapsedMinutes >= targetTime * 0.8) {
                // Within 80% of target time = at risk
                newStatus = 'at_risk';
            }

            // Update only if status changed
            if (ticket.sla.slaStatus !== newStatus) {
                const ticketRef = db.collection('tickets').doc(doc.id);
                batch.update(ticketRef, {
                    'sla.slaStatus': newStatus,
                    updatedAt: now
                });
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            await batch.commit();
            console.log(`✓ Updated SLA status for ${updatedCount} tickets`);
        } else {
            console.log('✓ All tickets SLA status up to date');
        }

    } catch (error) {
        console.error('SLA check error:', error);
    }
};

/**
 * Get SLA statistics
 */
const getSLAStats = async (req, res) => {
    try {
        const db = getFirestore();
        if (!db) {
            return res.json({
                total: 0,
                compliant: 0,
                atRisk: 0,
                breached: 0,
                complianceRate: "0.00"
            });
        }

        // Get all tickets
        const snapshot = await db.collection('tickets').get();

        const stats = {
            total: 0,
            compliant: 0,
            atRisk: 0,
            breached: 0,
            complianceRate: 0
        };

        snapshot.forEach(doc => {
            const ticket = doc.data();
            stats.total++;

            if (ticket.sla.slaStatus === 'compliant') stats.compliant++;
            else if (ticket.sla.slaStatus === 'at_risk') stats.atRisk++;
            else if (ticket.sla.slaStatus === 'breached') stats.breached++;
        });

        if (stats.total > 0) {
            stats.complianceRate = (stats.compliant / stats.total * 100).toFixed(2);
        }

        res.json(stats);

    } catch (error) {
        console.error('Get SLA stats error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve SLA statistics'
        });
    }
};

module.exports = {
    checkSLACompliance,
    getSLAStats,
    SLA_TARGETS
};
