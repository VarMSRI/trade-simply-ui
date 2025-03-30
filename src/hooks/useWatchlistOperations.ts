
import { useWatchlistData } from './watchlist/useWatchlistData';
import { useWatchlistMutations } from './watchlist/useWatchlistMutations';
import { useWatchlistInstruments } from './watchlist/useWatchlistInstruments';

export const useWatchlistOperations = () => {
  // Combine the functionality from the smaller hooks
  const watchlistData = useWatchlistData();
  const watchlistMutations = useWatchlistMutations();
  const watchlistInstruments = useWatchlistInstruments();
  
  return {
    ...watchlistData,
    ...watchlistMutations,
    ...watchlistInstruments
  };
};
