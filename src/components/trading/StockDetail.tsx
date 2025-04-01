
import React from 'react';
import StockChart from '@/components/dashboard/StockChart';
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
  if (!selectedAsset) return null;
  
  return (
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
  );
};

export default StockDetail;
