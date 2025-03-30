
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Watchlist } from '@/types/watchlist';
import api from '@/services/api';
import { toast } from 'sonner';
import { WatchlistAction } from './watchlistReducer';

export const useWatchlistMutations = (state: any, dispatch: React.Dispatch<WatchlistAction>) => {
  const queryClient = useQueryClient();

  // Create watchlist mutation
  const createWatchlistMutation = useMutation({
    mutationFn: api.watchlist.create,
    onSuccess: (newWatchlist) => {
      // Only update the watchlists collection
      queryClient.setQueryData(['watchlists'], (oldWatchlists: any) => 
        [...(oldWatchlists || []), newWatchlist]
      );
      
      dispatch({ type: 'RESET_WATCHLIST_FORM' });
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
      
      dispatch({ type: 'SET_EDITING_WATCHLIST', payload: false });
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
    if (!state.newWatchlistName.trim()) {
      toast.error('Please enter a watchlist name');
      return;
    }
    
    const watchlists = queryClient.getQueryData<Watchlist[]>(['watchlists']) || [];
    if (watchlists.length >= 5) {
      toast.error('Maximum limit of 5 watchlists reached');
      return;
    }
    
    createWatchlistMutation.mutate({ name: state.newWatchlistName });
  };

  const handleUpdateWatchlist = () => {
    if (!state.editingWatchlist) return;
    
    if (!state.editingWatchlistName.trim()) {
      toast.error('Please enter a watchlist name');
      return;
    }
    
    updateWatchlistMutation.mutate({ 
      id: state.editingWatchlist.id, 
      data: { name: state.editingWatchlistName } 
    });
  };

  const handleDeleteWatchlist = (watchlistId: number) => {
    deleteWatchlistMutation.mutate(watchlistId);
  };

  const startEditingWatchlist = (watchlist: Watchlist) => {
    dispatch({ type: 'START_EDITING_WATCHLIST', payload: watchlist });
  };

  return {
    // Handlers
    handleCreateWatchlist,
    handleUpdateWatchlist,
    handleDeleteWatchlist,
    startEditingWatchlist,
  };
};
