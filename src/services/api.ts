import watchlistService from './watchlistService';
import { getAuthHeaders } from './apiUtils';

const api = {
  getAuthHeaders,
  watchlist: watchlistService,
  
  // Other services can be imported and added here as needed
};

export default api;
