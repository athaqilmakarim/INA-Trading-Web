const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { logger } = require('../utils/logger');

let cachedCredentials;

const parseJson = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('Failed to parse Firebase service account JSON');
  }
};

const resolveCredentials = () => {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  const { GOOGLE_APPLICATION_CREDENTIALS_JSON, GOOGLE_APPLICATION_CREDENTIALS_BASE64, GOOGLE_APPLICATION_CREDENTIALS } =
    process.env;

  if (GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    cachedCredentials = parseJson(GOOGLE_APPLICATION_CREDENTIALS_JSON);
    return cachedCredentials;
  }

  if (GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
    const decoded = Buffer.from(GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('utf8');
    cachedCredentials = parseJson(decoded);
    return cachedCredentials;
  }

  if (GOOGLE_APPLICATION_CREDENTIALS) {
    const credentialPath = path.resolve(process.cwd(), GOOGLE_APPLICATION_CREDENTIALS);
    if (!fs.existsSync(credentialPath)) {
      throw new Error(`Firebase credential file not found at ${credentialPath}`);
    }

    const fileContents = fs.readFileSync(credentialPath, 'utf8');
    cachedCredentials = parseJson(fileContents);
    return cachedCredentials;
  }

  throw new Error(
    'Firebase Admin credentials missing. Provide GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_APPLICATION_CREDENTIALS_JSON, or GOOGLE_APPLICATION_CREDENTIALS_BASE64'
  );
};

const initializeFirebaseAdmin = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const credentials = resolveCredentials();
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  const options = {
    credential: admin.credential.cert(credentials)
  };

  if (databaseURL) {
    options.databaseURL = databaseURL;
  }

  admin.initializeApp(options);
  logger.info('Firebase Admin initialized');
  return admin.app();
};

module.exports = {
  initializeFirebaseAdmin
};
