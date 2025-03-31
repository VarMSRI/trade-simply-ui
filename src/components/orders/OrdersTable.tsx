
import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Alert, AlertCircle, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Order, OrderStatus } from '@/types/order';
import OrderDetails from './OrderDetails';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  error: any;
  pagination: {
    totalPages: number;
    totalElements: number;
    currentPage: number;
    pageSize: number;
  } | undefined;
  onPageChange: (page: number) => void;
  page: number;
  onCancelOrder: (orderId: string) => void;
  isCancellingOrder: boolean;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  isLoading,
  error,
  pagination,
  onPageChange,
  page,
  onCancelOrder,
  isCancellingOrder,
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  const getOrderStatusBadge = (status: string) => {
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
  
  const handleCancelOrder = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to cancel this order?')) {
      onCancelOrder(orderId);
    }
  };
  
  const renderPagination = () => {
    if (!pagination) return null;
    
    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {orders.length} of {pagination.totalElements} results
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pagination.totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load orders. Please try again.</AlertDescription>
      </Alert>
    );
  }
  
  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Instrument</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <TableRow 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              >
                <TableCell className="font-medium">{order.instrumentToken}</TableCell>
                <TableCell>
                  <Badge variant="outline">{order.orderType}</Badge>
                </TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>
                  {order.price ? `₹${order.price.toFixed(2)}` : 'Market'}
                </TableCell>
                <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                <TableCell title={format(new Date(order.createdAt), 'PPp')}>
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  {order.status === 'PENDING' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => handleCancelOrder(order.id, e)}
                      disabled={isCancellingOrder}
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
              {expandedOrderId === order.id && (
                <TableRow>
                  <TableCell colSpan={7} className="p-4 bg-muted/30">
                    <OrderDetails order={order} />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      {renderPagination()}
    </div>
  );
};

export default OrdersTable;
