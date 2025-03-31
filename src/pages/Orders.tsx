
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
import ActiveFilters from '@/components/orders/ActiveFilters';
import FilterDialog from '@/components/orders/FilterDialog';

const Orders: React.FC = () => {
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
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
  
  const handleFilterReset = () => {
    setStatus(undefined);
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    // Here you would typically open a modal or navigate to a details page
    console.log("View details for order:", order);
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
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>
              View all your orders and their current status
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
