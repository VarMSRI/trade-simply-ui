
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Watchlist } from '@/types/watchlist';
import api from '@/services/api';
import { toast } from 'sonner';

export const useWatchlistMutations = () => {
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [isCreatingWatchlist, setIsCreatingWatchlist] = useState(false);
  const [isEditingWatchlist, setIsEditingWatchlist] = useState(false);
  const [editingWatchlist, setEditingWatchlist] = useState<Watchlist | null>(null);
  const [editingWatchlistName, setEditingWatchlistName] = useState('');
  
  const queryClient = useQueryClient();

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

  const handleCreateWatchlist = () => {
    if (!newWatchlistName.trim()) {
      toast.error('Please enter a watchlist name');
      return;
    }
    
    const watchlists = queryClient.getQueryData<Watchlist[]>(['watchlists']) || [];
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

  const startEditingWatchlist = (watchlist: Watchlist) => {
    setEditingWatchlist(watchlist);
    setEditingWatchlistName(watchlist.name);
    setIsEditingWatchlist(true);
  };

  return {
    // State
    newWatchlistName,
    setNewWatchlistName,
    isCreatingWatchlist,
    setIsCreatingWatchlist,
    isEditingWatchlist,
    setIsEditingWatchlist,
    editingWatchlist,
    editingWatchlistName,
    setEditingWatchlistName,
    
    // Handlers
    handleCreateWatchlist,
    handleUpdateWatchlist,
    handleDeleteWatchlist,
    startEditingWatchlist,
  };
};
