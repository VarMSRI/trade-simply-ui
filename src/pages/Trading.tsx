
import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import StockChart from '@/components/dashboard/StockChart';
import OrderForm from '@/components/trading/OrderForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSearchInstruments } from '@/hooks/useSearchInstruments';
import { OrderType } from '@/types/order';
import { useOrders } from '@/hooks/useOrders';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

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
  instrumentToken: number;
}

const Trading: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<AssetInfo | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { orders, isLoading: isLoadingOrders, error: ordersError } = useOrders({
    startDate: today.toISOString(),
  });

  const { 
    results: searchResults, 
    isLoading: isSearching, 
    error: searchError 
  } = useSearchInstruments(debouncedSearch);

  const handleAssetSelect = (result: any) => {
    // In a real app, you would fetch additional data for the selected asset
    // For now, creating a sample asset with data from the search result
    setSelectedAsset({
      symbol: result.symbol,
      name: result.name,
      price: result.lastPrice || 500.25, // Default price if not available
      change: result.change || 5.75,
      changePercent: result.changePercent || 1.20,
      volume: result.volume || 325460,
      marketCap: result.marketCap || 18600000000000,
      pe: result.pe || 24.6,
      dividend: result.dividendYield || 0.78,
      instrumentToken: result.token
    });
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'EXECUTED':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Executed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOrderTypeBadge = (orderType: OrderType) => {
    switch (orderType) {
      case 'MARKET':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Market</Badge>;
      case 'LIMIT':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Limit</Badge>;
      case 'GTT':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800">GTT</Badge>;
      case 'SHORT_SELL':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Short</Badge>;
      case 'COVER':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Cover</Badge>;
      default:
        return <Badge variant="outline">{orderType}</Badge>;
    }
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
        <div className="relative flex w-full max-w-lg">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search for a stock symbol or company name..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isSearching && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Searching instruments...</p>
          </div>
        )}

        {searchError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to search instruments. Please try again.</AlertDescription>
          </Alert>
        )}

        {searchResults && searchResults.length > 0 && !selectedAsset && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Exchange</TableHead>
                    <TableHead>Last Price</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.slice(0, 10).map((result) => (
                    <TableRow key={result.token} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{result.symbol}</TableCell>
                      <TableCell>{result.name}</TableCell>
                      <TableCell>{result.exchange}</TableCell>
                      <TableCell>{result.lastPrice ? `₹${result.lastPrice.toFixed(2)}` : 'N/A'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleAssetSelect(result)}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        
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
                instrumentToken={selectedAsset.instrumentToken}
                name={selectedAsset.name}
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
                    <div className={selectedAsset.change >= 0 ? "text-green-600" : "text-red-600"}>
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

        <Card>
          <CardHeader>
            <CardTitle>Today's Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : ordersError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load orders. Please try again.</AlertDescription>
              </Alert>
            ) : orders.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No orders placed today.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instrument</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.instrumentToken}</TableCell>
                      <TableCell>{getOrderTypeBadge(order.orderType)}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>₹{order.price.toFixed(2)}</TableCell>
                      <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                      <TableCell>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Trading;
