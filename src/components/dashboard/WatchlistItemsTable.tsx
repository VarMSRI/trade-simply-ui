
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
import { Plus } from 'lucide-react';
import { WatchlistItem as WatchlistItemType } from '@/types/watchlist';
import WatchlistItem from './WatchlistItem';

interface WatchlistItemsTableProps {
  items: WatchlistItemType[];
  onRemoveItem: (item: WatchlistItemType, watchlistId: number) => void;
  watchlistId: number;
  onAddSymbol: () => void;
  onBulkAdd: (watchlistId: number) => void;
}

const WatchlistItemsTable: React.FC<WatchlistItemsTableProps> = ({ 
  items, 
  onRemoveItem, 
  watchlistId,
  onAddSymbol,
  onBulkAdd
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No symbols in this watchlist</p>
        <div className="flex justify-center gap-2 mt-2">
          <Button 
            variant="link" 
            onClick={onAddSymbol}
          >
            Add individual symbol
          </Button>
          <Button 
            variant="link"
            onClick={() => onBulkAdd(watchlistId)}
          >
            Add multiple symbols
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBulkAdd(watchlistId)}
          className="flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Add multiple symbols
        </Button>
      </div>
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
    </div>
  );
};

export default WatchlistItemsTable;
