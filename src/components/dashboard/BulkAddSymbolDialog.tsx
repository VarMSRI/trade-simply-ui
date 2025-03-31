
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Loader2 } from 'lucide-react';
import { Instrument, Watchlist, AddInstrumentDTO } from '@/types/watchlist';

interface BulkAddSymbolDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  watchlistId: number;
  watchlists?: Watchlist[];
  onBulkAddInstruments: (watchlistId: number, instruments: AddInstrumentDTO[]) => void;
  searchInstruments: (query: string) => Promise<void>;
  searchResults: Instrument[];
  isSearching: boolean;
}

const BulkAddSymbolDialog: React.FC<BulkAddSymbolDialogProps> = ({ 
  isOpen,
  onOpenChange,
  watchlistId,
  watchlists,
  onBulkAddInstruments,
  searchInstruments,
  searchResults,
  isSearching
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstruments, setSelectedInstruments] = useState<Instrument[]>([]);
  const [currentWatchlist, setCurrentWatchlist] = useState<Watchlist | undefined>();
  
  // Update current watchlist when watchlistId changes or watchlists are loaded
  useEffect(() => {
    if (watchlists) {
      const watchlist = watchlists.find(w => w.id === watchlistId);
      setCurrentWatchlist(watchlist);
    }
  }, [watchlistId, watchlists]);
  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    searchInstruments(searchQuery);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleCheckboxChange = (instrument: Instrument, checked: boolean) => {
    if (checked) {
      setSelectedInstruments(prev => [...prev, instrument]);
    } else {
      setSelectedInstruments(prev => 
        prev.filter(item => item.instrument_token !== instrument.instrument_token)
      );
    }
  };
  
  const handleAddSelected = () => {
    if (selectedInstruments.length === 0) return;
    
    const instruments: AddInstrumentDTO[] = selectedInstruments.map(instrument => ({
      instrument_key: instrument.instrument_token,
      trading_symbol: instrument.tradingsymbol,
      instrument_name: instrument.name
    }));
    
    onBulkAddInstruments(watchlistId, instruments);
    handleClose();
  };
  
  const handleClose = () => {
    setSearchQuery('');
    setSelectedInstruments([]);
    onOpenChange(false);
  };
  
  // Check if instrument is already in the watchlist
  const isInWatchlist = (instrument: Instrument) => {
    if (!currentWatchlist) return false;
    return currentWatchlist.items.some(
      item => item.instrument_key === instrument.instrument_token
    );
  };
  
  const remainingSlots = currentWatchlist 
    ? 10 - currentWatchlist.items.length 
    : 0;
  
  const isAtLimit = selectedInstruments.length >= remainingSlots;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Multiple Symbols to Watchlist</DialogTitle>
        </DialogHeader>
        
        {currentWatchlist && remainingSlots <= 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-destructive">
              This watchlist has reached its maximum capacity of 10 symbols.
            </p>
          </div>
        ) : (
          <>
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
            
            {currentWatchlist && (
              <div className="text-sm text-muted-foreground">
                You can select up to {remainingSlots} more symbols. Selected: {selectedInstruments.length}
              </div>
            )}
            
            <div className="max-h-72 overflow-y-auto">
              {searchResults.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((instrument) => {
                      const isDisabled = isInWatchlist(instrument) || 
                        (isAtLimit && !selectedInstruments.some(
                          item => item.instrument_token === instrument.instrument_token
                        ));
                      
                      return (
                        <TableRow key={instrument.instrument_token}>
                          <TableCell className="text-center">
                            <Checkbox 
                              checked={selectedInstruments.some(
                                item => item.instrument_token === instrument.instrument_token
                              )}
                              disabled={isDisabled}
                              onCheckedChange={(checked) => 
                                handleCheckboxChange(instrument, checked === true)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">{instrument.tradingsymbol}</TableCell>
                          <TableCell>{instrument.name}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : searchQuery && !isSearching ? (
                <p className="text-sm text-center py-4 text-muted-foreground">No results found</p>
              ) : null}
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <div className="text-sm">
                {selectedInstruments.length} symbols selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddSelected}
                  disabled={selectedInstruments.length === 0}
                >
                  Add Selected
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddSymbolDialog;
