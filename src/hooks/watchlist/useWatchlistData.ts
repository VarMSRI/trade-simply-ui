
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Watchlist } from '@/types/watchlist';

export const useWatchlistData = () => {
  // Fetch all watchlists
  const { data: watchlists = [], isLoading, error } = useQuery({
    queryKey: ['watchlists'],
    queryFn: api.watchlist.getAll,
  });

  return {
    watchlists,
    isLoading,
    error,
  };
};
