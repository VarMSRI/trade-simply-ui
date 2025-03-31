
import React from 'react';
import { format } from 'date-fns';
import { Order } from '@/types/order';

interface OrderDetailsProps {
  order: Order;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div>
        <h4 className="font-semibold mb-2">Order Information</h4>
        <div className="grid grid-cols-2 gap-2">
          <span className="text-muted-foreground">Order ID:</span>
          <span>{order.id}</span>
          <span className="text-muted-foreground">Created At:</span>
          <span>{format(new Date(order.createdAt), 'PPp')}</span>
          <span className="text-muted-foreground">Updated At:</span>
          <span>{format(new Date(order.updatedAt), 'PPp')}</span>
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Price Information</h4>
        <div className="grid grid-cols-2 gap-2">
          <span className="text-muted-foreground">Price:</span>
          <span>₹{order.price?.toFixed(2) || 'N/A'}</span>
          {order.stoplossTriggerPrice && (
            <>
              <span className="text-muted-foreground">Stop Loss Trigger:</span>
              <span>₹{order.stoplossTriggerPrice.toFixed(2)}</span>
            </>
          )}
          {order.stoplossLimitPrice && (
            <>
              <span className="text-muted-foreground">Stop Loss Limit:</span>
              <span>₹{order.stoplossLimitPrice.toFixed(2)}</span>
            </>
          )}
          {order.targetTriggerPrice && (
            <>
              <span className="text-muted-foreground">Target Trigger:</span>
              <span>₹{order.targetTriggerPrice.toFixed(2)}</span>
            </>
          )}
          {order.targetLimitPrice && (
            <>
              <span className="text-muted-foreground">Target Limit:</span>
              <span>₹{order.targetLimitPrice.toFixed(2)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
