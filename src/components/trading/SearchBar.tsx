
import React from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, Search, AlertCircle, BarChart4 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isSearching: boolean;
  searchError: Error | null;
  onRequestFundamentals?: (token: number) => void;
  selectedInstrumentToken?: number;
  isFundamentalsVisible?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  isSearching, 
  searchError,
  onRequestFundamentals,
  selectedInstrumentToken,
  isFundamentalsVisible
}) => {
  return (
    <>
      <div className="relative flex w-full max-w-lg items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search for a stock symbol or company name..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {selectedInstrumentToken && onRequestFundamentals && (
          <Button
            variant={isFundamentalsVisible ? "default" : "outline"}
            size="sm"
            onClick={() => onRequestFundamentals(selectedInstrumentToken)}
            className="whitespace-nowrap"
          >
            <BarChart4 className="h-4 w-4 mr-2" />
            {isFundamentalsVisible ? "Refresh Fundamentals" : "Show Fundamentals"}
          </Button>
        )}
      </div>
      
      {isSearching && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p>Searching instruments...</p>
        </div>
      )}

      {searchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to search instruments. Please try again.</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default SearchBar;
