
import { TradeAlert } from '@/types/alert';
import { BASE_URL, getAuthHeaders } from './apiUtils';

const notificationService = {
  // Returns an EventSource for SSE connection
  getTradeAlertsStream: (): EventSource => {
    const token = localStorage.getItem('token');
    const url = new URL(`${BASE_URL}/api/notifications/stream`);
    
    // Add token as a query parameter for EventSource (can't set headers directly)
    if (token) {
      url.searchParams.append('token', token);
    }
    
    return new EventSource(url.toString());
  }
};

export default notificationService;
