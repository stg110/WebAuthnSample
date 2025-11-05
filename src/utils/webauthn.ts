import { 
  WebAuthnCredential, 
  WebAuthnAssertion, 
  User, 
  AppConfig 
} from '../types';
import { generateRandomBytes, arrayBufferToBase64, base64ToArrayBuffer } from '../utils';

export class WebAuthnService {
  private registeredCredentials: WebAuthnCredential[] = [];

  checkSupport(): boolean {
    return !!(window.PublicKeyCredential);
  }

  async registerCredential(user: User, config: AppConfig): Promise<WebAuthnCredential> {
    if (!this.checkSupport()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    const challengeBuffer = new ArrayBuffer(32);
    const challengeArray = new Uint8Array(challengeBuffer);
    crypto.getRandomValues(challengeArray);
    
    const userIdBytes = new TextEncoder().encode(user.id);

    const createCredentialOptions: CredentialCreationOptions = {
      publicKey: {
        rp: {
          name: "WebAuthn Sample App",
          id: config.rpId
        },
        user: {
          id: userIdBytes,
          name: user.name,
          displayName: user.displayName
        },
        challenge: challengeBuffer,
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "preferred",
          requireResidentKey: false
        },
        timeout: 60000,
        attestation: "direct"
      }
    };

    const credential = await navigator.credentials.create(createCredentialOptions) as PublicKeyCredential;

    if (!credential || !credential.response) {
      throw new Error('Failed to create credential');
    }

    const response = credential.response as AuthenticatorAttestationResponse;
    const credentialInfo: WebAuthnCredential = {
      id: credential.id,
      rawId: arrayBufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
        attestationObject: arrayBufferToBase64(response.attestationObject)
      }
    };

    this.registeredCredentials.push(credentialInfo);
    return credentialInfo;
  }

  async authenticateWithPasskey(config: AppConfig): Promise<WebAuthnAssertion> {
    if (!this.checkSupport()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    const challengeBuffer = new ArrayBuffer(32);
    const challengeArray = new Uint8Array(challengeBuffer);
    crypto.getRandomValues(challengeArray);

    const getCredentialOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: challengeBuffer,
        timeout: 60000,
        rpId: config.rpId,
        // Don't specify allowCredentials to show all available credentials
        userVerification: "preferred"
      }
    };

    const assertion = await navigator.credentials.get(getCredentialOptions) as PublicKeyCredential;

    if (!assertion || !assertion.response) {
      throw new Error('Authentication failed');
    }

    const response = assertion.response as AuthenticatorAssertionResponse;
    const authInfo: WebAuthnAssertion = {
      id: assertion.id,
      rawId: arrayBufferToBase64(assertion.rawId),
      type: assertion.type,
      response: {
        clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
        authenticatorData: arrayBufferToBase64(response.authenticatorData),
        signature: arrayBufferToBase64(response.signature),
        userHandle: response.userHandle ? arrayBufferToBase64(response.userHandle) : undefined
      }
    };

    return authInfo;
  }

  async authenticateWithSpecificCredentials(config: AppConfig, allowedCredentials: WebAuthnCredential[]): Promise<WebAuthnAssertion> {
    if (!this.checkSupport()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    const challengeBuffer = new ArrayBuffer(32);
    const challengeArray = new Uint8Array(challengeBuffer);
    crypto.getRandomValues(challengeArray);

    const getCredentialOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: challengeBuffer,
        timeout: 60000,
        rpId: config.rpId,
        allowCredentials: allowedCredentials.map(cred => ({
          type: "public-key" as const,
          id: base64ToArrayBuffer(cred.rawId)
        })),
        userVerification: "preferred"
      }
    };

    const assertion = await navigator.credentials.get(getCredentialOptions) as PublicKeyCredential;

    if (!assertion || !assertion.response) {
      throw new Error('Authentication failed');
    }

    const response = assertion.response as AuthenticatorAssertionResponse;
    const authInfo: WebAuthnAssertion = {
      id: assertion.id,
      rawId: arrayBufferToBase64(assertion.rawId),
      type: assertion.type,
      response: {
        clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
        authenticatorData: arrayBufferToBase64(response.authenticatorData),
        signature: arrayBufferToBase64(response.signature),
        userHandle: response.userHandle ? arrayBufferToBase64(response.userHandle) : undefined
      }
    };

    return authInfo;
  }

  getRegisteredCredentials(): WebAuthnCredential[] {
    return [...this.registeredCredentials];
  }
}

export const webAuthnService = new WebAuthnService();