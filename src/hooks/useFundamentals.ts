
import { useState } from 'react';
import instrumentService from '@/services/instrumentService';
import { InstrumentFundamentals } from '@/types/fundamentals';
import { toast } from 'sonner';

export function useFundamentals() {
  const [fundamentals, setFundamentals] = useState<InstrumentFundamentals | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchFundamentals = async (instrumentToken: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await instrumentService.getFundamentals(instrumentToken);
      setFundamentals(data);
    } catch (err) {
      console.error('Error fetching fundamentals:', err);
      setError(err as Error);
      toast.error('Failed to fetch company fundamentals');
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearFundamentals = () => {
    setFundamentals(null);
  };
  
  return {
    fundamentals,
    isLoading,
    error,
    fetchFundamentals,
    clearFundamentals
  };
}
