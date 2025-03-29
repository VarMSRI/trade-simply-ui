
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

interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  totalChange: number;
  totalChangePercent: number;
}

const PortfolioHoldings: React.FC = () => {
  // This would come from your API in a real application
  const holdings: Holding[] = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 100,
      avgPrice: 150.25,
      currentPrice: 179.50,
      totalValue: 17950.00,
      dayChange: 3.25,
      dayChangePercent: 1.84,
      totalChange: 29.25,
      totalChangePercent: 19.47,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      shares: 50,
      avgPrice: 280.50,
      currentPrice: 318.75,
      totalValue: 15937.50,
      dayChange: -1.75,
      dayChangePercent: -0.55,
      totalChange: 38.25,
      totalChangePercent: 13.64,
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: 30,
      avgPrice: 120.75,
      currentPrice: 142.30,
      totalValue: 4269.00,
      dayChange: 2.45,
      dayChangePercent: 1.75,
      totalChange: 21.55,
      totalChangePercent: 17.85,
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      shares: 25,
      avgPrice: 135.50,
      currentPrice: 147.25,
      totalValue: 3681.25,
      dayChange: 0.75,
      dayChangePercent: 0.51,
      totalChange: 11.75,
      totalChangePercent: 8.67,
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      shares: 40,
      avgPrice: 450.25,
      currentPrice: 785.50,
      totalValue: 31420.00,
      dayChange: 15.75,
      dayChangePercent: 2.05,
      totalChange: 335.25,
      totalChangePercent: 74.46,
    },
  ];

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Portfolio Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Avg Price</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead className="text-right">Day Change</TableHead>
              <TableHead className="text-right">Total Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => (
              <TableRow key={holding.symbol} className="table-row-hover">
                <TableCell className="font-medium">{holding.symbol}</TableCell>
                <TableCell>{holding.name}</TableCell>
                <TableCell className="text-right">{holding.shares}</TableCell>
                <TableCell className="text-right">${holding.avgPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">${holding.currentPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">${holding.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right">
                  <span className={holding.dayChange >= 0 ? "profit-text" : "loss-text"}>
                    {holding.dayChange >= 0 ? "+" : ""}{holding.dayChange.toFixed(2)} ({holding.dayChange >= 0 ? "+" : ""}{holding.dayChangePercent.toFixed(2)}%)
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={holding.totalChange >= 0 ? "profit-text" : "loss-text"}>
                    {holding.totalChange >= 0 ? "+" : ""}{holding.totalChange.toFixed(2)} ({holding.totalChange >= 0 ? "+" : ""}{holding.totalChangePercent.toFixed(2)}%)
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

export default PortfolioHoldings;
