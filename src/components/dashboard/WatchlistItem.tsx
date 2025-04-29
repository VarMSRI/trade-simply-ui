
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { WatchlistItem as WatchlistItemType } from '@/types/watchlist';
import { useMarketDataStore } from '@/services/marketDataService';

interface WatchlistItemProps {
  item: WatchlistItemType;
  onRemove: (item: WatchlistItemType) => void;
}

const WatchlistItem: React.FC<WatchlistItemProps> = ({ item, onRemove }) => {
  // Get market data from the store
  const marketData = useMarketDataStore(state => state.data);
  const itemData = marketData[item.instrument_key];
  
  // Use real-time data if available, otherwise fall back to the item data
  const lastPrice = itemData ? itemData.lastPrice : item.lastPrice;
  const change = itemData ? itemData.change : item.change;
  const changePercent = itemData ? itemData.changePercent : item.changePercent;
  
  // Highlight price cells if they've been updated
  const hasUpdate = !!itemData;
  
  return (
    <TableRow className="group">
      <TableCell className="font-medium">{item.trading_symbol}</TableCell>
      <TableCell>{item.instrument_name}</TableCell>
      <TableCell className={`text-right ${hasUpdate ? 'animate-pulse-once bg-accent/20' : ''}`}>
        {lastPrice !== null ? `₹${lastPrice.toFixed(2)}` : '-'}
      </TableCell>
      <TableCell className="text-right">
        {change !== null && changePercent !== null ? (
          <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
            {change >= 0 ? "+" : ""}{change.toFixed(2)} ({change >= 0 ? "+" : ""}{changePercent.toFixed(2)}%)
          </span>
        ) : '-'}
      </TableCell>
      <TableCell className="w-10">
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 h-8 w-8"
          onClick={() => onRemove(item)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default WatchlistItem;
