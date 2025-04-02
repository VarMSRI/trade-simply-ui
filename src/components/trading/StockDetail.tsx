
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import StockChart from '@/components/dashboard/StockChart';
import BuyOrderForm from './BuyOrderForm';
import SellOrderForm from './SellOrderForm';
import StockInfo from './StockInfo';
import { useMarketData } from '@/hooks/useMarketData';

interface StockDetailProps {
  selectedAsset: {
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
  };
}

const StockDetail: React.FC<StockDetailProps> = ({ selectedAsset }) => {
  const [activeTab, setActiveTab] = useState('info');
  
  // Use WebSocket for live price updates
  const { data: marketData } = useMarketData(selectedAsset.instrumentToken);
  
  // Merge WebSocket data with selectedAsset
  const assetWithLiveData = {
    ...selectedAsset,
    price: marketData?.lastPrice || selectedAsset.price,
    change: marketData?.change || selectedAsset.change,
    changePercent: marketData?.changePercent || selectedAsset.changePercent,
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StockInfo 
          symbol={selectedAsset.symbol}
          name={selectedAsset.name}
          price={assetWithLiveData.price}
          change={assetWithLiveData.change}
          changePercent={assetWithLiveData.changePercent}
          volume={selectedAsset.volume}
          marketCap={selectedAsset.marketCap}
          pe={selectedAsset.pe}
          dividend={selectedAsset.dividend}
        />
        
        <StockChart 
          symbol={selectedAsset.symbol}
          name={selectedAsset.name}
        />
      </div>
      
      <Card className="col-span-1">
        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Overview</TabsTrigger>
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          <CardContent className="pt-4">
            <TabsContent value="info" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">About {selectedAsset.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Company description would be displayed here, fetched from an API.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium">Market Cap</p>
                    <p className="text-sm text-muted-foreground">₹{selectedAsset.marketCap.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">P/E Ratio</p>
                    <p className="text-sm text-muted-foreground">{selectedAsset.pe}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Volume</p>
                    <p className="text-sm text-muted-foreground">{selectedAsset.volume.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dividend Yield</p>
                    <p className="text-sm text-muted-foreground">{selectedAsset.dividend}%</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="buy">
              <BuyOrderForm 
                symbol={selectedAsset.symbol}
                instrumentToken={selectedAsset.instrumentToken}
                quantity="1"
                setQuantity={() => {}}
                orderType="MARKET"
                setOrderType={() => {}}
                limitPrice={assetWithLiveData.price.toFixed(2)}
                setLimitPrice={() => {}}
                stopLossPrice=""
                setStopLossPrice={() => {}}
                targetPrice=""
                setTargetPrice={() => {}}
                estimatedCost={assetWithLiveData.price}
                isCreatingOrder={false}
                createOrder={() => {}}
                name={selectedAsset.name}
              />
            </TabsContent>
            
            <TabsContent value="sell">
              <SellOrderForm 
                symbol={selectedAsset.symbol}
                instrumentToken={selectedAsset.instrumentToken}
                quantity="1"
                setQuantity={() => {}}
                orderType="MARKET"
                setOrderType={() => {}}
                limitPrice={assetWithLiveData.price.toFixed(2)}
                setLimitPrice={() => {}}
                stopLossPrice=""
                setStopLossPrice={() => {}}
                targetPrice=""
                setTargetPrice={() => {}}
                estimatedCost={assetWithLiveData.price}
                isCreatingOrder={false}
                createOrder={() => {}}
                name={selectedAsset.name}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default StockDetail;
