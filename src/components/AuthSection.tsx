import React, { useState } from 'react';
import { AuthSectionProps, User, MicrosoftUser, WebAuthnCredential, WebAuthnAssertion } from '../types';
import { webAuthnService } from '../utils/webauthn';
import { microsoftAuthService } from '../utils/microsoft-auth';
import { checkWebAuthnSupport, createUser, generateMockJWT } from '../utils';

export const AuthSection: React.FC<AuthSectionProps> = ({ 
  onStatusChange, 
  onUserUpdate, 
  onJwtGenerated, 
  config 
}) => {
  const [currentUser, setCurrentUser] = useState<User | MicrosoftUser | null>(null);
  const [credentialInfo, setCredentialInfo] = useState<WebAuthnCredential | WebAuthnAssertion | null>(null);

  const handleStatusChange = (message: string, type: 'info' | 'success' | 'error') => {
    onStatusChange({ message, type });
  };

  const handleCheckSupport = () => {
    if (!checkWebAuthnSupport()) {
      handleStatusChange('WebAuthn is not supported in this browser', 'error');
      return;
    }
    handleStatusChange('WebAuthn is supported! ✓', 'success');
  };

  const handleSignInWithPasskey = async () => {
    if (!checkWebAuthnSupport()) return;

    try {
      handleStatusChange('Looking for available passkeys...', 'info');
      
      const assertion = await webAuthnService.authenticateWithPasskey(config);
      setCredentialInfo(assertion);
      
      // Create or use existing user
      let user = currentUser;
      if (!user || !('name' in user)) {
        const userName = prompt('Enter your name:') || 'passkey-user@example.com';
        user = createUser(userName);
        setCurrentUser(user);
        onUserUpdate(user);
      }

      handleStatusChange('Passkey authentication successful! ✓', 'success');
      
      // Generate JWT for successful authentication
      const jwt = generateMockJWT(user, 'webauthn-passkey', assertion);
      onJwtGenerated(jwt);
      
    } catch (error) {
      console.error('Passkey authentication failed:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('NotAllowedError')) {
          handleStatusChange('No passkey available or authentication cancelled. Try Microsoft Sign-In instead.', 'error');
        } else if (error.message.includes('InvalidStateError')) {
          handleStatusChange('No passkeys found for this site. Please register a new passkey or use Microsoft Sign-In.', 'error');
        } else {
          handleStatusChange(`Passkey authentication failed: ${error.message}`, 'error');
        }
        
        // Suggest Microsoft authentication as fallback
        setTimeout(() => {
          if (confirm('Would you like to sign in with Microsoft instead?')) {
            handleSignInWithMicrosoft();
          }
        }, 3000);
      }
    }
  };

  const handleRegisterCredential = async () => {
    if (!checkWebAuthnSupport()) return;

    try {
      handleStatusChange('Starting credential registration...', 'info');

      // Get user information
      let user = currentUser;
      if (!user || 'userPrincipalName' in user) {
        const upn = prompt('Enter your UPN (User Principal Name):');
        if (!upn) {
          handleStatusChange('Registration cancelled', 'error');
          return;
        }
        user = createUser(upn);
        setCurrentUser(user);
        onUserUpdate(user);
      }

      handleStatusChange('Please complete the authentication gesture...', 'info');
      const credential = await webAuthnService.registerCredential(user as User, config);
      setCredentialInfo(credential);

      handleStatusChange('Credential registered successfully! ✓', 'success');
      
      // Generate JWT for successful registration
      const jwt = generateMockJWT(user, 'registration');
      onJwtGenerated(jwt);
      
    } catch (error) {
      console.error('Registration failed:', error);
      handleStatusChange(
        `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        'error'
      );
    }
  };

  const handleSignInWithMicrosoft = async () => {
    handleStatusChange('Initializing Microsoft authentication...', 'info');

    try {
      // Try popup first, fallback to redirect
      try {
        const user = await microsoftAuthService.signInWithPopup(config);
        setCurrentUser(user);
        onUserUpdate(user);
        
        handleStatusChange('Microsoft authentication successful! ✓', 'success');
        
        // Generate JWT with Microsoft user info
        const jwt = generateMockJWT(user, 'microsoft-auth', { accessToken: 'mock_token' });
        onJwtGenerated(jwt);
        
      } catch (popupError) {
        console.error('MSAL popup failed, trying redirect:', popupError);
        handleStatusChange('Falling back to redirect authentication...', 'info');
        await microsoftAuthService.signInWithRedirect(config);
      }
      
    } catch (error) {
      console.error('Microsoft authentication failed:', error);
      handleStatusChange(
        `Microsoft authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        'error'
      );
    }
  };

  return (
    <div className="auth-section">
      <h3>WebAuthn Authentication</h3>
      <p>Choose your authentication method:</p>
      
      <div className="button-group">
        <button className="button" onClick={handleCheckSupport}>
          Check WebAuthn Support
        </button>
        <button 
          className="button" 
          onClick={handleSignInWithPasskey}
          style={{ backgroundColor: '#0078d4', fontWeight: 'bold' }}
        >
          Sign In with Passkey
        </button>
        <button className="button secondary" onClick={handleRegisterCredential}>
          Register New Passkey
        </button>
        <button 
          className="button microsoft" 
          onClick={handleSignInWithMicrosoft}
        >
          Sign In with Microsoft
        </button>
      </div>
    </div>
  );
};