
import { useState, useEffect } from 'react';
import instrumentService from '@/services/instrumentService';
import { Instrument } from '@/types/watchlist';

export function useSearchInstruments(query: string) {
  const [results, setResults] = useState<Instrument[]>([]);
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
        
        // Map the results to match the expected structure
        const mappedResults = matchedInstruments.map(instrument => ({
          token: instrument.instrument_token,
          symbol: instrument.tradingsymbol,
          name: instrument.name || '',
          exchange: instrument.exchange || 'NSE',
          lastPrice: instrument.last_price,
          change: instrument.change,
          changePercent: instrument.changePercent,
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
