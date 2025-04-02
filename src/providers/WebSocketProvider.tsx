
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import websocketService from '@/services/websocketService';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

interface WebSocketContextValue {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  subscribe: (instrumentToken: number) => boolean;
  unsubscribe: (instrumentToken: number) => boolean;
  subscribeToMarketData: (callback: (data: any) => void) => () => void;
  marketData: Record<number, any>;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [marketData, setMarketData] = useState<Record<number, any>>({});
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Connect to WebSocket when authenticated
      websocketService.connect();

      // Subscribe to connection status updates
      const unsubscribe = websocketService.subscribeToConnectionStatus((status) => {
        setIsConnected(status.status === 'connected');
        
        if (status.status === 'error') {
          toast.error('Error connecting to market data stream');
        }
      });

      // Subscribe to market data updates
      const unsubscribeMarketData = websocketService.subscribeToMarketData((data) => {
        if (data && data.instrumentToken) {
          setMarketData(prev => ({
            ...prev,
            [data.instrumentToken]: data
          }));
        }
      });

      // Clean up on unmount
      return () => {
        unsubscribe();
        unsubscribeMarketData();
        websocketService.disconnect();
      };
    }
  }, [isAuthenticated]);

  const value = useMemo(() => ({
    isConnected,
    connect: () => websocketService.connect(),
    disconnect: () => websocketService.disconnect(),
    subscribe: (instrumentToken: number) => websocketService.subscribe(instrumentToken),
    unsubscribe: (instrumentToken: number) => websocketService.unsubscribe(instrumentToken),
    subscribeToMarketData: (callback: (data: any) => void) => websocketService.subscribeToMarketData(callback),
    marketData
  }), [isConnected, marketData]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
