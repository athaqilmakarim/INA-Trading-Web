import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDt368IH2XlRpBPbfGMi20O-5WUzrIpTlE",
  authDomain: "ina-trading.firebaseapp.com",
  projectId: "ina-trading",
  storageBucket: "ina-trading.appspot.com",
  messagingSenderId: "673699981446",
  appId: "1:673699981446:ios:dcd23eedd5d76f807a4907"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth, Firestore, and Storage instances
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Initialize Storage with CORS configuration
const storage = getStorage(app);
storage._customUrlOrRegion = `https://${firebaseConfig.storageBucket}`;

export { storage };

console.log('Firebase initialized with project:', firebaseConfig.projectId);

export default app; 