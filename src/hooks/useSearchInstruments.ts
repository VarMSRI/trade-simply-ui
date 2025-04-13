
import { useState, useEffect } from 'react';
import instrumentService from '@/services/instrumentService';
import { Instrument } from '@/types/watchlist';

// Define an interface for the search results that matches what Trading.tsx expects
interface InstrumentSearchResult {
  token: number;
  symbol: string;
  name: string;
  exchange: string;
  lastPrice: number | null;
  change: number | null;
  changePercent: number | null;
}

export function useSearchInstruments(query: string) {
  const [results, setResults] = useState<InstrumentSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const searchInstruments = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Use the instrumentService to search for instruments
        const matchedInstruments = await instrumentService.searchInstruments(query);
        
        // Map the results to match the expected structure used in Trading.tsx
        const mappedResults = matchedInstruments.map(instrument => ({
          token: instrument.instrument_token,
          symbol: instrument.tradingsymbol,
          name: instrument.name || '',
          exchange: instrument.exchange || 'NSE',
          lastPrice: instrument.last_price > 0 ? instrument.last_price : null,
          // Since these properties don't exist in the Instrument type, set them to null
          change: null,
          changePercent: null,
        }));
        
        setResults(mappedResults);
      } catch (err) {
        console.error('Error searching instruments:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    searchInstruments();
  }, [query]);

  return { results, isLoading, error };
}
