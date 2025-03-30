
import React from 'react';
import WatchlistComponent from '@/components/dashboard/Watchlist';
import { Alert, AlertDescription } from '@/components/ui/alert';

const WatchlistPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Watchlists</h1>
      <p className="text-muted-foreground mb-4">
        Monitor your selected stocks and create custom watchlists
      </p>
      <div className="grid grid-cols-1">
        <WatchlistComponent />
      </div>
    </div>
  );
};

export default WatchlistPage;
