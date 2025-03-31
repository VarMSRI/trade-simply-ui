
import { OrderRequest, OrderType } from '@/types/order';
import { useToast } from '@/hooks/use-toast';

export const validateOrder = (
  instrumentToken: number | undefined,
  quantity: string,
  orderType: OrderType,
  limitPrice: string,
  toast: ReturnType<typeof useToast>['toast']
): boolean => {
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

export const prepareOrderRequest = (
  instrumentToken: number,
  orderType: OrderType,
  quantity: string,
  limitPrice: string,
  stopLossPrice: string,
  targetPrice: string,
  isBuy: boolean
): OrderRequest => {
  const baseRequest: OrderRequest = {
    instrumentToken: instrumentToken,
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
