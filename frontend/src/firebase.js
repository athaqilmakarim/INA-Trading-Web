import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDc3ILNEatjIpfpWOrmdMcEpRnFYEZ2eHs",
  authDomain: "ina-trading.firebaseapp.com",
  projectId: "ina-trading",
  storageBucket: "ina-trading.firebasestorage.app",
  messagingSenderId: "673699981446",
  appId: "1:673699981446:web:ea500580ff674d5c7a4907",
  measurementId: "G-Y6XMZMCRMG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
export const auth = getAuth(app);

// Get Firestore instance
export const firestore = getFirestore(app);

// Get Storage instance with custom settings
const storageInstance = getStorage(app);

// Configure Storage settings based on environment
const isDevelopment = window.location.hostname === 'localhost';
const isAdmin = window.location.hostname === 'admin.inatrading.co.id';

if (isDevelopment || isAdmin) {
  storageInstance.maxOperationRetryTime = 30000; // 30 seconds
  storageInstance.maxUploadRetryTime = 30000; // 30 seconds
}

export const storage = storageInstance;
export default app; 