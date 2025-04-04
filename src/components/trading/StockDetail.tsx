
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import OrderForm from '@/components/trading/OrderForm';

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

interface StockDetailProps {
  selectedAsset: AssetInfo;
}

const StockDetail: React.FC<StockDetailProps> = ({ selectedAsset }) => {
  if (!selectedAsset) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No instrument selected. Please search and select an instrument above.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardContent className="pt-6">
          <OrderForm 
            symbol={selectedAsset.symbol} 
            currentPrice={selectedAsset.price}
            instrumentToken={selectedAsset.instrumentToken}
            name={selectedAsset.name}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StockDetail;
