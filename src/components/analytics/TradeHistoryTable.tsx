
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
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Mock data for recent trades
// In a real app, this would come from the API
const mockRecentTrades = [
  {
    id: '1',
    date: '2025-04-28',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    type: 'BUY',
    quantity: 10,
    price: 2745.50,
    value: 27455.00,
    status: 'COMPLETED'
  },
  {
    id: '2',
    date: '2025-04-27',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    type: 'SELL',
    quantity: 5,
    price: 3642.25,
    value: 18211.25,
    status: 'COMPLETED'
  },
  {
    id: '3',
    date: '2025-04-26',
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    type: 'BUY',
    quantity: 15,
    price: 1482.75,
    value: 22241.25,
    status: 'COMPLETED'
  },
  {
    id: '4',
    date: '2025-04-25',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    type: 'BUY',
    quantity: 8,
    price: 1595.80,
    value: 12766.40,
    status: 'COMPLETED'
  },
  {
    id: '5',
    date: '2025-04-24',
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    type: 'SELL',
    quantity: 20,
    price: 852.30,
    value: 17046.00,
    status: 'COMPLETED'
  }
];

interface TradeHistoryTableProps {
  isLoading?: boolean;
  limit?: number;
}

const TradeHistoryTable: React.FC<TradeHistoryTableProps> = ({ 
  isLoading = false,
  limit = 5
}) => {
  const tradeData = mockRecentTrades.slice(0, limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Trade History</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trade History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tradeData.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell>{new Date(trade.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">
                  {trade.symbol}
                  <div className="text-xs text-muted-foreground">{trade.name}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                    {trade.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{trade.quantity}</TableCell>
                <TableCell className="text-right">₹{trade.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">₹{trade.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TradeHistoryTable;
