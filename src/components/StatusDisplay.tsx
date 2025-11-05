import React from 'react';
import { StatusMessage } from '../types';

interface StatusDisplayProps {
  status: StatusMessage | null;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
  if (!status) return null;

  return (
    <div className={`status ${status.type}`}>
      {status.message}
    </div>
  );
};