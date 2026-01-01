const emailService = require('../services/emailService');

// Send OTP for password reset
exports.sendPasswordResetOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const result = await emailService.sendOTPEmail(email, 'password-reset');
        res.json(result);
    } catch (error) {
        console.error('Error sending password reset OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

// Send OTP for email verification
exports.sendEmailVerificationOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const result = await emailService.sendOTPEmail(email, 'email-verification');
        res.json(result);
    } catch (error) {
        console.error('Error sending email verification OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp, purpose } = req.body;

        if (!email || !otp || !purpose) {
            return res.status(400).json({ error: 'Email, OTP, and purpose are required' });
        }

        const result = await emailService.verifyOTP(email, otp, purpose);

        if (result.valid) {
            // If this is email verification, update the user's emailVerified status
            if (purpose === 'email-verification') {
                try {
                    const { getFirestore, getAuth } = require('../config/firebase');
                    const db = getFirestore();
                    const auth = getAuth();

                    // Find user by email
                    const usersSnapshot = await db.collection('users')
                        .where('email', '==', email)
                        .get();

                    if (!usersSnapshot.empty) {
                        const userDoc = usersSnapshot.docs[0];
                        const userId = userDoc.id;

                        // Update Firestore user document
                        await db.collection('users').doc(userId).update({
                            emailVerified: true,
                            verifiedAt: new Date()
                        });

                        // ALSO update Firebase Auth user's emailVerified property
                        try {
                            if (auth && auth.updateUser) {
                                await auth.updateUser(userId, {
                                    emailVerified: true
                                });
                                console.log('✅ Firebase Auth emailVerified updated for:', userId);
                            }
                        } catch (authUpdateError) {
                            console.warn('⚠️ Failed to update Firebase Auth (might be MockDb):', authUpdateError.message);
                        }

                        console.log('✅ User email verification status updated:', email);
                    } else {
                        console.warn('⚠️ User not found for email verification update:', email);
                    }
                } catch (updateError) {
                    console.error('Error updating email verification status:', updateError);
                    // Don't fail the OTP verification if status update fails
                }
            }

            res.json({ success: true, message: result.message });
        } else {
            res.status(400).json({ success: false, error: result.message });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
};
