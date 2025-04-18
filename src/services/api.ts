
import watchlistService from './watchlistService';
import orderService from './orderService';
import subscriptionService from './subscriptionService';
import notificationService from './notificationService';
import { getAuthHeaders } from './apiUtils';

const api = {
  getAuthHeaders,
  watchlist: watchlistService,
  orders: orderService,
  subscriptions: subscriptionService,
  notifications: notificationService,
  
  // Other services can be imported and added here as needed
};

export default api;
