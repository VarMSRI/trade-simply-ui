
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
    
    // Add the X-Internal-Request header as a query parameter
    // (since EventSource doesn't allow setting custom headers directly)
    url.searchParams.append('X-Internal-Request', 'true');
    
    return new EventSource(url.toString());
  }
};

export default notificationService;
