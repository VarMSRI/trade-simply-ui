
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Star, MoreVertical, Edit, Trash } from 'lucide-react';
import { Watchlist } from '@/types/watchlist';
import WatchlistItemsTable from './WatchlistItemsTable';
import AddSymbolDialog from './AddSymbolDialog';

interface WatchlistCardProps {
  watchlist: Watchlist;
  onEditWatchlist: (watchlist: Watchlist) => void;
  onDeleteWatchlist: (watchlistId: number) => void;
  onRemoveInstrument: (item: any, watchlistId: number) => void;
  onAddInstrument: (instrument: any, watchlistId: number) => void;
  searchInstruments: (query: string) => Promise<void>;
  searchResults: any[];
  isSearching: boolean;
  setIsAddingSymbol: (isAdding: boolean) => void;
}

const WatchlistCard: React.FC<WatchlistCardProps> = ({
  watchlist,
  onEditWatchlist,
  onDeleteWatchlist,
  onRemoveInstrument,
  onAddInstrument,
  searchInstruments,
  searchResults,
  isSearching,
  setIsAddingSymbol,
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-4 w-4 text-primary" />
          {watchlist.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditWatchlist(watchlist)}>
                <Edit className="mr-2 h-4 w-4" />
                Rename Watchlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteWatchlist(watchlist.id)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete Watchlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AddSymbolDialog
            watchlistId={watchlist.id}
            onAddInstrument={onAddInstrument}
            searchInstruments={searchInstruments}
            searchResults={searchResults}
            isSearching={isSearching}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <WatchlistItemsTable
          items={watchlist.items}
          onRemoveItem={onRemoveInstrument}
          watchlistId={watchlist.id}
          onAddSymbol={() => setIsAddingSymbol(true)}
        />
      </CardContent>
    </Card>
  );
};

export default WatchlistCard;
