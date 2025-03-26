import { auth, firestore } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import forge from 'node-forge';
import * as jose from 'jose';

class INAPASService {
  constructor() {
    this.clientId = process.env.REACT_APP_INAPAS_CLIENT_ID;
    this.redirectUri = process.env.REACT_APP_INAPAS_REDIRECT_URI;
    this.tokenIssuerUrl = process.env.REACT_APP_INAPAS_TOKEN_ISSUER_URL;
    this.kid = process.env.REACT_APP_INAPAS_KID;
    this.privateKey = process.env.REACT_APP_INAPAS_PRIVATE_KEY;
  }

  // Generate random state
  generateState() {
    const hashed = forge.md.sha256.create();
    hashed.update(forge.util.bytesToHex(forge.random.getBytesSync(16)));
    return hashed.digest().toHex();
  }

  // Generate PKCE code verifier and challenge
  generatePKCE() {
    const codeVerifier = forge.util.bytesToHex(forge.random.getBytesSync(32));
    const codeChallengeHash = forge.md.sha256.create();
    codeChallengeHash.update(codeVerifier);
    const codeChallenge = forge.util.encode64(codeChallengeHash.digest().bytes())
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    return { codeVerifier, codeChallenge };
  }

  // Get authorization URL
  getAuthUrl() {
    const state = this.generateState();
    const { codeVerifier, codeChallenge } = this.generatePKCE();

    // Store state and code verifier in session storage
    sessionStorage.setItem('inapas_state', state);
    sessionStorage.setItem('inapas_code_verifier', codeVerifier);

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      scope: 'openid offline_access profile nik'
    });

    return `${process.env.REACT_APP_INAPAS_AUTH_URL}/sso/oauth2/auth?${params.toString()}`;
  }

  // Handle callback from INA PAS
  async handleCallback(code, state) {
    const storedState = sessionStorage.getItem('inapas_state');
    const codeVerifier = sessionStorage.getItem('inapas_code_verifier');

    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    // Clear stored values
    sessionStorage.removeItem('inapas_state');
    sessionStorage.removeItem('inapas_code_verifier');

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code, codeVerifier);

    // Create or update user in Firebase
    const user = await this.createOrUpdateUser(tokens);

    return user;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code, codeVerifier) {
    // Create client assertion JWT
    const now = Math.floor(Date.now() / 1000);
    const privateKey = await jose.importPKCS8(this.privateKey, 'RS256');
    
    const jwt = await new jose.SignJWT({
      iss: this.clientId,
      sub: this.clientId,
      aud: this.tokenIssuerUrl,
      exp: now + 60, // Expires in 1 minute
      iat: now,
      jti: forge.util.bytesToHex(forge.random.getBytesSync(16))
    })
    .setProtectedHeader({ alg: 'RS256', kid: this.kid })
    .sign(privateKey);

    const response = await fetch(`${process.env.REACT_APP_INAPAS_AUTH_URL}/sso/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        code_verifier: codeVerifier,
        scope: 'openid offline_access profile nik',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: jwt
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Failed to exchange code for tokens');
    }

    return response.json();
  }

  // Create or update user in Firebase
  async createOrUpdateUser(tokens) {
    // Decode ID token to get user info
    const idToken = tokens.id_token;
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    const userProfile = payload.profile;

    // Create custom token for Firebase
    const customToken = await this.createFirebaseCustomToken(userProfile);

    // Sign in with custom token
    const userCredential = await auth.signInWithCustomToken(customToken);
    const user = userCredential.user;

    // Update user profile in Firestore
    const userData = {
      email: userProfile.email,
      firstName: userProfile.name.split(' ')[0],
      lastName: userProfile.name.split(' ').slice(1).join(' '),
      nik: userProfile.nik,
      emailVerified: true,
      lastLogin: new Date(),
      userType: 'B2C_CONSUMER' // Default user type for INA PAS users
    };

    await setDoc(doc(firestore, 'users', user.uid), userData, { merge: true });

    return user;
  }

  // Create Firebase custom token
  async createFirebaseCustomToken(userProfile) {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/create-custom-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userProfile.email,
        uid: `inapas_${userProfile.nik}`,
        displayName: userProfile.name
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create custom token');
    }

    const { customToken } = await response.json();
    return customToken;
  }
}

export const inapasService = new INAPASService(); 