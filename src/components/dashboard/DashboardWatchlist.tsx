
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { WatchlistType } from '@/types/watchlist';

const DashboardWatchlist: React.FC = () => {
  const [firstWatchlist, setFirstWatchlist] = useState<WatchlistType | null>(null);
  
  // Fetch all watchlists but only use the first one
  const { data: watchlists = [], isLoading } = useQuery({
    queryKey: ['watchlists'],
    queryFn: api.watchlist.getAll,
    onError: (error) => {
      console.error('Error loading watchlists:', error);
    }
  });

  // Effect to set the first watchlist when data loads
  useEffect(() => {
    if (watchlists.length > 0) {
      setFirstWatchlist(watchlists[0]);
    }
  }, [watchlists]);

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Watchlist
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/watchlist">Manage Watchlists</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : firstWatchlist ? (
          firstWatchlist.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {firstWatchlist.items.slice(0, 5).map((item) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No symbols in this watchlist</p>
              <Button 
                variant="link" 
                asChild
                className="mt-2"
              >
                <Link to="/watchlist">Add symbols</Link>
              </Button>
            </div>
          )
        ) : watchlists.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No watchlists found</p>
            <Button 
              variant="link"
              asChild
              className="mt-2"
            >
              <Link to="/watchlist">Create your first watchlist</Link>
            </Button>
          </div>
        ) : (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardWatchlist;
