import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithCustomToken } from 'firebase/auth';
import forge from 'node-forge';
import * as jose from 'jose';
import { auth, firestore } from '../firebase';
import { appConfig, ensureInapasConfig } from '../config/appConfig';

const INAPAS_SCOPE = 'openid offline act:identify nik name dob email phone inapas_id';

const normalizeBaseUrl = (url) => (url ? url.replace(/\/+$/, '') : '');

const decodeUserNames = (fullName = '') => {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: '', lastName: '' };
  }

  const parts = trimmed.split(/\s+/);
  const [firstName, ...rest] = parts;
  return {
    firstName,
    lastName: rest.join(' ')
  };
};

class INAPASService {
  constructor() {
    this.backendUrl = appConfig.backendUrl;
    this._config = null;
  }

  get config() {
    if (!this._config) {
      const baseConfig = ensureInapasConfig();
      const normalizedBaseAuthUrl = normalizeBaseUrl(baseConfig.authUrl);

      if (!normalizedBaseAuthUrl) {
        throw new Error('REACT_APP_INAPAS_AUTH_URL must be configured');
      }

      const redirectUri =
        baseConfig.redirectUri ||
        (typeof window !== 'undefined' ? `${window.location.origin}/inapas/callback` : '');

      if (!redirectUri) {
        throw new Error('Unable to determine INAPAS redirect URI. Set REACT_APP_INAPAS_REDIRECT_URI.');
      }

      this._config = {
        ...baseConfig,
        redirectUri,
        authorizationEndpoint: `${normalizedBaseAuthUrl}/sso/oauth2/auth`,
        tokenEndpoint: `${normalizedBaseAuthUrl}/sso/oauth2/token`
      };
    }

    return this._config;
  }

  generateState() {
    const buffer = forge.random.getBytesSync(16);
    const hashed = forge.md.sha256.create();
    hashed.update(forge.util.bytesToHex(buffer));
    return hashed.digest().toHex();
  }

  generatePKCE() {
    const codeVerifier = forge.util.bytesToHex(forge.random.getBytesSync(32));
    const codeChallengeHash = forge.md.sha256.create();
    codeChallengeHash.update(codeVerifier);
    const codeChallenge = forge.util
      .encode64(codeChallengeHash.digest().bytes())
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    return { codeVerifier, codeChallenge };
  }

  getAuthUrl() {
    const { clientId, redirectUri, authorizationEndpoint } = this.config;
    const state = this.generateState();
    const { codeVerifier, codeChallenge } = this.generatePKCE();

    sessionStorage.setItem('inapas_state', state);
    sessionStorage.setItem('inapas_code_verifier', codeVerifier);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      scope: INAPAS_SCOPE
    });

    return `${authorizationEndpoint}?${params.toString()}`;
  }

  async handleCallback(code, state) {
    const storedState = sessionStorage.getItem('inapas_state');
    const codeVerifier = sessionStorage.getItem('inapas_code_verifier');

    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    sessionStorage.removeItem('inapas_state');
    sessionStorage.removeItem('inapas_code_verifier');

    const tokens = await this.exchangeCodeForTokens(code, codeVerifier);
    const userInfo = await this.decryptIdToken(tokens.id_token);

    return this.createOrUpdateUser(tokens, userInfo);
  }

  async createClientAssertionJWT() {
    const { clientId, tokenEndpoint, kid, signingPrivateKey } = this.config;
    const now = Math.floor(Date.now() / 1000);
    const randomBytes = forge.random.getBytesSync(16);
    const jti = forge.util.bytesToHex(randomBytes);

    try {
      const privateKey = await jose.importPKCS8(signingPrivateKey, 'ES512');

      return await new jose.SignJWT({
        iss: clientId,
        sub: clientId,
        aud: tokenEndpoint,
        exp: now + 60,
        iat: now,
        jti
      })
        .setProtectedHeader({ alg: 'ES512', kid })
        .sign(privateKey);
    } catch (error) {
      console.error('Error creating client assertion JWT:', error);
      throw error;
    }
  }

  async exchangeCodeForTokens(code, codeVerifier) {
    const { tokenEndpoint, clientId } = this.config;

    try {
      const clientAssertion = await this.createClientAssertionJWT();

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri,
          client_id: clientId,
          code_verifier: codeVerifier,
          scope: INAPAS_SCOPE,
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

  async decryptIdToken(idToken) {
    const { encryptionPrivateKey } = this.config;

    try {
      const decodedToken = jose.decodeJwt(idToken);
      const encryptedData = decodedToken.encrypted_data;

      if (!encryptedData) {
        throw new Error('No encrypted data found in ID token');
      }

      const privateKey = await jose.importPKCS8(encryptionPrivateKey, 'ECDH-ES+A256KW');
      const { plaintext } = await jose.compactDecrypt(encryptedData, privateKey);

      return JSON.parse(new TextDecoder().decode(plaintext));
    } catch (error) {
      console.error('Error decrypting ID token:', error);
      throw error;
    }
  }

  async createFirebaseCustomToken(userProfile) {
    try {
      const response = await fetch(`${this.backendUrl}/api/create-custom-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

  async createOrUpdateUser(tokens, userInfo) {
    try {
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
        token_expires: Date.now() + tokens.expires_in * 1000
      };

      const customToken = await this.createFirebaseCustomToken(userData);
      const userCredential = await signInWithCustomToken(auth, customToken);
      const user = userCredential.user;

      const { firstName, lastName } = decodeUserNames(userData.name);

      const firestoreUserData = {
        email: userData.email,
        firstName,
        lastName,
        nik: userData.nik,
        phone: userData.phone,
        dob: userData.dob,
        inapas_id: userData.inapas_id,
        emailVerified: true,
        lastLogin: new Date(),
        userType: 'B2C_CONSUMER',
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

  async refreshToken(refreshToken) {
    const { tokenEndpoint, clientId } = this.config;

    try {
      const clientAssertion = await this.createClientAssertionJWT();

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: clientId,
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

  async getValidAccessToken(userId) {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const inapasTokens = userData.inapas_tokens;

      if (!inapasTokens) {
        throw new Error('No INAPAS tokens found for user');
      }

      const tokenExpiresAt = inapasTokens.expires_at.toDate().getTime();
      const isExpiringSoon = tokenExpiresAt - Date.now() < 5 * 60 * 1000;

      if (isExpiringSoon) {
        const newTokens = await this.refreshToken(inapasTokens.refresh_token);

        await setDoc(
          doc(firestore, 'users', userId),
          {
            inapas_tokens: {
              access_token: newTokens.access_token,
              refresh_token: newTokens.refresh_token,
              expires_at: new Date(Date.now() + newTokens.expires_in * 1000)
            }
          },
          { merge: true }
        );

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
