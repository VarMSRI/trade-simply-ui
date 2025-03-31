
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Order, OrderType } from '@/types/order';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, isLoading, error }) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load orders. Please try again.</AlertDescription>
          </Alert>
        ) : orders.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No orders placed today.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instrument</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.instrumentToken}</TableCell>
                  <TableCell>{getOrderTypeBadge(order.orderType)}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>₹{order.price.toFixed(2)}</TableCell>
                  <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersTable;
