const admin = require('firebase-admin');

let db;
let initError;

try {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
            } catch (parseError) {
                throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: ${parseError.message}`);
            }
        } else {
            // Check if we are in a build environment or just missing keys
            if (process.env.NODE_ENV === 'production') {
                throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
            } else {
                console.warn("Missing FIREBASE_SERVICE_ACCOUNT, skipping init for local/build.");
            }
        }
    }

    // Only try to get firestore if app is initialized
    if (admin.apps.length) {
        db = admin.firestore();
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    initError = error;
}

module.exports = { admin, db, initError };
