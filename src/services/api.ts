
import watchlistService from './watchlistService';
import orderService from './orderService';
import subscriptionService from './subscriptionService';
import websocketService from './websocketService';
import { getAuthHeaders } from './apiUtils';

const api = {
  getAuthHeaders,
  watchlist: watchlistService,
  orders: orderService,
  subscriptions: subscriptionService,
  websocket: websocketService,
  
  // Other services can be imported and added here as needed
};

export default api;
