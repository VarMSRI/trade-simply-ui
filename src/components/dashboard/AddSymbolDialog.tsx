
import React, { useState, useEffect } from 'react';
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
import { Plus, Loader2 } from 'lucide-react';
import { Instrument, Watchlist } from '@/types/watchlist';
import SearchInputField from './watchlist/SearchInputField';

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
  
  // Search as user types
  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim().length < 2) return;
      
      try {
        await searchInstruments(searchQuery);
      } catch (error) {
        console.error('Error searching instruments:', error);
      }
    };
    
    // Add debounce to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchResults();
      }
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchInstruments]);
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery('');
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
        
        <SearchInputField 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
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
          
          {isSearching ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : searchResults.length > 0 ? (
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
          ) : searchQuery.trim() && !isSearching ? (
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
