const { getFirestore } = require('../config/firebase');
const axios = require('axios');
const logger = require('../utils/logger');
const auditService = require('../services/auditService');

const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://localhost:8000';

/**
 * Create a new ticket
 */
const createTicket = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.uid;

        // Validate input
        if (!title || !description) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Title and description are required'
            });
        }

        const db = getFirestore();
        const now = new Date();

        console.log('\n📝 CREATE TICKET REQUEST');
        console.log('  - User UID:', userId);
        console.log('  - User Email:', req.user.email);
        console.log('  - User Role:', req.user.role || req.userProfile?.role || 'unknown');
        console.log('  - Title:', title.substring(0, 50));

        // Call NLP service for classification
        let classification = null;
        try {
            const nlpResponse = await axios.post(`${NLP_SERVICE_URL}/api/nlp/classify`, {
                title,
                description
            }, { timeout: 5000 }); // 5 second timeout

            classification = nlpResponse.data;
            logger.info('AI classification successful', { classification });

        } catch (nlpError) {
            logger.warn('NLP service unavailable, using fallback classifier', {
                error: nlpError.message
            });

            // Use intelligent rule-based fallback
            const { ruleBasedClassification } = require('../services/fallbackClassifier');
            classification = ruleBasedClassification(title, description);

            logger.info('Fallback classification applied', { classification });
        }

        // Calculate SLA target based on priority
        const slaTargets = {
            critical: 2 * 60,  // 2 hours in minutes
            high: 8 * 60,      // 8 hours
            medium: 24 * 60,   // 24 hours
            low: 72 * 60       // 72 hours
        };

        // Create ticket document
        const ticketData = {
            userId,
            title,
            description,
            status: 'open',
            category: classification.category,
            priority: classification.priority,
            createdAt: now,
            updatedAt: now,
            classification: {
                predictedCategory: classification.category,
                predictedPriority: classification.priority,
                confidenceScore: classification.confidence,
                keywords: classification.keywords,
                reasoning: classification.reasoning,
                classifiedAt: now
            },
            sla: {
                targetResolutionTime: slaTargets[classification.priority],
                slaStatus: 'compliant',
                firstResponseTime: null,
                resolutionTime: null
            }
        };

        // Add to database (Could be real Firestore or MockDb)
        const ticketRef = await db.collection('tickets').add(ticketData);

        // [DEVELOPER BYPASS LOG]
        const { isFirebaseReady } = require('../config/firebase');
        if (!isFirebaseReady) {
            console.warn('🛠️ Developer Bypass: Ticket saved to In-Memory store.');
        }

        // Log audit trail (non-blocking - don't wait for it)
        auditService.logTicketCreated(
            ticketRef.id,
            userId,
            req.user.email,
            req.userProfile?.role || 'customer',
            ticketData,
            req
        ).catch(err => logger.error('Audit log failed', { error: err.message }));

        // Return created ticket with ID
        console.log('✅ Ticket Created Successfully:', ticketRef.id);
        res.status(201).json({
            ticketId: ticketRef.id,
            ...ticketData,
            classification,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
        });

    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create ticket'
        });
    }
};

/**
 * Get all tickets (filtered by role)
 */
const getTickets = async (req, res) => {
    try {
        const db = getFirestore();
        const { status, category, priority } = req.query;

        console.log('\n=== GET TICKETS ===');
        console.log('User UID:', req.user.uid);
        console.log('User Role:', req.user.role);
        console.log('Filters:', { status, category, priority });

        let query = db.collection('tickets');

        // Role-based filtering
        if (req.user.role === 'customer') {
            // Customers see only their tickets
            console.log('🔒 CUSTOMER FILTER APPLIED - Filtering for userId:', req.user.uid);
            query = query.where('userId', '==', req.user.uid);
        } else if (req.user.role === 'engineer') {
            console.log('👔 ENGINEER - viewing all tickets');
            // Engineers see all tickets or assigned tickets
            if (req.query.assigned === 'true') {
                query = query.where('assignedTo', '==', req.user.uid);
            }
        } else {
            console.log('👑 ADMIN or OTHER - viewing all tickets');
        }

        console.log('Executing query...');
        const snapshot = await query.get();
        console.log(`📡 DB RESPONSE: Found ${snapshot.size} tickets total`);

        const tickets = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const matchesUser = data.userId === req.user.uid;
            console.log(`  ${matchesUser ? '✅' : '❌'} Ticket ID: ${doc.id} | userId: "${data.userId}" | requestingUser: "${req.user.uid}" | Match: ${matchesUser} | Title: ${data.title.substring(0, 40)}`);
            tickets.push({
                ticketId: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString(),
                updatedAt: doc.data().updatedAt?.toDate().toISOString(),
                closedAt: doc.data().closedAt?.toDate().toISOString() || null
            });
        });

        // Final verification for customer role
        if (req.user.role === 'customer') {
            const nonMatchingTickets = tickets.filter(t => t.userId !== req.user.uid);
            if (nonMatchingTickets.length > 0) {
                console.error('🚨 SECURITY VIOLATION: Customer is receiving tickets that don\'t belong to them!');
                console.error('Non-matching tickets:', nonMatchingTickets.map(t => ({ id: t.ticketId, userId: t.userId })));
            }
        }

        console.log(`📤 Returning ${tickets.length} tickets to client`);
        console.log('==================\n');
        res.json({ tickets, count: tickets.length });

    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve tickets'
        });
    }
};

/**
 * Get single ticket by ID with recommendations
 */
const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getFirestore();

        const doc = await db.collection('tickets').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Ticket not found'
            });
        }

        const ticketData = doc.data();

        // Check permission
        if (req.user.role === 'customer' && ticketData.userId !== req.user.uid) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Access denied'
            });
        }

        // Get comments
        const commentsSnapshot = await db
            .collection('tickets')
            .doc(id)
            .collection('comments')
            .orderBy('createdAt', 'asc')
            .get();

        const comments = [];
        commentsSnapshot.forEach(doc => {
            comments.push({
                commentId: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString()
            });
        });

        // Get resolution if exists
        const resolutionsSnapshot = await db
            .collection('tickets')
            .doc(id)
            .collection('resolutions')
            .limit(1)
            .get();

        let resolution = null;
        if (!resolutionsSnapshot.empty) {
            const resDoc = resolutionsSnapshot.docs[0];
            resolution = {
                resolutionId: resDoc.id,
                ...resDoc.data(),
                resolvedAt: resDoc.data().resolvedAt?.toDate().toISOString()
            };
        }

        res.json({
            ticketId: id,
            ...ticketData,
            createdAt: ticketData.createdAt?.toDate().toISOString(),
            updatedAt: ticketData.updatedAt?.toDate().toISOString(),
            closedAt: ticketData.closedAt?.toDate().toISOString() || null,
            comments,
            resolution
        });

    } catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve ticket'
        });
    }
};

/**
 * Update ticket status
 */
const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedTo } = req.body;
        const db = getFirestore();

        const ticketRef = db.collection('tickets').doc(id);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Ticket not found'
            });
        }

        const updateData = {
            updatedAt: new Date()
        };

        if (status) {
            updateData.status = status;
            if (status === 'closed') {
                updateData.closedAt = new Date();
            }
        }

        if (assignedTo !== undefined) {
            updateData.assignedTo = assignedTo;
        }

        await ticketRef.update(updateData);

        res.json({
            message: 'Ticket updated successfully',
            ticketId: id,
            updates: updateData
        });

    } catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update ticket'
        });
    }
};

/**
 * Add comment to ticket
 */
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { commentText } = req.body;
        const db = getFirestore();

        if (!commentText || commentText.trim().length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Comment text is required'
            });
        }

        const commentData = {
            userId: req.user.uid,
            userName: req.user.displayName || req.user.email,
            commentText: commentText.trim(),
            createdAt: new Date()
        };

        const commentRef = await db
            .collection('tickets')
            .doc(id)
            .collection('comments')
            .add(commentData);

        // Update ticket's updatedAt
        await db.collection('tickets').doc(id).update({
            updatedAt: new Date()
        });

        res.status(201).json({
            commentId: commentRef.id,
            ...commentData,
            createdAt: commentData.createdAt.toISOString()
        });

    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to add comment'
        });
    }
};

/**
 * Resolve ticket
 */
const resolveTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolutionText } = req.body;
        const db = getFirestore();

        if (!resolutionText) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Resolution text is required'
            });
        }

        const ticketRef = db.collection('tickets').doc(id);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Ticket not found'
            });
        }

        const ticketData = ticketDoc.data();
        const now = new Date();
        const createdAt = ticketData.createdAt.toDate();
        const resolutionTimeMinutes = Math.round((now - createdAt) / (1000 * 60));

        // Add resolution
        const resolutionData = {
            engineerId: req.user.uid,
            resolutionText,
            resolvedAt: now,
            resolutionTimeMinutes
        };

        await db
            .collection('tickets')
            .doc(id)
            .collection('resolutions')
            .add(resolutionData);

        // Update ticket status
        const slaStatus = resolutionTimeMinutes <= ticketData.sla.targetResolutionTime
            ? 'compliant'
            : 'breached';

        await ticketRef.update({
            status: 'resolved',
            closedAt: now,
            updatedAt: now,
            'sla.resolutionTime': resolutionTimeMinutes,
            'sla.slaStatus': slaStatus
        });

        res.json({
            message: 'Ticket resolved successfully',
            ticketId: id,
            resolutionTimeMinutes,
            slaStatus
        });

    } catch (error) {
        console.error('Resolve ticket error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to resolve ticket'
        });
    }
};

/**
 * Get similar tickets recommendations
 */
const getSimilarTickets = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getFirestore();

        const ticketDoc = await db.collection('tickets').doc(id).get();

        if (!ticketDoc.exists) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Ticket not found'
            });
        }

        const currentTicket = ticketDoc.data();

        // Get resolved tickets
        const resolvedSnapshot = await db
            .collection('tickets')
            .where('status', '==', 'resolved')
            .limit(50)
            .get();

        const resolvedTickets = [];
        for (const doc of resolvedSnapshot.docs) {
            const data = doc.data();

            // Get resolution
            const resSnapshot = await db
                .collection('tickets')
                .doc(doc.id)
                .collection('resolutions')
                .limit(1)
                .get();

            if (!resSnapshot.empty) {
                const resolution = resSnapshot.docs[0].data();
                resolvedTickets.push({
                    ticketId: doc.id,
                    title: data.title,
                    description: data.description,
                    resolution: resolution.resolutionText,
                    category: data.category
                });
            }
        }

        if (resolvedTickets.length === 0) {
            return res.json({ similarTickets: [], topMatch: null });
        }

        // Call NLP similarity service
        try {
            const similarityResponse = await axios.post(
                `${NLP_SERVICE_URL}/api/nlp/find-similar`,
                {
                    description: currentTicket.description,
                    resolvedTickets
                }
            );

            res.json(similarityResponse.data);
        } catch (nlpError) {
            console.error('Similarity service error:', nlpError.message);
            res.json({ similarTickets: [], topMatch: null });
        }

    } catch (error) {
        console.error('Get similar tickets error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get recommendations'
        });
    }
};

/**
 * Rate a resolved ticket
 */
const rateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, feedback } = req.body;
        const userId = req.user.uid;

        if (!score || score < 1 || score > 5) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Score must be between 1 and 5'
            });
        }

        const db = getFirestore();

        const ticketRef = db.collection('tickets').doc(id);
        const ticket = await ticketRef.get();

        if (!ticket.exists) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Ticket not found'
            });
        }

        const ticketData = ticket.data();

        // Only allow ticket creator to rate
        if (ticketData.userId !== userId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only ticket creator can rate'
            });
        }

        await ticketRef.update({
            rating: {
                score,
                feedback: feedback || '',
                ratedAt: new Date(),
                ratedBy: userId
            }
        });

        res.json({ message: 'Rating submitted successfully' });

    } catch (error) {
        console.error('Rate ticket error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to submit rating'
        });
    }
};

module.exports = {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
    addComment,
    resolveTicket,
    getSimilarTickets,
    rateTicket
};
