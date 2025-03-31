
import React from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isSearching: boolean;
  searchError: Error | null;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  isSearching, 
  searchError 
}) => {
  return (
    <>
      <div className="relative flex w-full max-w-lg">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search for a stock symbol or company name..." 
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
