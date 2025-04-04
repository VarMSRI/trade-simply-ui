
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Watchlist } from '@/types/watchlist';
import { useEffect } from 'react';
import { useWatchlistSubscriptions } from './useWatchlistSubscriptions';

export const useWatchlistData = () => {
  const queryClient = useQueryClient();
  const { syncWatchlistSubscriptions } = useWatchlistSubscriptions();
  
  // Fetch all watchlists
  const { data: watchlists = [], isLoading, error } = useQuery({
    queryKey: ['watchlists'],
    queryFn: api.watchlist.getAll,
  });

  // When watchlists are loaded, sync subscriptions
  useEffect(() => {
    if (watchlists.length > 0) {
      syncWatchlistSubscriptions(watchlists);
    }
  }, [watchlists]);

  return {
    watchlists,
    isLoading,
    error,
  };
};
