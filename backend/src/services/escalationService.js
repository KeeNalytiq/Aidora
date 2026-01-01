const { getFirestore } = require('../config/firebase');

/**
 * Check and escalate tickets approaching SLA breach
 */
const checkAndEscalateTickets = async () => {
    try {
        const db = getFirestore();
        const now = new Date();

        // Get all open/in_progress tickets
        const ticketsSnapshot = await db.collection('tickets')
            .where('status', 'in', ['open', 'in_progress'])
            .get();

        const escalations = [];

        for (const doc of ticketsSnapshot.docs) {
            const ticket = doc.data();

            if (!ticket.sla || !ticket.createdAt) continue;

            const createdAt = ticket.createdAt.toDate();
            const elapsedMinutes = (now - createdAt) / (1000 * 60);
            const slaTarget = ticket.sla.targetResolutionTime;
            const slaPercentage = (elapsedMinutes / slaTarget) * 100;

            // Escalate if at 80% of SLA and not already critical
            if (slaPercentage >= 80 && ticket.priority !== 'critical' && !ticket.escalated) {
                await doc.ref.update({
                    priority: 'critical',
                    escalated: true,
                    escalatedAt: now,
                    escalationReason: `SLA at ${slaPercentage.toFixed(0)}%`,
                    sla: {
                        ...ticket.sla,
                        slaStatus: 'at_risk'
                    }
                });

                escalations.push({
                    ticketId: doc.id,
                    title: ticket.title,
                    slaPercentage: slaPercentage.toFixed(0)
                });

                console.log(`✅ Escalated ticket ${doc.id} - SLA at ${slaPercentage.toFixed(0)}%`);
            }
        }

        if (escalations.length > 0) {
            console.log(`⚠️  Escalated ${escalations.length} tickets`);
        }

        return escalations;

    } catch (error) {
        console.error('Escalation check error:', error);
        return [];
    }
};

// Export function
module.exports = { checkAndEscalateTickets };
