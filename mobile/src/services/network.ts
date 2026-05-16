import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';

export type ConnectionStatus = 'online' | 'offline' | 'unknown';

export interface NetworkState {
  isConnected: boolean;
  connectionType: string | null;
  status: ConnectionStatus;
}

let currentState: NetworkState = {
  isConnected: true,
  connectionType: null,
  status: 'unknown',
};

const listeners: Set<(state: NetworkState) => void> = new Set();

function notifyListeners() {
  for (const listener of listeners) {
    listener(currentState);
  }
}

NetInfo.addEventListener((state: NetInfoState) => {
  const isConnected = state.isConnected ?? true;
  currentState = {
    isConnected,
    connectionType: state.type,
    status: isConnected ? 'online' : 'offline',
  };
  notifyListeners();
});

export function getNetworkState(): NetworkState {
  return currentState;
}

export function isOnline(): boolean {
  return currentState.isConnected;
}

export function subscribeToNetwork(callback: (state: NetworkState) => void): () => void {
  listeners.add(callback);
  callback(currentState);
  return () => {
    listeners.delete(callback);
  };
}

export async function checkNetwork(): Promise<NetworkState> {
  const state = await NetInfo.fetch();
  const isConnected = state.isConnected ?? true;
  currentState = {
    isConnected,
    connectionType: state.type,
    status: isConnected ? 'online' : 'offline',
  };
  return currentState;
}

export function useNetwork(): NetworkState {
  const [state, setState] = useState<NetworkState>(currentState);

  useEffect(() => {
    const unsubscribe = subscribeToNetwork(setState);
    return unsubscribe;
  }, []);

  return state;
}
