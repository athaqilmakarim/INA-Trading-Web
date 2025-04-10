# INApas SSO Integration Guide

This document provides an overview of the INApas Single Sign-On (SSO) integration in the INA Trading Web application.

## Overview

The INApas SSO integration uses OpenID Connect (OIDC) 1.0 and OAuth 2.0 standards to allow users to authenticate using their INApas accounts. The implementation follows the Authorization Code Flow with PKCE for enhanced security.

## Security Features

- **Authorization Code Flow (ACF)**: A secure authentication method that requires code exchange to get an ID token.
- **Proof Key for Code Exchange (PKCE)**: Prevents authorization code interception attacks.
- **JSON Web Token (JWT) Assertions**: Used for client authentication with Elliptic Curves P-512 (ES512).
- **JSON Web Encryption (JWE)**: Used to encrypt the ID token using Elliptic Curves P-512 (ECDH-ES+A256KW).

## Authentication Flow

1. User clicks "Sign in with INA PAS" on the login page.
2. The application redirects to the INApas SSO engine (`/sso/oauth2/auth`).
3. User authenticates with INApas.
4. INApas shows a consent page for approval.
5. After consent, INApas redirects to our callback URL.
6. Our application exchanges the authorization code for tokens (`/sso/oauth2/token`).
7. User is authenticated and redirected to the home page.

## Implementation Details

### Prerequisites

1. Client registration with INApas (client_id, entity name, etc.)
2. Generated key pairs for signing and encryption
3. Configured callback URL in your INApas account

### Key Components

1. **INAPASService.js**: Core service that handles the SSO flow.
2. **Login.js**: Contains the "Sign in with INA PAS" button.
3. **INAPASCallback.js**: Handles the callback after user authentication.

### Environment Variables

The following environment variables are required for the INApas SSO integration:

```
REACT_APP_INAPAS_AUTH_URL=https://dev-inapass-api.govtechindonesia.id
REACT_APP_INAPAS_CLIENT_ID=your-inapas-client-id
REACT_APP_INAPAS_REDIRECT_URI=http://localhost:3000/inapas/callback
REACT_APP_INAPAS_KID=your-kid-value-from-jwks
REACT_APP_INAPAS_SIGNING_PRIVATE_KEY=your-signing-private-key
REACT_APP_INAPAS_ENCRYPTION_PRIVATE_KEY=your-encryption-private-key
```

## Security Best Practices

1. **Private Keys**: In production, these should be securely stored and not exposed in client-side code.
2. **Token Validation**: Always validate tokens before accepting them.
3. **HTTPS**: Always use HTTPS for all requests involving tokens.
4. **Token Refresh**: Implement token refresh strategy for long-lived sessions.

## Troubleshooting

Common issues and their solutions:

1. **Invalid client_id**: Ensure the client_id is correctly registered with INApas.
2. **Invalid redirect URI**: The redirect URI must exactly match what's registered with INApas.
3. **JWT signing errors**: Verify that the private key and kid values are correct.
4. **Decryption errors**: Ensure the encryption private key matches the public key registered with INApas.

## Additional Resources

- [INApas SSO Documentation](https://dev-inapass-api.govtechindonesia.id/docs)
- [OpenID Connect Documentation](https://openid.net/developers/specs/)
- [OAuth 2.0 Documentation](https://oauth.net/2/)
- [GitHub - inadigital-inapas/kuncy](https://github.com/inadigital-inapas/kuncy) - Key pair generator for INApas SSO integration

### Callback URL Configuration

The application automatically sets the appropriate callback URL based on the environment:

- **Development**: Uses the value from `REACT_APP_INAPAS_REDIRECT_URI` or defaults to `http://localhost:3000/inapas/callback`
- **Production**: Automatically uses `https://admin.inatrading.co.id/inapas/callback` when the application is running on the admin.inatrading.co.id domain

Important: Make sure to register both callback URLs with INApas:
1. `http://localhost:3000/inapas/callback` for development
2. `https://admin.inatrading.co.id/inapas/callback` for production 