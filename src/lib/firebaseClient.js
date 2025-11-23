import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// REPLACE WITH YOUR FIREBASE CLIENT CONFIG
// You can find this in Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    // Check if using placeholders
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        console.warn("Using placeholder Firebase config. Real-time disabled. Falling back to polling.");
        db = null;
    } else {
        db = getFirestore(app);
        console.log("Firebase Client Initialized");
    }
} catch (error) {
    console.warn("Firebase Client Config missing or invalid. Real-time features may not work.", error);
    db = null;
}

export { db };
