import { PublicClientApplication, Configuration, AccountInfo } from '@azure/msal-browser';
import { MicrosoftUser, AppConfig } from '../types';

export class MicrosoftAuthService {
  private msalInstance: PublicClientApplication | null = null;

  initialize(config: AppConfig): void {
    const msalConfig: Configuration = {
      auth: {
        clientId: config.clientId,
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin + window.location.pathname
      },
      cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false
      }
    };

    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  async signInWithPopup(config: AppConfig): Promise<MicrosoftUser> {
    if (!this.msalInstance) {
      this.initialize(config);
    }

    const loginRequest = {
      scopes: config.scopes.split(' '),
      prompt: 'select_account'
    };

    try {
      const loginResponse = await this.msalInstance!.loginPopup(loginRequest);
      
      if (loginResponse && loginResponse.accessToken) {
        return await this.getUserProfile(loginResponse.accessToken);
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('MSAL popup authentication failed:', error);
      throw error;
    }
  }

  async signInWithRedirect(config: AppConfig): Promise<void> {
    const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
    const state = Math.random().toString(36).substr(2, 20);
    const nonce = Math.random().toString(36).substr(2, 20);
    
    const authUrl = `${config.officeHrdUrl}?` +
      `client_id=${config.clientId}&` +
      `response_type=code&` +
      `redirect_uri=${redirectUri}&` +
      `response_mode=query&` +
      `scope=${encodeURIComponent(config.scopes)}&` +
      `state=${state}&` +
      `nonce=${nonce}&` +
      `prompt=select_account`;

    // Store state for validation when returning
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_nonce', nonce);
    
    // Redirect to Microsoft
    window.location.href = authUrl;
  }

  async handleRedirectCallback(): Promise<MicrosoftUser | null> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      throw new Error(`Microsoft authentication error: ${error} - ${errorDescription || ''}`);
    }

    if (code && state) {
      const storedState = sessionStorage.getItem('oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid OAuth state parameter');
      }

      // In a real app, you would exchange the code for tokens here
      // For this demo, we'll simulate the process
      const mockTokenResponse = await this.simulateTokenExchange(code);
      
      if (mockTokenResponse.access_token) {
        const user = await this.getUserProfile(mockTokenResponse.access_token);
        
        // Clean up URL and session
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_nonce');
        
        return user;
      }
    }

    return null;
  }

  private async getUserProfile(accessToken: string): Promise<MicrosoftUser> {
    try {
      // For demo purposes with mock tokens, return mock user data
      if (accessToken.startsWith('mock_access_token_')) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          id: 'mock-user-id-' + Math.random().toString(36).substr(2, 10),
          displayName: 'Demo User',
          userPrincipalName: 'demo.user@contoso.com',
          mail: 'demo.user@contoso.com',
          jobTitle: 'Software Developer',
          officeLocation: 'Seattle, WA'
        };
      }

      // Real Microsoft Graph API call
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Graph API error: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();
      return {
        id: userData.id,
        displayName: userData.displayName,
        userPrincipalName: userData.userPrincipalName,
        mail: userData.mail,
        jobTitle: userData.jobTitle,
        officeLocation: userData.officeLocation
      };
    } catch (error) {
      console.error('Error calling Microsoft Graph:', error);
      
      // Fallback to mock data for demo
      return {
        id: 'fallback-user-id',
        displayName: 'Demo User (Fallback)',
        userPrincipalName: 'demo.user@contoso.com',
        mail: 'demo.user@contoso.com',
        jobTitle: 'Demo User',
        officeLocation: 'Demo Location'
      };
    }
  }

  private async simulateTokenExchange(authCode: string): Promise<{ access_token: string; token_type: string; expires_in: number; scope: string }> {
    // This is a simulation - in a real app, you would:
    // 1. Send the auth code to your backend server
    // 2. Exchange it for tokens using the Microsoft token endpoint
    // 3. Return the access token to the client
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          access_token: 'mock_access_token_' + Math.random().toString(36).substr(2, 50),
          token_type: 'Bearer',
          expires_in: 3600,
          scope: 'User.Read openid profile'
        });
      }, 1000);
    });
  }
}

export const microsoftAuthService = new MicrosoftAuthService();