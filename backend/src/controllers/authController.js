const { getAuth } = require('../config/firebase');
const { getFirestore } = require('../config/firebase');

/**
 * Register a new user
 * Note: User creation is handled by Firebase Auth on the frontend
 * This creates the Firestore user profile
 */
const createUserProfile = async (req, res) => {
    try {
        const { uid, email, displayName, role } = req.body;

        if (!uid || !email || !role) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'UID, email, and role are required'
            });
        }

        // Validate role
        const validRoles = ['customer', 'engineer', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid role. Must be: customer, engineer, or admin'
            });
        }

        const db = getFirestore();

        // [DEVELOPER BYPASS LOG]
        const { isFirebaseReady } = require('../config/firebase');
        if (!isFirebaseReady) {
            console.warn('🛠️ Developer Bypass: Profile saved to In-Memory store.');
        }

        // Create user profile in Database (Firestore or MockDb)
        await db.collection('users').doc(uid).set({
            email,
            displayName: displayName || email.split('@')[0],
            role,
            createdAt: new Date()
        });

        res.status(201).json({
            message: 'User profile created successfully',
            uid,
            role
        });

    } catch (error) {
        console.error('Create user profile error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create user profile'
        });
    }
};

/**
 * Get current user profile
 */
const getCurrentUser = async (req, res) => {
    try {
        const db = getFirestore();
        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User profile not found'
            });
        }

        const userData = userDoc.data();

        res.json({
            uid: req.user.uid,
            email: userData.email,
            displayName: userData.displayName,
            role: userData.role,
            emailVerified: userData.emailVerified || false,
            createdAt: userData.createdAt?.toDate().toISOString()
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve user profile'
        });
    }
};

/**
 * Get all engineers (for assignment dropdown)
 */
const getEngineers = async (req, res) => {
    try {
        const db = getFirestore();
        const engineersSnapshot = await db
            .collection('users')
            .where('role', 'in', ['engineer', 'admin'])
            .get();

        const engineers = [];
        engineersSnapshot.forEach(doc => {
            const data = doc.data();
            engineers.push({
                uid: doc.id,
                displayName: data.displayName,
                email: data.email,
                role: data.role
            });
        });

        res.json({ engineers });

    } catch (error) {
        console.error('Get engineers error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve engineers'
        });
    }
};

module.exports = {
    createUserProfile,
    getCurrentUser,
    getEngineers
};
