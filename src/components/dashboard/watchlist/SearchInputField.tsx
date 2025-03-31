
import React from 'react';
import { Input } from '@/components/ui/input';

interface SearchInputFieldProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

const SearchInputField: React.FC<SearchInputFieldProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  placeholder = "Search symbol or company name" 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="grid flex-1 gap-2">
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchInputField;
