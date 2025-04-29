
import React, { useEffect, useState } from 'react';
import { useStompClient, MarketUpdate } from '@/hooks/useStompClient';
import { useMarketDataStore } from '@/services/marketDataService';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

interface WebSocketManagerProps {
  instrumentTokens: number[];
}

const WebSocketManager: React.FC<WebSocketManagerProps> = ({ instrumentTokens }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const updateMarketData = useMarketDataStore(state => state.updateMarketData);
  
  const handleMarketUpdate = (data: MarketUpdate) => {
    updateMarketData(data.instrument_token, data);
  };
  
  // Extract token and user ID
  const authToken = user?.token || localStorage.getItem('token');
  const userId = user?.id || '';
  
  // Only connect if we have tokens and user data
  const shouldConnect = instrumentTokens.length > 0 && 
    userId && authToken;
  
  useEffect(() => {
    if (shouldConnect && !isConnected) {
      setIsConnected(true);
      console.log(`Connecting to market data for ${instrumentTokens.length} instruments`);
    }
  }, [instrumentTokens, shouldConnect]);
  
  // Only use the hook if we should connect
  const disconnect = shouldConnect ? useStompClient({
    jwt: authToken || '',
    userId: userId || '',
    instrumentTokens,
    onMarketUpdate: handleMarketUpdate,
  }) : undefined;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (disconnect) {
        disconnect();
        setIsConnected(false);
      }
    };
  }, [disconnect]);
  
  // This is a non-visual component
  return null;
};

export default WebSocketManager;
