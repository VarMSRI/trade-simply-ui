
import React from 'react';
import { toast } from 'sonner';
import { Settings, Trash, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WatchlistItem as WatchlistItemType } from '@/types/watchlist';
import { useNavigate } from 'react-router-dom';
import { useMarketData } from '@/hooks/useMarketData';

interface WatchlistItemProps {
  item: WatchlistItemType;
  onDelete: (item: WatchlistItemType) => void;
}

const WatchlistItem: React.FC<WatchlistItemProps> = ({ item, onDelete }) => {
  const navigate = useNavigate();
  const { data: marketData } = useMarketData(item.instrument_key);

  // Use market data if available, otherwise use the static data
  const lastPrice = marketData?.lastPrice || item.lastPrice;
  const priceChange = marketData?.change || item.change;
  const priceChangePercent = marketData?.changePercent || item.changePercent;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/trading?symbol=${item.trading_symbol}`);
  };

  const priceChangeClass = priceChange >= 0 ? 'text-green-500' : 'text-red-500';
  
  return (
    <tr className="hover:bg-muted/50 cursor-pointer">
      <td className="px-2 py-1">{item.trading_symbol}</td>
      <td className="px-2 py-1">₹{lastPrice?.toFixed(2)}</td>
      <td className={`px-2 py-1 ${priceChangeClass}`}>
        {priceChange >= 0 ? '+' : ''}{priceChange?.toFixed(2)} ({priceChangePercent?.toFixed(2)}%)
      </td>
      <td className="px-2 py-1 text-right">
        <Button variant="ghost" size="icon" onClick={handleView} className="h-7 w-7">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete} className="h-7 w-7">
          <Trash className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};

export default WatchlistItem;
