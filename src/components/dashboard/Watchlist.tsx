
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Star, Loader2 } from 'lucide-react';
import { useWatchlistOperations } from '@/hooks/useWatchlistOperations';
import WatchlistCard from './WatchlistCard';
import CreateWatchlistDialog from './CreateWatchlistDialog';
import EditWatchlistDialog from './EditWatchlistDialog';
import AddSymbolDialog from './AddSymbolDialog';

const Watchlist: React.FC = () => {
  const { 
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
  } = useWatchlistOperations();

  if (error) {
    return (
      <Card className="col-span-2">
        <CardContent className="text-center py-8">
          <div className="text-destructive">Failed to load watchlists</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Watchlists</h1>
        <Button onClick={() => setIsCreatingWatchlist(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Watchlist
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : watchlists.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {watchlists.map((watchlist) => (
            <WatchlistCard
              key={watchlist.id}
              watchlist={watchlist}
              onEditWatchlist={startEditingWatchlist}
              onDeleteWatchlist={handleDeleteWatchlist}
              onRemoveInstrument={handleRemoveInstrument}
              onAddInstrument={handleAddInstrument}
              searchInstruments={handleSearch}
              searchResults={searchResults}
              isSearching={isSearching}
              setIsAddingSymbol={setIsAddingSymbol}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No watchlists found</p>
            <Button 
              variant="link" 
              onClick={() => setIsCreatingWatchlist(true)}
              className="mt-2"
            >
              Create your first watchlist
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Watchlist Dialog */}
      <CreateWatchlistDialog
        isOpen={isCreatingWatchlist}
        onOpenChange={setIsCreatingWatchlist}
        watchlistName={newWatchlistName}
        onWatchlistNameChange={setNewWatchlistName}
        onCreateWatchlist={handleCreateWatchlist}
      />

      {/* Edit Watchlist Dialog */}
      <EditWatchlistDialog
        isOpen={isEditingWatchlist}
        onOpenChange={setIsEditingWatchlist}
        watchlistName={editingWatchlistName}
        onWatchlistNameChange={setEditingWatchlistName}
        onUpdateWatchlist={handleUpdateWatchlist}
      />

      {/* Add Symbol Dialog for mobile view */}
      <AddSymbolDialog
        watchlistId={-1} // This will be ignored in mobile mode
        onAddInstrument={handleAddInstrument}
        searchInstruments={handleSearch}
        searchResults={searchResults}
        isSearching={isSearching}
        watchlists={watchlists}
        isMobile={true}
      />
    </div>
  );
};

export default Watchlist;
