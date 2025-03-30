
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Instrument, Watchlist } from '@/types/watchlist';

interface AddSymbolDialogProps {
  watchlistId: number;
  onAddInstrument: (instrument: Instrument, watchlistId: number) => void;
  searchInstruments: (query: string) => Promise<void>;
  searchResults: Instrument[];
  isSearching: boolean;
  watchlists?: Watchlist[];
  isMobile?: boolean;
}

const AddSymbolDialog: React.FC<AddSymbolDialogProps> = ({ 
  watchlistId,
  onAddInstrument,
  searchInstruments,
  searchResults,
  isSearching,
  watchlists,
  isMobile = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    searchInstruments(searchQuery);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isMobile ? (
          <div></div> // Empty div for mobile as the trigger is handled elsewhere
        ) : (
          <Button size="sm" className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add Symbol
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Symbol to Watchlist</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              placeholder="Search symbol or company name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button type="submit" size="sm" className="px-3" onClick={handleSearch}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="max-h-72 overflow-y-auto">
          {isMobile && searchResults.length > 0 && watchlists && watchlists.length > 0 ? (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Select a watchlist:</p>
              <div className="flex flex-wrap gap-2">
                {watchlists.map((watchlist) => (
                  <Button 
                    key={watchlist.id} 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (searchResults.length > 0) {
                        onAddInstrument(searchResults[0], watchlist.id);
                      }
                    }}
                  >
                    {watchlist.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
          
          {searchResults.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  {!isMobile && <TableHead className="text-right">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((instrument) => (
                  <TableRow key={instrument.instrument_token}>
                    <TableCell className="font-medium">{instrument.tradingsymbol}</TableCell>
                    <TableCell>{instrument.name}</TableCell>
                    {!isMobile && (
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onAddInstrument(instrument, watchlistId)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : searchQuery && !isSearching ? (
            <p className="text-sm text-center py-4 text-muted-foreground">No results found</p>
          ) : null}
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSymbolDialog;
