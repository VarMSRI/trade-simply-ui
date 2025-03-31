
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Instrument, Watchlist } from '@/types/watchlist';
import { Loader2 } from 'lucide-react';

interface InstrumentSearchTableProps {
  isSearching: boolean;
  searchQuery: string;
  searchResults: Instrument[];
  selectedInstruments: Instrument[];
  onCheckboxChange: (instrument: Instrument, checked: boolean) => void;
  currentWatchlist?: Watchlist;
}

const InstrumentSearchTable: React.FC<InstrumentSearchTableProps> = ({
  isSearching,
  searchQuery,
  searchResults,
  selectedInstruments,
  onCheckboxChange,
  currentWatchlist,
}) => {
  // Calculate remaining slots for the watchlist
  const remainingSlots = currentWatchlist 
    ? 10 - currentWatchlist.items.length 
    : 0;
  
  const isAtLimit = selectedInstruments.length >= remainingSlots;

  // Check if instrument is already in the watchlist
  const isInWatchlist = (instrument: Instrument) => {
    if (!currentWatchlist) return false;
    return currentWatchlist.items.some(
      item => item.instrument_key === instrument.instrument_token
    );
  };

  if (isSearching) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (searchResults.length > 0) {
    return (
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
                      onCheckboxChange(instrument, checked === true)
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
    );
  }

  if (searchQuery.trim().length >= 2 && !isSearching) {
    return (
      <p className="text-sm text-center py-4 text-muted-foreground">No results found</p>
    );
  }

  if (searchQuery.trim().length > 0 && searchQuery.trim().length < 2) {
    return (
      <p className="text-sm text-center py-4 text-muted-foreground">Type at least 2 characters to search</p>
    );
  }

  return null;
};

export default InstrumentSearchTable;
