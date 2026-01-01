const nodemailer = require('nodemailer');
const crypto = require('crypto');
const firebaseConfig = require('../config/firebase');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        // In-memory OTP storage for fallback
        this.otpStore = new Map();
    }

    generateOTP() {
        return crypto.randomInt(100000, 999999).toString();
    }

    async storeOTP(email, otp, purpose) {
        const otpData = {
            email,
            otp,
            purpose,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
            verified: false
        };

        console.log('\n📧 STORING OTP');
        console.log('  - Email:', email);
        console.log('  - OTP:', otp);
        console.log('  - Purpose:', purpose);
        console.log('  - Expires at:', otpData.expiresAt);

        // 1. Try Firebase if available
        const db = firebaseConfig.getFirestore();
        if (db) {
            try {
                await db.collection('otps').add(otpData);
                console.log('  ✅ OTP stored in MockDb/Firestore');
                return otp;
            } catch (error) {
                console.warn('⚠️ Firestore OTP storage failed, falling back to memory:', error.message);
            }
        }

        // 2. Fallback to In-Memory storage
        const key = `${email}_${purpose}`;
        this.otpStore.set(key, otpData);
        console.log(`  ✅ OTP stored in memory with key: "${key}"`);
        return otp;
    }

    async verifyOTP(email, otp, purpose) {
        console.log('\n🔐 OTP VERIFICATION ATTEMPT');
        console.log('  - Email:', email);
        console.log('  - OTP:', otp);
        console.log('  - Purpose:', purpose);

        // 1. Try Firebase if available
        const db = firebaseConfig.getFirestore();
        if (db) {
            try {
                console.log('  - Attempting MockDb/Firestore verification...');
                const snapshot = await db.collection('otps')
                    .where('email', '==', email)
                    .where('otp', '==', otp)
                    .where('purpose', '==', purpose)
                    .where('verified', '==', false)
                    .get();

                console.log(`  - MockDb query returned ${snapshot.size} document(s)`);

                if (!snapshot.empty) {
                    const otpDoc = snapshot.docs[0];
                    const otpData = otpDoc.data();
                    console.log('  - Found OTP document:', {
                        email: otpData.email,
                        otp: otpData.otp,
                        purpose: otpData.purpose,
                        verified: otpData.verified,
                        expiresAt: otpData.expiresAt
                    });

                    const expiryDate = otpData.expiresAt.toDate ? otpData.expiresAt.toDate() : otpData.expiresAt;
                    const now = new Date();
                    console.log('  - Current time:', now);
                    console.log('  - Expiry time:', expiryDate);
                    console.log('  - Is expired?:', now > expiryDate);

                    if (now <= expiryDate) {
                        // Update the OTP document - use doc().update() for both MockDb and Firestore
                        try {
                            await db.collection('otps').doc(otpDoc.id).update({ verified: true });
                            console.log('✅ OTP VERIFIED SUCCESSFULLY (MockDb)');
                        } catch (updateError) {
                            console.warn('⚠️ Failed to mark OTP as verified, but continuing:', updateError.message);
                        }
                        return { valid: true, message: 'OTP verified successfully' };
                    } else {
                        console.log('❌ OTP EXPIRED');
                        return { valid: false, message: 'OTP has expired' };
                    }
                } else {
                    console.log('  - No matching OTP found in MockDb, trying in-memory fallback...');
                }
            } catch (error) {
                console.warn('⚠️ Firestore OTP verification failed, falling back to memory:', error.message);
            }
        }

        // 2. Fallback to In-Memory verification
        console.log('  - Checking in-memory OTP store...');
        const key = `${email}_${purpose}`;
        const stored = this.otpStore.get(key);

        console.log(`  - In-memory key: "${key}"`);
        console.log('  - Stored OTP data:', stored || 'NOT FOUND');

        if (!stored) {
            console.log('❌ OTP NOT FOUND in memory');
            return { valid: false, message: 'Invalid or expired OTP' };
        }

        console.log('  - Stored OTP:', stored.otp);
        console.log('  - Provided OTP:', otp);
        console.log('  - Match?:', stored.otp === otp);

        if (stored.otp !== otp) {
            console.log('❌ OTP MISMATCH');
            return { valid: false, message: 'Invalid OTP' };
        }
        if (stored.verified) {
            console.log('❌ OTP ALREADY USED');
            return { valid: false, message: 'OTP already used' };
        }

        const now = new Date();
        console.log('  - Current time:', now);
        console.log('  - Expiry time:', stored.expiresAt);
        console.log('  - Is expired?:', now > stored.expiresAt);

        if (now > stored.expiresAt) {
            console.log('❌ OTP EXPIRED');
            return { valid: false, message: 'OTP has expired' };
        }

        stored.verified = true;
        this.otpStore.set(key, stored);
        console.log('✅ OTP VERIFIED SUCCESSFULLY (in-memory)');
        return { valid: true, message: 'OTP verified successfully' };
    }

    async sendOTPEmail(email, purpose = 'password-reset') {
        const otp = this.generateOTP();
        await this.storeOTP(email, otp, purpose);

        const emailSubject = purpose === 'password-reset'
            ? 'Reset Your Password - Aidora'
            : 'Verify Your Email - Aidora';

        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">Aidora</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">Intelligent Support at the Right Time</p>
                </div>
                <div style="padding: 40px 30px; background: white;">
                    <h2 style="color: #111827; margin-top: 0; font-size: 20px; text-align: center;">Verification Code</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 24px; text-align: center;">
                        Hello, <br>
                        Use the code below to complete your <strong>${purpose === 'password-reset' ? 'password reset' : 'email verification'}</strong>.
                    </p>
                    <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
                        <span style="font-size: 36px; font-weight: 800; color: #4f46e5; letter-spacing: 10px; font-family: 'Courier New', monospace;">${otp}</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 13px; text-align: center; line-height: 20px;">
                        This code is valid for <strong>10 minutes</strong>.<br>
                        For your security, never share this code with anyone.
                    </p>
                </div>
                <div style="background: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #64748b; margin: 0; font-size: 12px;">
                        Support, reimagined — by Keeistu M S
                    </p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: `"Aidora Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: emailSubject,
            html: emailBody
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'OTP sent successfully' };
        } catch (error) {
            console.error('Nodemailer Error:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}

module.exports = new EmailService();
