
import { useState, useEffect } from 'react';
import { useWebSocket } from '@/providers/WebSocketProvider';

export interface MarketData {
  instrumentToken: number;
  tradingSymbol?: string;
  lastPrice?: number;
  change?: number;
  changePercent?: number;
  highPrice?: number;
  lowPrice?: number;
  volume?: number;
  openPrice?: number;
  closePrice?: number;
  bidPrice?: number;
  askPrice?: number;
  lastUpdated?: string;
}

export function useMarketData(instrumentToken: number): {
  data: MarketData | null;
  isSubscribed: boolean;
  error: Error | null;
} {
  const { subscribe, unsubscribe, marketData } = useWebSocket();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to market data for this instrument token
    try {
      const success = subscribe(instrumentToken);
      setIsSubscribed(success);
      
      if (!success) {
        setError(new Error('Failed to subscribe to market data'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error subscribing to market data'));
    }

    // Cleanup: unsubscribe when the component unmounts
    return () => {
      unsubscribe(instrumentToken);
    };
  }, [instrumentToken, subscribe, unsubscribe]);

  // Extract this instrument's data from the global market data state
  const instrumentData = marketData[instrumentToken] || null;

  return {
    data: instrumentData,
    isSubscribed,
    error
  };
}
