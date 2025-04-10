import { jose } from 'jose';

/**
 * Parse a JWT token without verification
 * @param {string} token - The JWT token to parse
 * @returns {Object} The parsed token payload
 */
export const parseJwt = (token) => {
  try {
    return jose.decodeJwt(token);
  } catch (error) {
    console.error('Error parsing JWT', error);
    return null;
  }
};

/**
 * Check if a token is expired
 * @param {string} token - The JWT token to check
 * @param {number} graceSeconds - Grace period in seconds before actually considering expired
 * @returns {boolean} True if the token is expired
 */
export const isTokenExpired = (token, graceSeconds = 60) => {
  try {
    const decoded = parseJwt(token);
    if (!decoded) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp - graceSeconds < currentTime;
  } catch (error) {
    console.error('Error checking token expiration', error);
    return true; // If we can't check, consider it expired for safety
  }
};

/**
 * Get the remaining time before token expiration
 * @param {string} token - The JWT token to check
 * @returns {number} Seconds until expiration (negative if already expired)
 */
export const getTokenExpiryTime = (token) => {
  try {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp - currentTime;
  } catch (error) {
    console.error('Error getting token expiry time', error);
    return 0;
  }
};

/**
 * Extract scopes from token
 * @param {string} token - The JWT token to extract scopes from
 * @returns {Array<string>} Array of scope strings
 */
export const extractScopes = (token) => {
  try {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.scope) return [];
    
    return Array.isArray(decoded.scope) 
      ? decoded.scope 
      : decoded.scope.split(' ');
  } catch (error) {
    console.error('Error extracting scopes', error);
    return [];
  }
};

/**
 * Check if a token has a specific scope
 * @param {string} token - The JWT token to check
 * @param {string} scope - The scope to check for
 * @returns {boolean} True if the token has the specified scope
 */
export const hasScope = (token, scope) => {
  const scopes = extractScopes(token);
  return scopes.includes(scope);
};

/**
 * Set auth token in localStorage
 * @param {Object} tokens - The tokens object received from the INApas SSO
 */
export const setAuthTokens = (tokens) => {
  localStorage.setItem('inapas_access_token', tokens.access_token);
  localStorage.setItem('inapas_id_token', tokens.id_token);
  localStorage.setItem('inapas_refresh_token', tokens.refresh_token);
  localStorage.setItem('inapas_expires_at', Date.now() + (tokens.expires_in * 1000));
};

/**
 * Clear auth tokens from localStorage
 */
export const clearAuthTokens = () => {
  localStorage.removeItem('inapas_access_token');
  localStorage.removeItem('inapas_id_token');
  localStorage.removeItem('inapas_refresh_token');
  localStorage.removeItem('inapas_expires_at');
};

/**
 * Get auth tokens from localStorage
 * @returns {Object|null} The tokens object or null if not found
 */
export const getAuthTokens = () => {
  const accessToken = localStorage.getItem('inapas_access_token');
  const idToken = localStorage.getItem('inapas_id_token');
  const refreshToken = localStorage.getItem('inapas_refresh_token');
  const expiresAt = localStorage.getItem('inapas_expires_at');
  
  if (!accessToken || !idToken) return null;
  
  return {
    access_token: accessToken,
    id_token: idToken,
    refresh_token: refreshToken,
    expires_at: expiresAt ? parseInt(expiresAt, 10) : 0
  };
}; 