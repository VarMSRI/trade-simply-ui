
import { create } from 'zustand';
import { getAuthHeaders } from './apiUtils';

export interface MarketData {
  [key: number]: {
    lastPrice: number;
    change: number;
    changePercent: number;
    volume?: number;
    updatedAt: string;
  };
}

interface MarketDataStore {
  data: MarketData;
  updateMarketData: (instrumentToken: number, update: any) => void;
  getMarketData: (instrumentToken: number) => any;
}

// Create a global store for market data
export const useMarketDataStore = create<MarketDataStore>((set, get) => ({
  data: {},
  
  updateMarketData: (instrumentToken, update) => {
    set((state) => ({
      data: {
        ...state.data,
        [instrumentToken]: {
          lastPrice: update.lastTradedPrice || update.last_price,
          change: update.change || 0,
          changePercent: update.changePercent || 0,
          volume: update.volume,
          updatedAt: update.timestamp || new Date().toISOString(),
        }
      }
    }));
  },
  
  getMarketData: (instrumentToken) => {
    return get().data[instrumentToken];
  }
}));

const marketDataService = {
  getCurrentMarketData: async (instrumentTokens: number[]): Promise<MarketData> => {
    try {
      const response = await fetch(`https://app.intuitifi.com/api/market-data/snapshot`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instrument_tokens: instrumentTokens }),
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching market data: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      return {};
    }
  }
};

export default marketDataService;
