
import React, { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { OrderStatus } from '@/types/order';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Calendar, Filter, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';

const Orders: React.FC = () => {
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  const isMobile = useIsMobile();
  
  const { 
    orders, 
    pagination,
    isLoading, 
    error, 
    cancelOrder, 
    isCancellingOrder 
  } = useOrders({ 
    status, 
    startDate: startDate || undefined, 
    endDate: endDate || undefined,
    page,
    size: pageSize,
  });
  
  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrder(orderId);
    }
  };
  
  const handleFilterReset = () => {
    setStatus(undefined);
    setStartDate('');
    setEndDate('');
    setPage(0);
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
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };
  
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
  
  const renderOrderDetails = (order: any) => {
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
  
  const renderFilters = () => {
    return (
      <>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(value: any) => setStatus(value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="EXECUTED">Executed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <div className="flex">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <div className="flex">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <Button onClick={handleFilterReset} variant="outline" className="w-full mt-2">
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </>
    );
  };
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your orders
        </p>
      </div>
      
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            {status && (
              <Badge className="mr-2">
                Status: {status}
                <button 
                  className="ml-1 hover:text-primary" 
                  onClick={() => setStatus(undefined)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {startDate && (
              <Badge className="mr-2">
                From: {format(new Date(startDate), 'PP')}
                <button 
                  className="ml-1 hover:text-primary" 
                  onClick={() => setStartDate('')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {endDate && (
              <Badge className="mr-2">
                To: {format(new Date(endDate), 'PP')}
                <button 
                  className="ml-1 hover:text-primary" 
                  onClick={() => setEndDate('')}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Filter Orders</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  {renderFilters()}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filter Orders</DialogTitle>
                </DialogHeader>
                {renderFilters()}
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>
              View all your orders and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load orders. Please try again.</AlertDescription>
              </Alert>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelOrder(order.id);
                                }}
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
                              {renderOrderDetails(order)}
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
                {renderPagination()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Orders;
