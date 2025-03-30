
import React from 'react';
import {
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { WatchlistItem as WatchlistItemType } from '@/types/watchlist';

interface WatchlistItemProps {
  item: WatchlistItemType;
  onRemove: (item: WatchlistItemType) => void;
}

const WatchlistItem: React.FC<WatchlistItemProps> = ({ item, onRemove }) => {
  return (
    <TableRow key={item.id} className="table-row-hover cursor-pointer">
      <TableCell className="font-medium">{item.trading_symbol}</TableCell>
      <TableCell>{item.instrument_name}</TableCell>
      <TableCell className="text-right">
        {item.lastPrice ? `₹${item.lastPrice.toFixed(2)}` : '-'}
      </TableCell>
      <TableCell className="text-right">
        {item.change !== null && item.changePercent !== null ? (
          <span className={item.change >= 0 ? "text-green-500" : "text-red-500"}>
            {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)} ({item.change >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%)
          </span>
        ) : '-'}
      </TableCell>
      <TableCell className="w-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => onRemove(item)}
        >
          <X className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default WatchlistItem;
