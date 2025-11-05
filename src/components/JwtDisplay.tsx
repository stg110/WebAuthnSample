import React, { useState } from 'react';
import { JwtDisplayProps } from '../types';
import { decodeJWT, copyToClipboard } from '../utils';

export const JwtDisplay: React.FC<JwtDisplayProps> = ({ jwt, onStatusChange }) => {
  const [decodedJwt, setDecodedJwt] = useState<string>('');
  const [showDecoded, setShowDecoded] = useState<boolean>(false);

  const handleCopyJwt = async () => {
    if (jwt) {
      const success = await copyToClipboard(jwt);
      onStatusChange({
        message: success ? 'JWT token copied to clipboard! ✓' : 'Failed to copy JWT token',
        type: success ? 'success' : 'error'
      });
    }
  };

  const handleDecodeJwt = () => {
    if (!jwt) {
      onStatusChange({
        message: 'No JWT token to decode',
        type: 'error'
      });
      return;
    }

    try {
      const decoded = decodeJWT(jwt);
      setDecodedJwt(JSON.stringify(decoded, null, 2));
      setShowDecoded(true);
      onStatusChange({
        message: 'JWT token decoded successfully! ✓',
        type: 'success'
      });
    } catch (error) {
      onStatusChange({
        message: `Failed to decode JWT: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    }
  };

  return (
    <>
      <div className="jwt-container">
        <h3>JWT Token</h3>
        <p>The JWT token will be displayed here after successful authentication:</p>
        <textarea
          className="jwt-token"
          value={jwt}
          readOnly
          placeholder="JWT token will appear here after successful authentication..."
        />
        <br />
        <div className="button-group">
          <button
            className="button secondary"
            onClick={handleCopyJwt}
            disabled={!jwt}
          >
            Copy JWT
          </button>
          <button
            className="button secondary"
            onClick={handleDecodeJwt}
            disabled={!jwt}
          >
            Decode JWT
          </button>
        </div>
      </div>

      {showDecoded && (
        <div className="jwt-container">
          <h3>Decoded JWT Content</h3>
          <textarea
            className="jwt-token"
            value={decodedJwt}
            readOnly
          />
        </div>
      )}
    </>
  );
};