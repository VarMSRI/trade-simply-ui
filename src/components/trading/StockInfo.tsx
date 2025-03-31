
import React from 'react';
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
  instrumentToken: number;
}

interface StockInfoProps {
  selectedAsset: AssetInfo;
}

const StockInfo: React.FC<StockInfoProps> = ({ selectedAsset }) => {
  return (
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
  );
};

export default StockInfo;
