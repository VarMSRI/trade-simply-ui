
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { OrderRequest, OrderType } from '@/types/order';
import { useOrders } from '@/hooks/useOrders';
import { Loader2 } from 'lucide-react';

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
  const { toast } = useToast();
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

  const validateOrder = (isBuy: boolean): boolean => {
    if (!instrumentToken) {
      toast({
        title: "Order Error",
        description: "Please select an instrument first.",
        variant: "destructive",
      });
      return false;
    }

    if (parseInt(quantity) <= 0) {
      toast({
        title: "Order Error", 
        description: "Quantity must be greater than zero.",
        variant: "destructive",
      });
      return false;
    }

    if (orderType !== "MARKET" && parseFloat(limitPrice) <= 0) {
      toast({
        title: "Order Error",
        description: "Price must be greater than zero.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };
  
  const prepareOrderRequest = (isBuy: boolean): OrderRequest => {
    const baseRequest: OrderRequest = {
      instrumentToken: instrumentToken as number,
      orderType: orderType,
      quantity: parseInt(quantity),
    };
    
    // If it's a LIMIT order, add price
    if (orderType !== "MARKET") {
      baseRequest.price = parseFloat(limitPrice);
    }
    
    // Add stop loss if specified
    if (stopLossPrice && parseFloat(stopLossPrice) > 0) {
      baseRequest.stoplossTriggerPrice = parseFloat(stopLossPrice);
      baseRequest.stoplossQuantity = parseInt(quantity);
    }
    
    // Add target if specified
    if (targetPrice && parseFloat(targetPrice) > 0) {
      baseRequest.targetTriggerPrice = parseFloat(targetPrice);
      baseRequest.targetQuantity = parseInt(quantity);
    }
    
    // If it's a sell order, adjust the order type accordingly
    if (!isBuy) {
      // Use SHORT_SELL for selling
      baseRequest.orderType = "SHORT_SELL";
    }
    
    return baseRequest;
  };

  const handleSubmit = (e: React.FormEvent, isBuy: boolean) => {
    e.preventDefault();
    
    if (!validateOrder(isBuy)) {
      return;
    }
    
    const orderRequest = prepareOrderRequest(isBuy);
    createOrder(orderRequest);
  };

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
            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input 
                  type="number" 
                  min="1"
                  step="1"
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  required 
                  disabled={isCreatingOrder}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Order Type</label>
                <Select 
                  value={orderType} 
                  onValueChange={(value) => setOrderType(value as OrderType)}
                  disabled={isCreatingOrder}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKET">Market</SelectItem>
                    <SelectItem value="LIMIT">Limit</SelectItem>
                    <SelectItem value="GTT">GTT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {orderType !== 'MARKET' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    required 
                    disabled={isCreatingOrder}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Stop Loss (Optional)</label>
                <Input
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  placeholder="Stop loss price"
                  disabled={isCreatingOrder}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Price (Optional)</label>
                <Input
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Target price"
                  disabled={isCreatingOrder}
                />
              </div>

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Estimated Cost: ₹{estimatedCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isCreatingOrder || !instrumentToken}
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Buy ${displaySymbol}`
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="sell">
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input 
                  type="number" 
                  min="1"
                  step="1"
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  required 
                  disabled={isCreatingOrder}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Order Type</label>
                <Select 
                  value={orderType} 
                  onValueChange={(value) => setOrderType(value as OrderType)}
                  disabled={isCreatingOrder}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKET">Market</SelectItem>
                    <SelectItem value="LIMIT">Limit</SelectItem>
                    <SelectItem value="GTT">GTT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {orderType !== 'MARKET' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    required 
                    disabled={isCreatingOrder}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Stop Loss (Optional)</label>
                <Input
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  placeholder="Stop loss price"
                  disabled={isCreatingOrder}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Price (Optional)</label>
                <Input
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Target price"
                  disabled={isCreatingOrder}
                />
              </div>

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Estimated Value: ₹{estimatedCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <Button 
                  type="submit" 
                  variant="destructive" 
                  className="w-full"
                  disabled={isCreatingOrder || !instrumentToken}
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Sell ${displaySymbol}`
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OrderForm;
