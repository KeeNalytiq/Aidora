const admin = require('firebase-admin');
const path = require('path');

let isFirebaseReady = false;

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Option 1: Using full service account JSON (Best for deployment)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        isFirebaseReady = true;
        console.log('✓ Firebase Admin SDK initialized successfully (from JSON env)');
        return;
      } catch (parseError) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', parseError.message);
      }
    }

    // Option 2: Using service account file
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const fs = require('fs');
      const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        isFirebaseReady = true;
        console.log('✓ Firebase Admin SDK initialized successfully (from file)');
        return;
      } else {
        console.warn(`⚠️ Firebase service account file not found at: ${serviceAccountPath}`);
      }
    }

    // Option 3: Using environment variables (individual fields)
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        })
      });
      isFirebaseReady = true;
      console.log('✓ Firebase Admin SDK initialized successfully (from individual env vars)');
      return;
    }

    console.warn('⚠️ Firebase credentials not found in .env. Some features like persistence may not work.');
    return;

    console.log('✓ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('✗ Firebase initialization warning:', error.message);
  }
};

// Get Firestore instance
const getFirestore = () => {
  if (!isFirebaseReady) {
    return require('./mockDb');
  }
  return admin.firestore();
};

// Get Auth instance
const getAuth = () => {
  if (!isFirebaseReady) {
    // Return a mock auth object that mimics Firebase Auth
    return {
      verifyIdToken: async (token) => {
        // [DYNAMIC MOCK IDENTITY]
        // If token is 'cust-2', we behave as Customer 2
        if (token === 'cust-2-token') {
          return {
            uid: 'cust-2',
            email: 'customer2@test.com',
            name: 'Customer Two',
            role: 'customer'
          };
        }
        if (token === 'eng-1-token') {
          return {
            uid: 'eng-1',
            email: 'engineer@aidora.com',
            name: 'Support Engineer One',
            role: 'engineer'
          };
        }
        if (token === 'admin-token') {
          return {
            uid: 'dev-user-123',
            email: 'admin@aidora.com',
            name: 'Admin Developer',
            role: 'admin'
          };
        }

        // Default Admin
        return {
          uid: 'dev-user-123',
          email: 'admin@aidora.com',
          name: 'Admin Developer',
          role: 'admin'
        };
      },
      getUser: async (uid) => {
        const users = {
          'dev-user-123': { uid: 'dev-user-123', email: 'admin@aidora.com', displayName: 'Admin Developer', role: 'admin' },
          'cust-1': { uid: 'cust-1', email: 'keeistu25@gmail.com', displayName: 'Customer One', role: 'customer' },
          'cust-2': { uid: 'cust-2', email: 'customer2@test.com', displayName: 'Customer Two', role: 'customer' },
          'eng-1': { uid: 'eng-1', email: 'engineer@aidora.com', displayName: 'Support Engineer One', role: 'engineer' }
        };
        return users[uid] || users['dev-user-123'];
      }
    };
  }
  return admin.auth();
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  isFirebaseReady,
  admin
};
