import React from 'react';
import { ConfigSectionProps } from '../types';

export const ConfigSection: React.FC<ConfigSectionProps> = ({ config, onConfigChange }) => {
  const handleInputChange = (field: keyof typeof config, value: string) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="config-section">
      <h3>Configuration</h3>
      <label htmlFor="rpId">Relying Party ID:</label>
      <input
        type="text"
        id="rpId"
        className="config-input"
        value={config.rpId}
        onChange={(e) => handleInputChange('rpId', e.target.value)}
        placeholder="e.g., localhost or example.com"
      />
      
      <label htmlFor="officeHrdUrl">Microsoft Authentication URL:</label>
      <input
        type="url"
        id="officeHrdUrl"
        className="config-input"
        value={config.officeHrdUrl}
        onChange={(e) => handleInputChange('officeHrdUrl', e.target.value)}
        placeholder="https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
      />
      
      <label htmlFor="clientId">Azure AD Application Client ID:</label>
      <input
        type="text"
        id="clientId"
        className="config-input"
        value={config.clientId}
        onChange={(e) => handleInputChange('clientId', e.target.value)}
        placeholder="Your Azure AD Application Client ID"
      />
      
      <label htmlFor="scopes">Microsoft Graph Scopes:</label>
      <input
        type="text"
        id="scopes"
        className="config-input"
        value={config.scopes}
        onChange={(e) => handleInputChange('scopes', e.target.value)}
        placeholder="e.g., openid profile User.Read Mail.Read"
      />
    </div>
  );
};