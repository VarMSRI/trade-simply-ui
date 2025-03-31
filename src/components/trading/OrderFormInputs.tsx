
import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderType } from '@/types/order';

interface OrderFormInputsProps {
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
  isCreatingOrder: boolean;
}

const OrderFormInputs: React.FC<OrderFormInputsProps> = ({
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
  isCreatingOrder,
}) => {
  return (
    <>
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
    </>
  );
};

export default OrderFormInputs;
