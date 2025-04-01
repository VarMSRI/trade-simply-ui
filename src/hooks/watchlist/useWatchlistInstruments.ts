
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WatchlistItem, Instrument, AddInstrumentDTO, Watchlist } from '@/types/watchlist';
import api from '@/services/api';
import instrumentService from '@/services/instrumentService';
import { toast } from 'sonner';
import { WatchlistAction } from './watchlistReducer';

export const useWatchlistInstruments = (state: any, dispatch: React.Dispatch<WatchlistAction>) => {
  const queryClient = useQueryClient();

  // Add instrument mutation
  const addInstrumentMutation = useMutation({
    mutationFn: ({ watchlistId, instrumentData }: { watchlistId: number; instrumentData: AddInstrumentDTO }) => 
      api.watchlist.addInstrument(watchlistId, instrumentData),
    onSuccess: async (_, variables) => {
      // Fetch only the updated watchlist
      const updatedWatchlist = await api.watchlist.get(variables.watchlistId);
      
      // Update the specific watchlist in the cache
      queryClient.setQueryData(['watchlists'], (oldWatchlists: any) => 
        oldWatchlists?.map((watchlist: Watchlist) => 
          watchlist.id === variables.watchlistId ? updatedWatchlist : watchlist
        )
      );
      
      // Also update subscriptions to include this new instrument token
      try {
        // Get current subscriptions
        const subscriptions = await api.subscriptions.getSubscriptions();
        const subscribedTokens = new Set(subscriptions.instrument_tokens);
        
        // If the instrument is not already subscribed, add it
        if (!subscribedTokens.has(variables.instrumentData.instrument_key)) {
          const allTokens = [...Array.from(subscribedTokens), variables.instrumentData.instrument_key];
          await api.subscriptions.updateSubscriptions(allTokens);
          console.log('Added instrument to market data subscriptions:', variables.instrumentData.trading_symbol);
        }
      } catch (error) {
        console.error('Error updating subscriptions after adding instrument:', error);
        // We don't throw here to prevent affecting the UI flow
      }
      
      dispatch({ type: 'SET_ADDING_SYMBOL', payload: false });
      dispatch({ type: 'RESET_SEARCH' });
      toast.success('Symbol added to watchlist successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add symbol: ${error.message}`);
    },
  });

  // New bulk add instruments mutation
  const bulkAddInstrumentsMutation = useMutation({
    mutationFn: ({ watchlistId, instruments }: { watchlistId: number; instruments: AddInstrumentDTO[] }) => 
      api.watchlist.addInstrumentsBulk(watchlistId, instruments),
    onSuccess: async (_, variables) => {
      // Fetch only the updated watchlist
      const updatedWatchlist = await api.watchlist.get(variables.watchlistId);
      
      // Update the specific watchlist in the cache
      queryClient.setQueryData(['watchlists'], (oldWatchlists: any) => 
        oldWatchlists?.map((watchlist: Watchlist) => 
          watchlist.id === variables.watchlistId ? updatedWatchlist : watchlist
        )
      );
      
      // Also update subscriptions to include these new instrument tokens
      try {
        // Get current subscriptions
        const subscriptions = await api.subscriptions.getSubscriptions();
        const subscribedTokens = new Set(subscriptions.instrument_tokens);
        
        // Filter new tokens that need to be subscribed
        const newTokens = variables.instruments
          .map(instrument => instrument.instrument_key)
          .filter(token => !subscribedTokens.has(token));
        
        // If there are new tokens to subscribe
        if (newTokens.length > 0) {
          const allTokens = [...Array.from(subscribedTokens), ...newTokens];
          await api.subscriptions.updateSubscriptions(allTokens);
          console.log(`Added ${newTokens.length} instruments to market data subscriptions`);
        }
      } catch (error) {
        console.error('Error updating subscriptions after bulk adding instruments:', error);
        // We don't throw here to prevent affecting the UI flow
      }
      
      toast.success('Symbols added to watchlist successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add symbols: ${error.message}`);
    },
  });

  // Remove instrument mutation
  const removeInstrumentMutation = useMutation({
    mutationFn: ({ watchlistId, instrumentKey }: { watchlistId: number; instrumentKey: number }) => 
      api.watchlist.removeItem(watchlistId, instrumentKey),
    onSuccess: async (_, variables) => {
      // Fetch only the updated watchlist
      const updatedWatchlist = await api.watchlist.get(variables.watchlistId);
      
      // Update the specific watchlist in the cache
      queryClient.setQueryData(['watchlists'], (oldWatchlists: any) => 
        oldWatchlists?.map((watchlist: Watchlist) => 
          watchlist.id === variables.watchlistId ? updatedWatchlist : watchlist
        )
      );
      
      toast.success('Symbol removed from watchlist');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove symbol: ${error.message}`);
    },
  });

  const handleSearch = async (query: string = state.searchQuery) => {
    if (!query.trim() || query.trim().length < 2) return;
    
    dispatch({ type: 'SET_IS_SEARCHING', payload: true });
    try {
      const results = await instrumentService.searchInstruments(query);
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
    } catch (error) {
      console.error('Error searching instruments:', error);
      toast.error('Failed to search instruments');
    } finally {
      dispatch({ type: 'SET_IS_SEARCHING', payload: false });
    }
  };

  const handleAddInstrument = (instrument: Instrument, watchlistId: number) => {
    const watchlists = queryClient.getQueryData<Watchlist[]>(['watchlists']) || [];
    const watchlist = watchlists.find(w => w.id === watchlistId);
    
    if (!watchlist) {
      toast.error('Watchlist not found');
      return;
    }
    
    if (watchlist.items.length >= 10) {
      toast.error('Maximum limit of 10 symbols per watchlist reached');
      return;
    }
    
    const instrumentData: AddInstrumentDTO = {
      instrument_key: instrument.instrument_token,
      trading_symbol: instrument.tradingsymbol,
      instrument_name: instrument.name
    };
    
    addInstrumentMutation.mutate({
      watchlistId: watchlist.id,
      instrumentData
    });
  };

  const handleBulkAddInstruments = (watchlistId: number, instruments?: AddInstrumentDTO[]) => {
    // If instruments are provided, use them; otherwise, use default popular symbols
    if (!instruments) {
      // Here we'll use top 5 popular instruments as a demo
      const popularSymbols = [
        { tradingsymbol: 'RELIANCE', name: 'Reliance Industries Ltd.', instrument_token: 256265 },
        { tradingsymbol: 'TCS', name: 'Tata Consultancy Services Ltd.', instrument_token: 60193 },
        { tradingsymbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', instrument_token: 738561 },
        { tradingsymbol: 'INFY', name: 'Infosys Ltd.', instrument_token: 895745 },
        { tradingsymbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', instrument_token: 3861249 }
      ];
      
      instruments = popularSymbols.map(symbol => ({
        instrument_key: symbol.instrument_token,
        trading_symbol: symbol.tradingsymbol,
        instrument_name: symbol.name
      }));
    }

    const watchlists = queryClient.getQueryData<Watchlist[]>(['watchlists']) || [];
    const watchlist = watchlists.find(w => w.id === watchlistId);
    
    if (!watchlist) {
      toast.error('Watchlist not found');
      return;
    }
    
    if (watchlist.items.length + instruments.length > 10) {
      toast.error('Adding these symbols would exceed the maximum limit of 10 symbols per watchlist');
      return;
    }

    // Filter out symbols that are already in the watchlist
    const existingSymbols = new Set(watchlist.items.map(item => item.trading_symbol));
    const newInstruments = instruments.filter(
      instrument => !existingSymbols.has(instrument.trading_symbol)
    );
    
    if (newInstruments.length === 0) {
      toast.info('All selected symbols are already in your watchlist');
      return;
    }
    
    bulkAddInstrumentsMutation.mutate({
      watchlistId: watchlist.id,
      instruments: newInstruments
    });
  };

  const handleRemoveInstrument = (item: WatchlistItem, watchlistId: number) => {
    removeInstrumentMutation.mutate({
      watchlistId,
      instrumentKey: item.instrument_key
    });
  };

  return {
    // Handlers
    handleSearch,
    handleAddInstrument,
    handleBulkAddInstruments,
    handleRemoveInstrument,
  };
};
