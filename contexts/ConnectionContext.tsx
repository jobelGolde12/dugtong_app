import React, { createContext, ReactNode, useContext, useEffect, useRef } from 'react';
import { useConnection } from '../hooks/useConnection';
import { setOnlineStatus, syncOfflineQueue } from '../src/lib/turso-offline';

interface ConnectionContextValue {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

const ConnectionContext = createContext<ConnectionContextValue | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const connection = useConnection();
  const wasOffline = useRef(false);

  useEffect(() => {
    try {
      setOnlineStatus(connection.isConnected);

      if (!connection.isConnected) {
        wasOffline.current = true;
      } else if (wasOffline.current) {
        syncOfflineQueue().catch(error => {
          console.warn('Failed to sync offline queue:', error);
        });
        wasOffline.current = false;
      }
    } catch (error) {
      console.error('Error in connection context:', error);
    }
  }, [connection.isConnected]);

  return (
    <ConnectionContext.Provider value={connection}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnectionContext = (): ConnectionContextValue => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnectionContext must be used within ConnectionProvider');
  }
  return context;
};
