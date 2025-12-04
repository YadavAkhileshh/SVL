import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDemoKey-ReplaceWithYourActualKey",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "svl-learner.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "svl-learner",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "svl-learner.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
