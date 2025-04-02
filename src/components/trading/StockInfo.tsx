
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StockInfoProps {
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

const StockInfo: React.FC<StockInfoProps> = ({
  symbol,
  name,
  price,
  change,
  changePercent,
  volume,
  marketCap,
  pe,
  dividend
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Price</div>
            <div className="font-medium">₹{price.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Change</div>
            <div className={change >= 0 ? "text-green-600" : "text-red-600"}>
              {change >= 0 ? "+" : ""}{change.toFixed(2)} ({change >= 0 ? "+" : ""}{changePercent.toFixed(2)}%)
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Volume</div>
            <div className="font-medium">{volume.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Market Cap</div>
            <div className="font-medium">₹{(marketCap / 10000000000).toFixed(2)}Cr</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">P/E Ratio</div>
            <div className="font-medium">{pe.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Dividend Yield</div>
            <div className="font-medium">{dividend.toFixed(2)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockInfo;
