import { decodeBase64IfNeeded, ensureClientEnv, getClientEnv } from './env';

export const firebaseConfig = {
  apiKey: ensureClientEnv('REACT_APP_FIREBASE_API_KEY'),
  authDomain: ensureClientEnv('REACT_APP_FIREBASE_AUTH_DOMAIN'),
  projectId: ensureClientEnv('REACT_APP_FIREBASE_PROJECT_ID'),
  storageBucket: ensureClientEnv('REACT_APP_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: ensureClientEnv('REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
  appId: ensureClientEnv('REACT_APP_FIREBASE_APP_ID'),
  measurementId: getClientEnv('REACT_APP_FIREBASE_MEASUREMENT_ID')
};

export const appConfig = {
  backendUrl: ensureClientEnv('REACT_APP_BACKEND_URL'),
  googleMapsApiKey: getClientEnv('REACT_APP_GOOGLE_MAPS_API_KEY'),
  inapas: {
    clientId: getClientEnv('REACT_APP_INAPAS_CLIENT_ID'),
    redirectUri: getClientEnv('REACT_APP_INAPAS_REDIRECT_URI'),
    authUrl: getClientEnv('REACT_APP_INAPAS_AUTH_URL'),
    kid: getClientEnv('REACT_APP_INAPAS_KID'),
    signingPrivateKey: decodeBase64IfNeeded(getClientEnv('REACT_APP_INAPAS_SIGNING_PRIVATE_KEY')),
    encryptionPrivateKey: decodeBase64IfNeeded(getClientEnv('REACT_APP_INAPAS_ENCRYPTION_PRIVATE_KEY'))
  }
};

export const requireGoogleMapsApiKey = () => {
  if (!appConfig.googleMapsApiKey) {
    throw new Error('Google Maps API key is not configured. Set REACT_APP_GOOGLE_MAPS_API_KEY to use mapping features.');
  }
  return appConfig.googleMapsApiKey;
};

export const ensureInapasConfig = () => {
  const { inapas } = appConfig;
  const requiredFields = [
    'clientId',
    'authUrl',
    'kid',
    'signingPrivateKey',
    'encryptionPrivateKey'
  ];

  const missing = requiredFields.filter((field) => !inapas[field]);
  if (missing.length > 0) {
    throw new Error(`INAPAS configuration incomplete. Missing: ${missing.join(', ')}`);
  }

  return inapas;
};
