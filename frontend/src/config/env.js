import { Buffer } from 'buffer';

const isDefined = (value) => value !== undefined && value !== null && value !== '';

export const getClientEnv = (key, defaultValue) => {
  const value = process.env[key];
  if (!isDefined(value)) {
    return defaultValue;
  }
  return value;
};

export const ensureClientEnv = (key, message) => {
  const value = getClientEnv(key);
  if (!isDefined(value)) {
    throw new Error(message || `Missing required environment variable: ${key}`);
  }
  return value;
};

export const decodeBase64IfNeeded = (value) => {
  if (!isDefined(value)) {
    return value;
  }

  const trimmed = value.trim();
  if (trimmed.startsWith('-----BEGIN ') && trimmed.includes('-----END ')) {
    return trimmed;
  }

  try {
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      return window.atob(trimmed);
    }

    if (typeof atob === 'function') {
      return atob(trimmed);
    }

    return Buffer.from(trimmed, 'base64').toString('utf-8');
  } catch (error) {
    console.warn('Failed to decode base64 environment variable; returning original value');
    return trimmed;
  }
};
