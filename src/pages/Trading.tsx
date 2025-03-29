
import React, { useState } from 'react';
import StockChart from '@/components/dashboard/StockChart';
import OrderForm from '@/components/trading/OrderForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AssetInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  dividend: number;
}

const Trading: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<AssetInfo | null>(null);

  // Sample data - would come from your API in a real app
  const assetInfo: AssetInfo = {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    price: 2750.25,
    change: 32.75,
    changePercent: 1.20,
    volume: 3254600,
    marketCap: 18600000000000, // In INR
    pe: 24.6,
    dividend: 0.78,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would fetch data from your API
    setSelectedAsset(assetInfo);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Trading</h1>
        <p className="text-muted-foreground mt-1">
          Research stocks and place trades on NSE/BSE
        </p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSearch} className="flex w-full max-w-lg gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search for a stock symbol or company name..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        
        {selectedAsset && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StockChart 
                symbol={selectedAsset.symbol} 
                name={selectedAsset.name} 
              />
              <OrderForm 
                symbol={selectedAsset.symbol} 
                currentPrice={selectedAsset.price} 
              />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Stock Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Price</div>
                    <div className="font-medium">₹{selectedAsset.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Change</div>
                    <div className={selectedAsset.change >= 0 ? "profit-text" : "loss-text"}>
                      {selectedAsset.change >= 0 ? "+" : ""}{selectedAsset.change.toFixed(2)} ({selectedAsset.change >= 0 ? "+" : ""}{selectedAsset.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Volume</div>
                    <div className="font-medium">{selectedAsset.volume.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Market Cap</div>
                    <div className="font-medium">₹{(selectedAsset.marketCap / 10000000000).toFixed(2)}Cr</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">P/E Ratio</div>
                    <div className="font-medium">{selectedAsset.pe.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Dividend Yield</div>
                    <div className="font-medium">{selectedAsset.dividend.toFixed(2)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
};

export default Trading;
