import { JwtHeader, JwtPayload, User, MicrosoftUser, AuthMethod } from '../types';

// Utility functions for ArrayBuffer and Base64 conversions
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const generateRandomBytes = (length: number): Uint8Array => {
  const buffer = new ArrayBuffer(length);
  const array = new Uint8Array(buffer);
  crypto.getRandomValues(array);
  return array;
};

// JWT Generation
export const generateMockJWT = (
  user: User | MicrosoftUser, 
  authType: AuthMethod, 
  authInfo?: any
): string => {
  const header: JwtHeader = {
    alg: "RS256",
    typ: "JWT",
    kid: "webauthn-sample-key"
  };

  const now = Math.floor(Date.now() / 1000);
  
  // Type guards to distinguish between User and MicrosoftUser
  const isUser = (u: User | MicrosoftUser): u is User => 'name' in u;
  const isMicrosoftUser = (u: User | MicrosoftUser): u is MicrosoftUser => 'userPrincipalName' in u;
  
  const payload: JwtPayload = {
    iss: "webauthn-sample-app",
    sub: isUser(user) ? user.name : user.id,
    aud: "webauthn-client",
    exp: now + 3600, // 1 hour
    iat: now,
    nbf: now,
    upn: isUser(user) ? user.name : user.userPrincipalName,
    name: user.displayName,
    auth_method: authType,
    auth_type: authType,
    tid: "common",
    ver: "2.0"
  };

  // Add authentication-specific claims
  if (authType === 'webauthn-passkey' && authInfo) {
    payload.credentialId = authInfo.id;
    payload.authenticatorData = authInfo.response.authenticatorData?.substring(0, 50) + "...";
    payload.amr = ["fido"]; // Authentication Method Reference
  } else if (authType === 'microsoft-auth') {
    payload.amr = ["pwd", "mfa"]; // Assuming password + MFA
    payload.idp = "live.com"; // Identity Provider
    if (authInfo && authInfo.accessToken) {
      payload.at_hash = btoa(authInfo.accessToken).substring(0, 16);
    }
  }

  // Base64 encode (mock JWT - in real app, this would be properly signed)
  const encodedHeader = btoa(JSON.stringify(header))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const signature = "mock-signature-" + Math.random().toString(36).substr(2, 20);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// JWT Decoding
export const decodeJWT = (jwt: string): { header: JwtHeader; payload: JwtPayload; signature: string } => {
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const header = JSON.parse(atob(parts[0])) as JwtHeader;
  const payload = JSON.parse(atob(parts[1])) as JwtPayload;

  return {
    header,
    payload,
    signature: parts[2]
  };
};

// User creation utility
export const createUser = (upn?: string): User => {
  if (!upn) {
    upn = `demo-user-${Math.random().toString(36).substr(2, 9)}@example.com`;
  }
  
  const userId = Math.random().toString(36).substr(2, 20);
  return {
    id: userId,
    name: upn,
    displayName: upn.split('@')[0]
  };
};

// Check WebAuthn support
export const checkWebAuthnSupport = (): boolean => {
  return !!(window.PublicKeyCredential);
};

// Copy to clipboard utility
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};