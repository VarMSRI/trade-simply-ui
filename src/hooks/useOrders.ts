
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import orderService from '@/services/orderService';
import { Order, OrderRequest, OrdersFilter } from '@/types/order';

export const useOrders = (filters?: OrdersFilter) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Generate a unique query key based on filters
  const queryKey = ['orders'];
  if (filters) {
    if (filters.status) queryKey.push(filters.status);
    if (filters.startDate) queryKey.push(filters.startDate);
    if (filters.endDate) queryKey.push(filters.endDate);
    if (filters.page !== undefined) queryKey.push(`page-${filters.page}`);
    if (filters.size !== undefined) queryKey.push(`size-${filters.size}`);
  }
  
  // Fetch orders
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey,
    queryFn: () => orderService.getOrders(filters),
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Create order
  const { mutate: createOrder, isPending: isCreatingOrder } = useMutation({
    mutationFn: (orderRequest: OrderRequest) => orderService.createOrder(orderRequest),
    onSuccess: () => {
      toast({
        title: 'Order Placed',
        description: 'Your order was successfully placed.',
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast({
        title: 'Order Failed',
        description: 'Failed to place your order. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Cancel order
  const { mutate: cancelOrder, isPending: isCancellingOrder } = useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: () => {
      toast({
        title: 'Order Cancelled',
        description: 'Your order was successfully cancelled.',
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Cancellation Failed',
        description: 'Failed to cancel your order. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  const getOrderById = useCallback(
    async (orderId: string): Promise<Order> => {
      try {
        return await orderService.getOrder(orderId);
      } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
      }
    },
    []
  );

  return {
    orders: ordersData?.content || [],
    pagination: ordersData ? {
      totalPages: ordersData.totalPages,
      totalElements: ordersData.totalElements,
      currentPage: ordersData.number,
      pageSize: ordersData.size,
    } : undefined,
    isLoading: isLoadingOrders,
    error: ordersError,
    createOrder,
    isCreatingOrder,
    cancelOrder,
    isCancellingOrder,
    getOrderById,
    refetchOrders,
  };
};
