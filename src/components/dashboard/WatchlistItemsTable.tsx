
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { WatchlistItem as WatchlistItemType } from '@/types/watchlist';
import WatchlistItem from './WatchlistItem';

interface WatchlistItemsTableProps {
  items: WatchlistItemType[];
  onRemoveItem: (item: WatchlistItemType, watchlistId: number) => void;
  watchlistId: number;
  onAddSymbol: () => void;
}

const WatchlistItemsTable: React.FC<WatchlistItemsTableProps> = ({ 
  items, 
  onRemoveItem, 
  watchlistId,
  onAddSymbol
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No symbols in this watchlist</p>
        <Button 
          variant="link" 
          onClick={onAddSymbol}
          className="mt-2"
        >
          Click to add symbols
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Change</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <WatchlistItem 
            key={item.id}
            item={item}
            onRemove={(item) => onRemoveItem(item, watchlistId)}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default WatchlistItemsTable;
