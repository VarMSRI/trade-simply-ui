
import React, { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Order, OrderStatus } from '@/types/order';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import OrdersTable from '@/components/orders/OrdersTable';
import TodaysOrdersTable from '@/components/orders/TodaysOrdersTable';
import ActiveFilters from '@/components/orders/ActiveFilters';
import FilterDialog from '@/components/orders/FilterDialog';
import { useToast } from '@/hooks/use-toast';

const Orders: React.FC = () => {
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  
  const isMobile = useIsMobile();
  
  // Get today's orders - no filter
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  const { 
    orders: todaysOrders, 
    isLoading: isTodaysOrdersLoading, 
    error: todaysOrdersError,
    cancelOrder: cancelTodayOrder,
    isCancellingOrder: isCancellingTodayOrder
  } = useOrders({
    startDate: todayStart.toISOString(),
    endDate: todayEnd.toISOString()
  });
  
  // Get filtered orders based on user filters
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
  
  const handleFilterReset = () => {
    setStatus(undefined);
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    // Here you would typically open a modal or navigate to a details page
    toast({
      title: "Order Details",
      description: `Viewing details for order ${order.id.slice(0, 8)}...`,
    });
  };
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your orders
        </p>
      </div>
      
      {/* Today's Orders Section */}
      <div className="mb-8">
        <TodaysOrdersTable
          orders={todaysOrders}
          isLoading={isTodaysOrdersLoading}
          error={todaysOrdersError}
          onViewDetails={handleViewDetails}
          onCancelOrder={cancelTodayOrder}
          isCancellingOrder={isCancellingTodayOrder}
        />
      </div>
      
      {/* All Orders Section with Filters */}
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <ActiveFilters 
            status={status}
            startDate={startDate}
            endDate={endDate}
            onClearStatus={() => setStatus(undefined)}
            onClearStartDate={() => setStartDate('')}
            onClearEndDate={() => setEndDate('')}
          />
          
          <FilterDialog
            isMobile={isMobile}
            status={status}
            startDate={startDate}
            endDate={endDate}
            onStatusChange={setStatus}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onReset={handleFilterReset}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
              View your order history with advanced filtering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersTable
              orders={orders}
              isLoading={isLoading}
              error={error}
              pagination={pagination}
              onPageChange={setPage}
              page={page}
              onViewDetails={handleViewDetails}
              onCancelOrder={cancelOrder}
              isCancellingOrder={isCancellingOrder}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Orders;
