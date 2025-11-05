import React, { useState, useEffect } from 'react';
import { ConfigSection } from './components/ConfigSection';
import { StatusDisplay } from './components/StatusDisplay';
import { AuthSection } from './components/AuthSection';
import { UserInfo } from './components/UserInfo';
import { JwtDisplay } from './components/JwtDisplay';
import { AppConfig, StatusMessage, User, MicrosoftUser } from './types';
import { microsoftAuthService } from './utils/microsoft-auth';
import './styles.css';

const defaultConfig: AppConfig = {
  rpId: 'localhost',
  officeHrdUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  clientId: '248d6bfd-1218-4f1b-9c97-da2cab62b0f2',
  scopes: 'openid profile User.Read'
};

export const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [user, setUser] = useState<User | MicrosoftUser | null>(null);
  const [jwt, setJwt] = useState<string>('');
  const [authMethod, setAuthMethod] = useState<string>('');

  // Check for OAuth callback on component mount
  useEffect(() => {
    const checkOAuthCallback = async () => {
      try {
        const microsoftUser = await microsoftAuthService.handleRedirectCallback();
        if (microsoftUser) {
          setUser(microsoftUser);
          setAuthMethod('Microsoft Entra ID / MSA');
          setStatus({
            message: 'Microsoft authentication successful via redirect! ✓',
            type: 'success'
          });
          
          // Generate JWT for the Microsoft user
          const { generateMockJWT } = await import('./utils');
          const jwtToken = generateMockJWT(microsoftUser, 'microsoft-auth', { accessToken: 'mock_redirect_token' });
          setJwt(jwtToken);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus({
          message: `OAuth callback error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error'
        });
      }
    };

    checkOAuthCallback();
  }, []);

  const handleStatusChange = (newStatus: StatusMessage) => {
    setStatus(newStatus);
    // Auto-hide status after 5 seconds for non-error messages
    if (newStatus.type !== 'error') {
      setTimeout(() => setStatus(null), 5000);
    }
  };

  const handleUserUpdate = (newUser: User | MicrosoftUser | null) => {
    setUser(newUser);
    
    // Set auth method based on user type
    if (newUser) {
      if ('userPrincipalName' in newUser) {
        setAuthMethod('Microsoft Entra ID / MSA');
      } else {
        setAuthMethod('WebAuthn Passkey');
      }
    } else {
      setAuthMethod('');
    }
  };

  const handleJwtGenerated = (newJwt: string) => {
    setJwt(newJwt);
  };

  return (
    <div className="container">
      <h1>WebAuthn Authentication Sample</h1>
      
      <ConfigSection 
        config={config} 
        onConfigChange={setConfig} 
      />

      <StatusDisplay status={status} />

      <AuthSection
        onStatusChange={handleStatusChange}
        onUserUpdate={handleUserUpdate}
        onJwtGenerated={handleJwtGenerated}
        config={config}
      />

      <UserInfo
        user={user}
        authMethod={authMethod}
      />

      <JwtDisplay
        jwt={jwt}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};