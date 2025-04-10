import { auth, firestore } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import forge from 'node-forge';
import * as jose from 'jose';
import crypto from 'crypto';

class INAPASService {
  constructor() {
    this.clientId = process.env.REACT_APP_INAPAS_CLIENT_ID;
    // Dynamically set the redirect URI based on environment
    const isProduction = window.location.hostname === 'admin.inatrading.co.id';
    this.redirectUri = isProduction 
      ? 'https://admin.inatrading.co.id/inapas/callback'
      : process.env.REACT_APP_INAPAS_REDIRECT_URI || 'http://localhost:3000/inapas/callback';
    this.tokenIssuerUrl = `${process.env.REACT_APP_INAPAS_AUTH_URL}/sso/oauth2/token`;
    this.authUrl = `${process.env.REACT_APP_INAPAS_AUTH_URL}/sso/oauth2/auth`;
    this.kid = process.env.REACT_APP_INAPAS_KID;
    this.signingPrivateKey = process.env.REACT_APP_INAPAS_SIGNING_PRIVATE_KEY;
    this.encryptionPrivateKey = process.env.REACT_APP_INAPAS_ENCRYPTION_PRIVATE_KEY;
  }

  // Generate random state using secure random
  generateState() {
    const buffer = forge.random.getBytesSync(16);
    const hashed = forge.md.sha256.create();
    hashed.update(forge.util.bytesToHex(buffer));
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
      scope: 'openid offline act:identify nik name dob email phone inapas_id'
    });

    return `${this.authUrl}?${params.toString()}`;
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

    // Decrypt ID token to get user info
    const userInfo = await this.decryptIdToken(tokens.id_token);

    // Create or update user in Firebase
    const user = await this.createOrUpdateUser(tokens, userInfo);

    return user;
  }

  // Create client assertion JWT
  async createClientAssertionJWT() {
    const now = Math.floor(Date.now() / 1000);
    const jti = crypto.randomUUID();

    try {
      const privateKey = await jose.importPKCS8(this.signingPrivateKey, 'ES512');
      
      const jwt = await new jose.SignJWT({
        iss: this.clientId,
        sub: this.clientId,
        aud: this.tokenIssuerUrl,
        exp: now + 60, // Expires in 1 minute
        iat: now,
        jti: jti
      })
      .setProtectedHeader({ alg: 'ES512', kid: this.kid })
      .sign(privateKey);

      return jwt;
    } catch (error) {
      console.error('Error creating client assertion JWT:', error);
      throw error;
    }
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code, codeVerifier) {
    try {
      const clientAssertion = await this.createClientAssertionJWT();

      const response = await fetch(this.tokenIssuerUrl, {
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
          scope: 'openid offline act:identify nik name dob email phone inapas_id',
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: clientAssertion
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Failed to exchange code for tokens');
      }

      return response.json();
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  // Decrypt the ID token's encrypted data
  async decryptIdToken(idToken) {
    try {
      // Decode the JWT without verification to get the encrypted data
      const decodedToken = jose.decodeJwt(idToken);
      const encryptedData = decodedToken.encrypted_data;

      if (!encryptedData) {
        throw new Error('No encrypted data found in ID token');
      }

      // Import the private key for decryption
      const privateKey = await jose.importPKCS8(this.encryptionPrivateKey, 'ECDH-ES+A256KW');
      
      // Decrypt the encrypted data
      const { plaintext } = await jose.compactDecrypt(encryptedData, privateKey);
      
      // Convert the plaintext to a string and parse as JSON
      const userInfo = JSON.parse(new TextDecoder().decode(plaintext));
      
      return userInfo;
    } catch (error) {
      console.error('Error decrypting ID token:', error);
      throw error;
    }
  }

  // Create or update user in Firebase
  async createOrUpdateUser(tokens, userInfo) {
    try {
      // Extract user data from the decrypted token
      const userData = {
        email: userInfo.email,
        name: userInfo.name,
        nik: userInfo.nik,
        phone: userInfo.phone,
        dob: userInfo.dob,
        inapas_id: userInfo.inapas_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        id_token: tokens.id_token,
        token_expires: Date.now() + (tokens.expires_in * 1000)
      };

      // Create custom token for Firebase
      const customToken = await this.createFirebaseCustomToken(userData);

      // Sign in with custom token
      const userCredential = await auth.signInWithCustomToken(customToken);
      const user = userCredential.user;

      // Update user profile in Firestore
      const firestoreUserData = {
        email: userData.email,
        firstName: userData.name.split(' ')[0],
        lastName: userData.name.split(' ').slice(1).join(' '),
        nik: userData.nik,
        phone: userData.phone,
        dob: userData.dob,
        inapas_id: userData.inapas_id,
        emailVerified: true,
        lastLogin: new Date(),
        userType: 'B2C_CONSUMER', // Default user type for INA PAS users
        inapas_tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(userData.token_expires)
        }
      };

      await setDoc(doc(firestore, 'users', user.uid), firestoreUserData, { merge: true });

      return user;
    } catch (error) {
      console.error('Error creating or updating user:', error);
      throw error;
    }
  }

  // Create Firebase custom token
  async createFirebaseCustomToken(userProfile) {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/create-custom-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userProfile.email,
          uid: `inapas_${userProfile.inapas_id || userProfile.nik}`,
          displayName: userProfile.name
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create custom token');
      }

      const { customToken } = await response.json();
      return customToken;
    } catch (error) {
      console.error('Error creating custom token:', error);
      throw error;
    }
  }

  // Refresh token when it expires
  async refreshToken(refreshToken) {
    try {
      const clientAssertion = await this.createClientAssertionJWT();

      const response = await fetch(this.tokenIssuerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          refresh_token: refreshToken,
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: clientAssertion
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Failed to refresh token');
      }

      return response.json();
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  // Check if token is valid, refresh if needed
  async getValidAccessToken(userId) {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const inapasTokens = userData.inapas_tokens;
      
      if (!inapasTokens) {
        throw new Error('No INApas tokens found for user');
      }

      // Check if token is expired or about to expire (within 5 minutes)
      const tokenExpiresAt = inapasTokens.expires_at.toDate().getTime();
      const isExpiringSoon = tokenExpiresAt - Date.now() < 5 * 60 * 1000;

      if (isExpiringSoon) {
        // Refresh the token
        const newTokens = await this.refreshToken(inapasTokens.refresh_token);
        
        // Update the tokens in Firestore
        await setDoc(doc(firestore, 'users', userId), {
          inapas_tokens: {
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token,
            expires_at: new Date(Date.now() + (newTokens.expires_in * 1000))
          }
        }, { merge: true });

        return newTokens.access_token;
      }
      
      return inapasTokens.access_token;
    } catch (error) {
      console.error('Error getting valid access token:', error);
      throw error;
    }
  }
}

export const inapasService = new INAPASService(); 