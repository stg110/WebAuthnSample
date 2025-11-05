import React from 'react';
import { UserInfoProps } from '../types';
import { arrayBufferToBase64 } from '../utils';

export const UserInfo: React.FC<UserInfoProps> = ({ user, authMethod, credentialInfo }) => {
  if (!user) return null;

  // Type guard to check if it's a Microsoft user
  const isMicrosoftUser = (u: any): u is import('../types').MicrosoftUser => 
    'userPrincipalName' in u;

  return (
    <>
      <div className="user-info info-section">
        <h4>User Information</h4>
        <p><strong>Display Name:</strong> {user.displayName}</p>
        <p><strong>UPN:</strong> {isMicrosoftUser(user) ? user.userPrincipalName : user.name}</p>
        <p><strong>User ID:</strong> {isMicrosoftUser(user) ? user.id : user.id}</p>
        {authMethod && <p><strong>Authentication Method:</strong> {authMethod}</p>}
      </div>

      {isMicrosoftUser(user) && (
        <div className="microsoft-info info-section">
          <h4>Microsoft Account Information</h4>
          <p><strong>Display Name:</strong> {user.displayName}</p>
          <p><strong>Email:</strong> {user.mail || user.userPrincipalName}</p>
          <p><strong>Job Title:</strong> {user.jobTitle || 'N/A'}</p>
          <p><strong>Office Location:</strong> {user.officeLocation || 'N/A'}</p>
        </div>
      )}

      {credentialInfo && (
        <div className="credential-info info-section">
          <h4>Credential Information</h4>
          <p><strong>Credential ID:</strong> {credentialInfo.id}</p>
          <p><strong>Public Key Algorithm:</strong> ES256/RS256</p>
          {'response' in credentialInfo && 'authenticatorData' in credentialInfo.response && (
            <p><strong>Authenticator Data:</strong> {credentialInfo.response.authenticatorData.substring(0, 50)}...</p>
          )}
        </div>
      )}
    </>
  );
};