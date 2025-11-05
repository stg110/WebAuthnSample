// WebAuthn Types
export interface WebAuthnCredential {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
}

export interface WebAuthnAssertion {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
}

// User Types
export interface User {
  id: string;
  name: string;
  displayName: string;
}

export interface MicrosoftUser {
  id: string;
  displayName: string;
  userPrincipalName: string;
  mail?: string;
  jobTitle?: string;
  officeLocation?: string;
}

// Configuration Types
export interface AppConfig {
  rpId: string;
  officeHrdUrl: string;
  clientId: string;
  scopes: string;
}

// JWT Types
export interface JwtHeader {
  alg: string;
  typ: string;
  kid: string;
}

export interface JwtPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  nbf: number;
  upn?: string;
  name?: string;
  auth_method: string;
  auth_type: string;
  tid?: string;
  ver?: string;
  credentialId?: string;
  authenticatorData?: string;
  amr?: string[];
  idp?: string;
  at_hash?: string;
}

// Status Types
export type StatusType = 'info' | 'success' | 'error';

export interface StatusMessage {
  message: string;
  type: StatusType;
}

// Auth Types
export type AuthMethod = 'webauthn-passkey' | 'microsoft-auth' | 'registration';

// MSAL Types (extend the existing MSAL types)
declare global {
  interface Window {
    msal?: {
      PublicClientApplication: any;
    };
  }
}

// Component Props Types
export interface AuthSectionProps {
  onStatusChange: (status: StatusMessage) => void;
  onUserUpdate: (user: User | MicrosoftUser | null) => void;
  onJwtGenerated: (jwt: string) => void;
  config: AppConfig;
}

export interface ConfigSectionProps {
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
}

export interface UserInfoProps {
  user: User | MicrosoftUser | null;
  authMethod?: string;
  credentialInfo?: WebAuthnCredential | WebAuthnAssertion;
}

export interface JwtDisplayProps {
  jwt: string;
  onStatusChange: (status: StatusMessage) => void;
}