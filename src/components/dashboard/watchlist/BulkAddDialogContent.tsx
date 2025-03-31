
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Watchlist } from '@/types/watchlist';
import SearchInputField from './SearchInputField';
import InstrumentSearchTable from './InstrumentSearchTable';

interface BulkAddDialogContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedInstruments: any[];
  currentWatchlist?: Watchlist;
  remainingSlots: number;
  handleClose: () => void;
  handleAddSelected: () => void;
  isSearching: boolean;
  searchResults: any[];
  onCheckboxChange: (instrument: any, checked: boolean) => void;
}

const BulkAddDialogContent: React.FC<BulkAddDialogContentProps> = ({
  searchQuery,
  setSearchQuery,
  selectedInstruments,
  currentWatchlist,
  remainingSlots,
  handleClose,
  handleAddSelected,
  isSearching,
  searchResults,
  onCheckboxChange
}) => {
  if (currentWatchlist && remainingSlots <= 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-destructive">
          This watchlist has reached its maximum capacity of 10 symbols.
        </p>
      </div>
    );
  }

  return (
    <>
      <SearchInputField searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {currentWatchlist && (
        <div className="text-sm text-muted-foreground">
          You can select up to {remainingSlots} more symbols. Selected: {selectedInstruments.length}
        </div>
      )}
      
      <div className="max-h-72 overflow-y-auto">
        <InstrumentSearchTable
          isSearching={isSearching}
          searchQuery={searchQuery}
          searchResults={searchResults}
          selectedInstruments={selectedInstruments}
          onCheckboxChange={onCheckboxChange}
          currentWatchlist={currentWatchlist}
        />
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
  );
};

export default BulkAddDialogContent;
