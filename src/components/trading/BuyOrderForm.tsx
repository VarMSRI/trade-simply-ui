
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrderFormInputs from './OrderFormInputs';
import { OrderType } from '@/types/order';
import { useToast } from '@/hooks/use-toast';
import { validateOrder, prepareOrderRequest } from './orderUtils';

interface BuyOrderFormProps {
  instrumentToken?: number;
  symbol: string;
  quantity: string;
  setQuantity: (value: string) => void;
  orderType: OrderType;
  setOrderType: (value: OrderType) => void;
  limitPrice: string;
  setLimitPrice: (value: string) => void;
  stopLossPrice: string;
  setStopLossPrice: (value: string) => void;
  targetPrice: string;
  setTargetPrice: (value: string) => void;
  estimatedCost: number;
  isCreatingOrder: boolean;
  createOrder: (orderRequest: any) => void;
}

const BuyOrderForm: React.FC<BuyOrderFormProps> = ({
  instrumentToken,
  symbol,
  quantity,
  setQuantity,
  orderType,
  setOrderType,
  limitPrice,
  setLimitPrice,
  stopLossPrice,
  setStopLossPrice,
  targetPrice,
  setTargetPrice,
  estimatedCost,
  isCreatingOrder,
  createOrder,
}) => {
  const { toast } = useToast();
  const displaySymbol = symbol || "Select an instrument";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOrder(instrumentToken, quantity, orderType, limitPrice, toast)) {
      return;
    }
    
    const orderRequest = prepareOrderRequest(
      instrumentToken as number,
      orderType,
      quantity,
      limitPrice,
      stopLossPrice,
      targetPrice,
      true // isBuy = true
    );
    
    createOrder(orderRequest);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <OrderFormInputs
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
        isCreatingOrder={isCreatingOrder}
      />

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
  );
};

export default BuyOrderForm;
