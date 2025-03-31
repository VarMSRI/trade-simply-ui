
import watchlistService from './watchlistService';
import orderService from './orderService';
import { getAuthHeaders } from './apiUtils';

const api = {
  getAuthHeaders,
  watchlist: watchlistService,
  orders: orderService,
  
  // Other services can be imported and added here as needed
};

export default api;
