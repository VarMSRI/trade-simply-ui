
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order, OrderStatus, OrderType } from '@/types/order';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
  pagination?: {
    totalPages: number;
    totalElements: number;
    currentPage: number;
    pageSize: number;
  };
  onPageChange?: (page: number) => void;
  page?: number;
  onViewDetails?: (order: Order) => void;
  onCancelOrder?: (orderId: string) => void;
  isCancellingOrder?: boolean;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  isLoading,
  error,
  pagination,
  onPageChange,
  page,
  onViewDetails,
  onCancelOrder,
  isCancellingOrder,
}) => {
  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'EXECUTED':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Executed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getOrderTypeBadge = (orderType: OrderType) => {
    switch (orderType) {
      case 'MARKET':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Market</Badge>;
      case 'LIMIT':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Limit</Badge>;
      case 'GTT':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800">GTT</Badge>;
      case 'SHORT_SELL':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Short</Badge>;
      case 'COVER':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Cover</Badge>;
      default:
        return <Badge variant="outline">{orderType}</Badge>;
    }
  };
    
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to fetch orders. Please try again.</AlertDescription>
      </Alert>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-muted-foreground mb-2 text-lg">No orders found</div>
        <p className="text-muted-foreground max-w-md">
          You haven't placed any orders yet. When you place orders, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Instrument</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            {onViewDetails || onCancelOrder ? <TableHead>Actions</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
              <TableCell>{order.instrumentToken}</TableCell>
              <TableCell>{getOrderTypeBadge(order.orderType)}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>₹{order.price.toFixed(2)}</TableCell>
              <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
              <TableCell title={format(new Date(order.createdAt), 'PPpp')}>
                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
              </TableCell>
              {(onViewDetails || onCancelOrder) && (
                <TableCell>
                  <div className="flex gap-2">
                    {onViewDetails && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onViewDetails(order)}
                      >
                        View
                      </Button>
                    )}
                    {onCancelOrder && order.status === 'PENDING' && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => onCancelOrder(order.id)}
                        disabled={isCancellingOrder}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
