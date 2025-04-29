
import React from 'react';
import WatchlistComponent from '@/components/dashboard/Watchlist';
import { useMarketDataSubscriptions } from '@/hooks/useMarketDataSubscriptions';
import { useWatchlistData } from '@/hooks/watchlist/useWatchlistData';
import WebSocketManager from '@/components/market/WebSocketManager';

const WatchlistPage: React.FC = () => {
  // Get watchlist data
  const { watchlists } = useWatchlistData();
  
  // Setup market data subscriptions
  const { instrumentTokens } = useMarketDataSubscriptions(watchlists || []);
  
  return (
    <div className="space-y-4">
      {/* WebSocket Manager - renders nothing visually */}
      {instrumentTokens.length > 0 && <WebSocketManager instrumentTokens={instrumentTokens} />}
      
      <WatchlistComponent />
    </div>
  );
};

export default WatchlistPage;
