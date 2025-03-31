
import { useState, useEffect } from 'react';

interface Instrument {
  token: number;
  symbol: string;
  name: string;
  exchange: string;
  lastPrice?: number;
  change?: number;
  changePercent?: number;
}

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
        // In a real app, this would be an API call
        // For now, we're using the CSV file loaded in the public folder
        const instruments = (window as any).instruments || [];
        
        if (!instruments || instruments.length === 0) {
          console.log('No instruments data available');
          setResults([]);
          setIsLoading(false);
          return;
        }
        
        const filtered = instruments.filter(
          (instrument: any) =>
            (instrument.symbol && instrument.symbol.toLowerCase().includes(query.toLowerCase())) ||
            (instrument.name && instrument.name.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 10); // Limit to 10 results
        
        const mappedResults = filtered.map((instrument: any) => ({
          token: instrument.token,
          symbol: instrument.symbol,
          name: instrument.name,
          exchange: instrument.exchange,
          lastPrice: instrument.lastPrice,
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
