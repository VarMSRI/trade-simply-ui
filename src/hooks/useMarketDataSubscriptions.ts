
import { useState, useEffect } from 'react';
import { Watchlist } from '@/types/watchlist';
import { useMarketDataStore } from '@/services/marketDataService';
import { useAuth } from '@/providers/AuthProvider';
import marketDataService from '@/services/marketDataService';
import { toast } from 'sonner';

export const useMarketDataSubscriptions = (watchlists: Watchlist[]) => {
  const [instrumentTokens, setInstrumentTokens] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const updateMarketData = useMarketDataStore(state => state.updateMarketData);
  const { user } = useAuth();
  
  // Extract all unique instrument tokens from watchlists
  useEffect(() => {
    if (!watchlists || watchlists.length === 0) return;
    
    const tokensSet = new Set<number>();
    
    watchlists.forEach(watchlist => {
      watchlist.items.forEach(item => {
        tokensSet.add(item.instrument_key);
      });
    });
    
    const uniqueTokens = Array.from(tokensSet);
    setInstrumentTokens(uniqueTokens);
    
    if (uniqueTokens.length > 0) {
      // Load initial market data
      loadInitialMarketData(uniqueTokens);
    }
  }, [watchlists]);

  // Load initial snapshot of market data
  const loadInitialMarketData = async (tokens: number[]) => {
    if (!tokens.length) return;
    
    setIsLoading(true);
    try {
      const marketData = await marketDataService.getCurrentMarketData(tokens);
      
      // Update store with initial data
      Object.entries(marketData).forEach(([token, data]) => {
        updateMarketData(parseInt(token), data);
      });
    } catch (error) {
      console.error('Failed to load initial market data:', error);
      toast.error('Failed to load market data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    instrumentTokens,
    isLoading
  };
};
