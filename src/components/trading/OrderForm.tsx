
import React, { useState } from 'react';
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

interface OrderFormProps {
  symbol?: string;
  currentPrice?: number;
}

const OrderForm: React.FC<OrderFormProps> = ({ 
  symbol = "AAPL", 
  currentPrice = 179.50 
}) => {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState<string>("1");
  const [orderType, setOrderType] = useState<string>("market");
  const [limitPrice, setLimitPrice] = useState<string>(currentPrice.toFixed(2));
  
  const handleSubmitBuy = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Order Submitted",
      description: `Buy order for ${quantity} shares of ${symbol} at ${orderType === 'market' ? 'market price' : `$${limitPrice}`}`,
    });
  };

  const handleSubmitSell = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Order Submitted",
      description: `Sell order for ${quantity} shares of ${symbol} at ${orderType === 'market' ? 'market price' : `$${limitPrice}`}`,
    });
  };

  const estimatedCost = Number(quantity) * currentPrice;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Place Order: {symbol}</CardTitle>
        <div className="text-sm text-muted-foreground">Current Price: ${currentPrice.toFixed(2)}</div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>

          <TabsContent value="buy">
            <form onSubmit={handleSubmitBuy} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input 
                  type="number" 
                  min="1"
                  step="1"
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Order Type</label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                    <SelectItem value="stop">Stop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {orderType !== 'market' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    required 
                  />
                </div>
              )}

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Estimated Cost: ${estimatedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <Button type="submit" className="w-full bg-profit hover:bg-profit/90">Buy {symbol}</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="sell">
            <form onSubmit={handleSubmitSell} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input 
                  type="number" 
                  min="1"
                  step="1"
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Order Type</label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                    <SelectItem value="stop">Stop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {orderType !== 'market' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    required 
                  />
                </div>
              )}

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Estimated Value: ${estimatedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <Button type="submit" variant="destructive" className="w-full">Sell {symbol}</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OrderForm;
