
import React from 'react';
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
import { Plus, Star } from 'lucide-react';

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const Watchlist: React.FC = () => {
  // This would come from your API in a real application
  const watchlistItems: WatchlistItem[] = [
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 242.50,
      change: 3.75,
      changePercent: 1.57,
    },
    {
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      price: 475.25,
      change: -2.30,
      changePercent: -0.48,
    },
    {
      symbol: 'JPM',
      name: 'JPMorgan Chase & Co.',
      price: 195.50,
      change: 1.25,
      changePercent: 0.64,
    },
    {
      symbol: 'DIS',
      name: 'The Walt Disney Co.',
      price: 112.75,
      change: -0.50,
      changePercent: -0.44,
    },
  ];

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Watchlist
        </CardTitle>
        <Button size="sm" className="h-8 gap-1">
          <Plus className="h-3.5 w-3.5" />
          Add Symbol
        </Button>
      </CardHeader>
      <CardContent>
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
            {watchlistItems.map((item) => (
              <TableRow key={item.symbol} className="table-row-hover cursor-pointer">
                <TableCell className="font-medium">{item.symbol}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <span className={item.change >= 0 ? "profit-text" : "loss-text"}>
                    {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)} ({item.change >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%)
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Watchlist;
