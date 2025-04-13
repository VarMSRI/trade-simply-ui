
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SearchResultsProps {
  searchResults: Array<{
    token: number;
    symbol: string;
    name: string;
    exchange: string;
    lastPrice: number | null;
  }>;
  onSelect: (result: any) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchResults, onSelect }) => {
  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Exchange</TableHead>
              <TableHead>Last Price</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searchResults.slice(0, 10).map((result) => (
              <TableRow key={result.token} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">{result.symbol}</TableCell>
                <TableCell>{result.name}</TableCell>
                <TableCell>{result.exchange}</TableCell>
                <TableCell>
                  {result.lastPrice && result.lastPrice > 0 
                    ? `₹${result.lastPrice.toFixed(2)}` 
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onSelect(result)}
                  >
                    Select
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SearchResults;
