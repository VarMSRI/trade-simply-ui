
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import { Watchlist } from '@/types/watchlist';
import { useWatchlistSubscriptions } from './useWatchlistSubscriptions';

export const useWatchlistData = () => {
  const { syncWatchlistSubscriptions } = useWatchlistSubscriptions();

  const { data: watchlists, isLoading, error, refetch } = useQuery({
    queryKey: ['watchlists'],
    queryFn: async (): Promise<Watchlist[]> => {
      try {
        const data = await api.watchlist.getWatchlists();
        
        // Sync subscriptions with watchlist instruments
        if (data && data.length > 0) {
          await syncWatchlistSubscriptions(data);
        }
        
        return data || [];
      } catch (error) {
        console.error('Error fetching watchlists:', error);
        toast.error('Failed to load watchlists');
        throw error;
      }
    },
  });

  return {
    watchlists,
    isLoading,
    error,
    refetch
  };
};
