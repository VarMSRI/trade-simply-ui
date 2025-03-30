
import { useReducer, useEffect } from 'react';
import { useWatchlistData } from './watchlist/useWatchlistData';
import { useWatchlistMutations } from './watchlist/useWatchlistMutations';
import { useWatchlistInstruments } from './watchlist/useWatchlistInstruments';
import { initialWatchlistState, watchlistReducer } from './watchlist/watchlistReducer';

export const useWatchlistOperations = () => {
  // Set up reducer
  const [state, dispatch] = useReducer(watchlistReducer, initialWatchlistState);
  
  // Combine the functionality from the smaller hooks
  const watchlistData = useWatchlistData();
  const watchlistMutations = useWatchlistMutations(state, dispatch);
  const watchlistInstruments = useWatchlistInstruments(state, dispatch);
  
  // Update state from watchlistData
  useEffect(() => {
    if (watchlistData.watchlists) {
      dispatch({ type: 'SET_WATCHLISTS', payload: watchlistData.watchlists });
    }
    dispatch({ type: 'SET_LOADING', payload: watchlistData.isLoading });
    if (watchlistData.error) {
      dispatch({ type: 'SET_ERROR', payload: watchlistData.error });
    }
  }, [watchlistData.watchlists, watchlistData.isLoading, watchlistData.error]);
  
  // Create action dispatcher functions
  const setIsAddingSymbol = (value: boolean) => dispatch({ type: 'SET_ADDING_SYMBOL', payload: value });
  const setIsCreatingWatchlist = (value: boolean) => dispatch({ type: 'SET_CREATING_WATCHLIST', payload: value });
  const setIsEditingWatchlist = (value: boolean) => dispatch({ type: 'SET_EDITING_WATCHLIST', payload: value });
  const setNewWatchlistName = (value: string) => dispatch({ type: 'SET_NEW_WATCHLIST_NAME', payload: value });
  const setEditingWatchlistName = (value: string) => dispatch({ type: 'SET_EDITING_WATCHLIST_NAME', payload: value });
  
  return {
    // State from reducer
    ...state,
    
    // Action dispatchers
    setIsAddingSymbol,
    setIsCreatingWatchlist,
    setIsEditingWatchlist,
    setNewWatchlistName,
    setEditingWatchlistName,
    
    // Handler functions from other hooks
    ...watchlistMutations,
    ...watchlistInstruments,
  };
};
