const { getAuth, isFirebaseReady } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
 */
const verifyToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // [DEVELOPER BYPASS] if no token provided in Dev Mode, default to Admin for convenience
            if (!isFirebaseReady) {
                console.warn('🛠️ No token provided. Defaulting to Admin for local testing.');
                req.user = {
                    uid: 'dev-user-123',
                    email: 'admin@aidora.com',
                    role: 'admin',
                    displayName: 'Admin Developer'
                };
                return next();
            }

            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }

        const token = authHeader.split('Bearer ')[1];

        // [DEVELOPER BYPASS] Identity Extraction
        // If Firebase is not ready, we attempt to decode the token without verification
        // This allows different logged-in users on the frontend to be seen as different users on the backend.
        if (!isFirebaseReady) {
            console.log('🛠️ Dev Mode: Extracting identity from token...');
            try {
                // Tokens are usually 'header.payload.signature'
                const payload = token.split('.')[1];
                if (payload) {
                    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
                    console.log('\n🔓 DECODED TOKEN PAYLOAD:');
                    console.log('  - user_id/sub:', decoded.user_id || decoded.sub);
                    console.log('  - email:', decoded.email);
                    console.log('  - name:', decoded.name);

                    req.user = {
                        uid: decoded.user_id || decoded.sub || 'dev-user-123',
                        email: decoded.email || 'dev@test.com',
                        role: decoded.email?.includes('engineer') ? 'engineer' :
                            decoded.email?.includes('admin') ? 'admin' : 'customer',
                        displayName: decoded.name || decoded.email?.split('@')[0] || 'Dev User'
                    };

                    console.log('✅ USER OBJECT CREATED:');
                    console.log('  - UID:', req.user.uid);
                    console.log('  - Email:', req.user.email);
                    console.log('  - Role:', req.user.role);
                    console.log('  - DisplayName:', req.user.displayName);

                    // Auto-seed this user into MockDb if they are new
                    const { getFirestore } = require('../config/firebase');
                    const db = getFirestore();
                    const userDoc = await db.collection('users').doc(req.user.uid).get();
                    if (!userDoc.exists) {
                        await db.collection('users').doc(req.user.uid).set({
                            ...req.user,
                            createdAt: new Date()
                        });
                        console.log('🆕 New user auto-seeded to DB:', req.user.uid);
                    } else {
                        // Refresh role from DB if it exists
                        const dbUser = userDoc.data();
                        req.user.role = dbUser.role || req.user.role;
                        console.log('👤 Existing user found in DB');
                        console.log('  - Role from DB:', req.user.role);
                    }

                    console.log(''); // Add blank line for readability
                    return next();
                }
            } catch (err) {
                console.warn('⚠️ Token decode failed. Using fallback identity.');
            }

            // Fallback for non-JWT tokens
            req.user = {
                uid: token === 'cust-2-token' ? 'cust-2' : 'dev-user-123',
                email: token === 'cust-2-token' ? 'customer2@test.com' : 'admin@aidora.com',
                role: token === 'cust-2-token' ? 'customer' : 'admin',
                displayName: token === 'cust-2-token' ? 'Customer Two' : 'Admin Developer'
            };
            return next();
        }

        // Verify token (Normal Production Mode)
        const decodedToken = await getAuth().verifyIdToken(token);

        // Fetch user profile to get role (real DB or MockDb)
        const { getFirestore } = require('../config/firebase');
        const db = getFirestore();

        let userRole = decodedToken.role || 'customer';
        let displayName = decodedToken.name || 'User';

        if (db && !decodedToken.role) {
            try {
                const userDoc = await db.collection('users').doc(decodedToken.uid).get();
                if (userDoc.exists) {
                    userRole = userDoc.data().role || 'customer';
                    displayName = userDoc.data().displayName || displayName;
                }
            } catch (err) {
                console.warn('Profile fetch failed, using defaults');
            }
        }

        // Attach user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: userRole,
            displayName: displayName
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token'
        });
    }
};

/**
 * Middleware to check user role
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            // [DEVELOPER BYPASS]
            if (!isFirebaseReady) {
                console.log(`🛠️ Role Check Bypass: Allowing role '${req.user.role}' to access ${allowedRoles}`);
                const seedUser = {
                    id: 'dev-user-123',
                    uid: 'dev-user-123',
                    email: 'keeistu25@gmail.com',
                    role: 'admin',
                    displayName: 'Developer (Bypass)',
                    createdAt: new Date()
                };
                // Assuming 'this.stores.users.set' and '_processData' are part of a class context
                // This code snippet seems to be misplaced from a mockDb.js context.
                // For checkRole, we should just check the req.user.role set by verifyToken bypass.
                if (allowedRoles.includes(req.user.role)) {
                    return next();
                } else {
                    return res.status(403).json({
                        error: 'Forbidden',
                        message: 'Insufficient permissions (Dev Mode)'
                    });
                }
            }

            const { getFirestore } = require('../config/firebase');
            const db = getFirestore();

            // Get user document from Firestore (only in production/ready mode)
            const userDoc = await db.collection('users').doc(req.user.uid).get();

            if (!userDoc.exists) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'User profile not found'
                });
            }

            const userData = userDoc.data();
            req.user.role = userData.role;
            req.user.displayName = userData.displayName;

            // Check if user has required role
            if (!allowedRoles.includes(userData.role)) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Insufficient permissions'
                });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to verify user role'
            });
        }
    };
};

module.exports = {
    verifyToken,
    checkRole
};
