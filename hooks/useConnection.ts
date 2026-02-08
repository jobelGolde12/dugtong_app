import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export interface ConnectionState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

export const useConnection = () => {
  const [state, setState] = useState<ConnectionState>({
    isConnected: true,
    isInternetReachable: null,
    type: 'unknown',
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState) => {
      setState({
        isConnected: netState.isConnected ?? false,
        isInternetReachable: netState.isInternetReachable,
        type: netState.type,
      });
    });

    return () => unsubscribe();
  }, []);

  return state;
};
