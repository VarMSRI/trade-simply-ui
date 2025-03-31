
import { BASE_URL, getAuthHeaders, handleResponse } from './apiUtils';
import { Order, OrderRequest, OrdersFilter, PageableResponse } from '@/types/order';

const createOrder = async (orderRequest: OrderRequest): Promise<Order> => {
  try {
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderRequest),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

const getOrder = async (orderId: string): Promise<Order> => {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

const cancelOrder = async (orderId: string): Promise<Order> => {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error);
    throw error;
  }
};

const getOrders = async (filters?: OrdersFilter): Promise<PageableResponse<Order>> => {
  try {
    let url = `${BASE_URL}/api/orders`;
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page !== undefined) params.append('page', filters.page.toString());
      if (filters.size !== undefined) params.append('size', filters.size.toString());
    }
    
    const queryString = params.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

const orderService = {
  createOrder,
  getOrder,
  cancelOrder,
  getOrders,
};

export default orderService;
