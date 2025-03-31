
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderType } from '@/types/order';
import { useOrders } from '@/hooks/useOrders';
import BuyOrderForm from './BuyOrderForm';
import SellOrderForm from './SellOrderForm';

interface OrderFormProps {
  symbol?: string;
  instrumentToken?: number;
  currentPrice?: number;
  name?: string;
}

const OrderForm: React.FC<OrderFormProps> = ({ 
  symbol = "AAPL", 
  instrumentToken,
  currentPrice = 179.50,
  name
}) => {
  const { createOrder, isCreatingOrder } = useOrders();
  
  const [quantity, setQuantity] = useState<string>("1");
  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [limitPrice, setLimitPrice] = useState<string>(currentPrice.toFixed(2));
  const [stopLossPrice, setStopLossPrice] = useState<string>("");
  const [targetPrice, setTargetPrice] = useState<string>("");
  
  // Update limit price when current price changes
  useEffect(() => {
    setLimitPrice(currentPrice.toFixed(2));
  }, [currentPrice]);

  const estimatedCost = Number(quantity) * currentPrice;
  const displaySymbol = symbol || "Select an instrument";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {!symbol ? "Place Order" : `Place Order: ${symbol}`}
        </CardTitle>
        {symbol && (
          <div>
            {name && <div className="text-sm text-muted-foreground">{name}</div>}
            <div className="text-sm text-muted-foreground">Current Price: ₹{currentPrice.toFixed(2)}</div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>

          <TabsContent value="buy">
            <BuyOrderForm
              instrumentToken={instrumentToken}
              symbol={displaySymbol}
              quantity={quantity}
              setQuantity={setQuantity}
              orderType={orderType}
              setOrderType={setOrderType}
              limitPrice={limitPrice}
              setLimitPrice={setLimitPrice}
              stopLossPrice={stopLossPrice}
              setStopLossPrice={setStopLossPrice}
              targetPrice={targetPrice}
              setTargetPrice={setTargetPrice}
              estimatedCost={estimatedCost}
              isCreatingOrder={isCreatingOrder}
              createOrder={createOrder}
            />
          </TabsContent>

          <TabsContent value="sell">
            <SellOrderForm
              instrumentToken={instrumentToken}
              symbol={displaySymbol}
              quantity={quantity}
              setQuantity={setQuantity}
              orderType={orderType}
              setOrderType={setOrderType}
              limitPrice={limitPrice}
              setLimitPrice={setLimitPrice}
              stopLossPrice={stopLossPrice}
              setStopLossPrice={setStopLossPrice}
              targetPrice={targetPrice}
              setTargetPrice={setTargetPrice}
              estimatedCost={estimatedCost}
              isCreatingOrder={isCreatingOrder}
              createOrder={createOrder}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OrderForm;
