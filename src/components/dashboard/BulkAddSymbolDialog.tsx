
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Instrument, Watchlist, AddInstrumentDTO } from '@/types/watchlist';
import BulkAddDialogContent from './watchlist/BulkAddDialogContent';

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
  
  // Dynamic search as user types
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
  
  const remainingSlots = currentWatchlist 
    ? 10 - currentWatchlist.items.length 
    : 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Multiple Symbols to Watchlist</DialogTitle>
        </DialogHeader>
        
        <BulkAddDialogContent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedInstruments={selectedInstruments}
          currentWatchlist={currentWatchlist}
          remainingSlots={remainingSlots}
          handleClose={handleClose}
          handleAddSelected={handleAddSelected}
          isSearching={isSearching}
          searchResults={searchResults}
          onCheckboxChange={handleCheckboxChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddSymbolDialog;
