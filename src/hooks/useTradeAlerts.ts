
import { useState, useEffect } from 'react';
import { TradeAlert } from '@/types/alert';
import notificationService from '@/services/notificationService';
import { toast } from 'sonner';

export const useTradeAlerts = () => {
  const [alerts, setAlerts] = useState<TradeAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    
    const connectToSSE = () => {
      try {
        eventSource = notificationService.getTradeAlertsStream();
        
        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
          console.log('SSE connection established');
        };
        
        eventSource.onmessage = (event) => {
          try {
            console.log('Received SSE message:', event.data);
            const alertData: TradeAlert = JSON.parse(event.data);
            setAlerts(prevAlerts => {
              // Check if alert already exists by security (assuming security is unique)
              const exists = prevAlerts.some(a => a.security === alertData.security);
              if (exists) {
                // Update existing alert
                return prevAlerts.map(alert => 
                  alert.security === alertData.security ? alertData : alert
                );
              } else {
                // Add new alert
                toast.info(`New trade alert for ${alertData.security}`);
                return [alertData, ...prevAlerts];
              }
            });
          } catch (err) {
            console.error('Failed to parse SSE message:', err);
          }
        };
        
        eventSource.onerror = (err) => {
          console.error('SSE connection error:', err);
          setIsConnected(false);
          setError('Connection to alerts feed lost. Reconnecting...');
          
          // Close the current connection
          eventSource?.close();
          
          // Attempt to reconnect after a delay
          setTimeout(connectToSSE, 5000);
        };
      } catch (err) {
        console.error('SSE connection setup error:', err);
        setError('Failed to connect to alerts feed');
      }
    };
    
    connectToSSE();
    
    // Cleanup function
    return () => {
      if (eventSource) {
        console.log('Closing SSE connection');
        eventSource.close();
      }
    };
  }, []);
  
  return {
    alerts,
    isConnected,
    error
  };
};
