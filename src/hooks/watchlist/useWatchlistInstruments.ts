
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
    if (!query.trim()) return;
    
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

  const handleBulkAddInstruments = (watchlistId: number) => {
    // Here we'll use top 5 popular instruments as a demo
    // In a real app, you'd present a selection UI
    const popularSymbols = [
      { tradingsymbol: 'RELIANCE', name: 'Reliance Industries Ltd.', instrument_token: 256265 },
      { tradingsymbol: 'TCS', name: 'Tata Consultancy Services Ltd.', instrument_token: 60193 },
      { tradingsymbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', instrument_token: 738561 },
      { tradingsymbol: 'INFY', name: 'Infosys Ltd.', instrument_token: 895745 },
      { tradingsymbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', instrument_token: 3861249 }
    ];

    const watchlists = queryClient.getQueryData<Watchlist[]>(['watchlists']) || [];
    const watchlist = watchlists.find(w => w.id === watchlistId);
    
    if (!watchlist) {
      toast.error('Watchlist not found');
      return;
    }
    
    if (watchlist.items.length + popularSymbols.length > 10) {
      toast.error('Adding these symbols would exceed the maximum limit of 10 symbols per watchlist');
      return;
    }

    // Filter out symbols that are already in the watchlist
    const existingSymbols = new Set(watchlist.items.map(item => item.trading_symbol));
    const newSymbols = popularSymbols.filter(
      symbol => !existingSymbols.has(symbol.tradingsymbol)
    );
    
    if (newSymbols.length === 0) {
      toast.info('All popular symbols are already in your watchlist');
      return;
    }
    
    const instruments: AddInstrumentDTO[] = newSymbols.map(symbol => ({
      instrument_key: symbol.instrument_token,
      trading_symbol: symbol.tradingsymbol,
      instrument_name: symbol.name
    }));
    
    bulkAddInstrumentsMutation.mutate({
      watchlistId: watchlist.id,
      instruments
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
