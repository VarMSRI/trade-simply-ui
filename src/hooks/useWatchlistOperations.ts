
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Watchlist, WatchlistItem, Instrument, AddInstrumentDTO } from '@/types/watchlist';
import api from '@/services/api';
import instrumentService from '@/services/instrumentService';
import { toast } from 'sonner';

export const useWatchlistOperations = () => {
  const [isAddingSymbol, setIsAddingSymbol] = useState(false);
  const [isCreatingWatchlist, setIsCreatingWatchlist] = useState(false);
  const [isEditingWatchlist, setIsEditingWatchlist] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Instrument[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingWatchlist, setEditingWatchlist] = useState<Watchlist | null>(null);
  const [editingWatchlistName, setEditingWatchlistName] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch all watchlists
  const { data: watchlists = [], isLoading, error } = useQuery({
    queryKey: ['watchlists'],
    queryFn: api.watchlist.getAll,
  });

  // Create watchlist mutation
  const createWatchlistMutation = useMutation({
    mutationFn: api.watchlist.create,
    onSuccess: (newWatchlist) => {
      // Only update the watchlists collection
      queryClient.setQueryData(['watchlists'], (oldWatchlists: any) => 
        [...(oldWatchlists || []), newWatchlist]
      );
      setNewWatchlistName('');
      setIsCreatingWatchlist(false);
      toast.success('Watchlist created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create watchlist: ${error.message}`);
    },
  });

  // Update watchlist mutation
  const updateWatchlistMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => 
      api.watchlist.update(id, data),
    onSuccess: (updatedWatchlist) => {
      // Update only the modified watchlist
      queryClient.setQueryData(['watchlists'], (oldWatchlists: any) => 
        oldWatchlists?.map((watchlist: Watchlist) => 
          watchlist.id === updatedWatchlist.id ? updatedWatchlist : watchlist
        )
      );
      setIsEditingWatchlist(false);
      toast.success('Watchlist updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update watchlist: ${error.message}`);
    },
  });

  // Delete watchlist mutation
  const deleteWatchlistMutation = useMutation({
    mutationFn: api.watchlist.delete,
    onSuccess: (_, deletedWatchlistId) => {
      // Remove the deleted watchlist
      queryClient.setQueryData(['watchlists'], (oldWatchlists: any) => 
        oldWatchlists?.filter((watchlist: Watchlist) => watchlist.id !== deletedWatchlistId)
      );
      toast.success('Watchlist deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete watchlist: ${error.message}`);
    },
  });

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
      
      setIsAddingSymbol(false);
      setSearchQuery('');
      setSearchResults([]);
      toast.success('Symbol added to watchlist successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add symbol: ${error.message}`);
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

  // Handler functions
  const handleCreateWatchlist = () => {
    if (!newWatchlistName.trim()) {
      toast.error('Please enter a watchlist name');
      return;
    }
    
    if (watchlists.length >= 5) {
      toast.error('Maximum limit of 5 watchlists reached');
      return;
    }
    
    createWatchlistMutation.mutate({ name: newWatchlistName });
  };

  const handleUpdateWatchlist = () => {
    if (!editingWatchlist) return;
    
    if (!editingWatchlistName.trim()) {
      toast.error('Please enter a watchlist name');
      return;
    }
    
    updateWatchlistMutation.mutate({ 
      id: editingWatchlist.id, 
      data: { name: editingWatchlistName } 
    });
  };

  const handleDeleteWatchlist = (watchlistId: number) => {
    deleteWatchlistMutation.mutate(watchlistId);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await instrumentService.searchInstruments(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching instruments:', error);
      toast.error('Failed to search instruments');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddInstrument = (instrument: Instrument, watchlistId: number) => {
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

  const handleRemoveInstrument = (item: WatchlistItem, watchlistId: number) => {
    removeInstrumentMutation.mutate({
      watchlistId,
      instrumentKey: item.instrument_key
    });
  };

  const startEditingWatchlist = (watchlist: Watchlist) => {
    setEditingWatchlist(watchlist);
    setEditingWatchlistName(watchlist.name);
    setIsEditingWatchlist(true);
  };

  return {
    watchlists,
    isLoading,
    error,
    isAddingSymbol,
    setIsAddingSymbol,
    isCreatingWatchlist,
    setIsCreatingWatchlist,
    isEditingWatchlist,
    setIsEditingWatchlist,
    newWatchlistName,
    setNewWatchlistName,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    editingWatchlist,
    editingWatchlistName,
    setEditingWatchlistName,
    handleCreateWatchlist,
    handleUpdateWatchlist,
    handleDeleteWatchlist,
    handleSearch,
    handleAddInstrument,
    handleRemoveInstrument,
    startEditingWatchlist,
  };
};
