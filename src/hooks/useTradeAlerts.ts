
import { useState, useEffect, useRef } from 'react';
import { TradeAlert } from '@/types/alert';
import notificationService from '@/services/notificationService';
import { toast } from 'sonner';

export const useTradeAlerts = () => {
  const [alerts, setAlerts] = useState<TradeAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    
    const connectToSSE = () => {
      try {
        // Clean up any existing connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
        
        eventSource = notificationService.getTradeAlertsStream();
        eventSourceRef.current = eventSource;
        
        // Handle connection open
        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
          console.log('SSE connection established');
        };
        
        // Listen for all event types
        eventSource.addEventListener('message', (event: MessageEvent) => {
          try {
            console.log('Received SSE message:', event.data);
            const alertData: TradeAlert = JSON.parse(event.data);
            
            // Make sure we have a consistent security field
            if (alertData.security_code && !alertData.security) {
              alertData.security = alertData.security_code;
            }
            
            setAlerts(prevAlerts => {
              // Check if alert already exists by security
              const securityValue = alertData.security || alertData.security_code || '';
              const exists = prevAlerts.some(a => 
                (a.security === securityValue) || 
                (a.security_code && a.security_code === securityValue)
              );
              
              if (exists) {
                // Update existing alert
                return prevAlerts.map(alert => {
                  const alertSecurity = alert.security || alert.security_code || '';
                  const newSecurity = alertData.security || alertData.security_code || '';
                  
                  return alertSecurity === newSecurity ? alertData : alert;
                });
              } else {
                // Add new alert
                toast.info(`New trade alert for ${securityValue}`);
                return [alertData, ...prevAlerts];
              }
            });
          } catch (err) {
            console.error('Failed to parse SSE message:', err);
          }
        });
        
        // Listen specifically for alert events
        eventSource.addEventListener('alert', (event: MessageEvent) => {
          try {
            console.log('Received alert event:', event.data);
            const alertData: TradeAlert = JSON.parse(event.data);
            
            // Make sure we have a consistent security field
            if (alertData.security_code && !alertData.security) {
              alertData.security = alertData.security_code;
            }
            
            setAlerts(prevAlerts => {
              // Check if alert already exists by security
              const securityValue = alertData.security || alertData.security_code || '';
              const exists = prevAlerts.some(a => 
                (a.security === securityValue) || 
                (a.security_code && a.security_code === securityValue)
              );
              
              if (exists) {
                // Update existing alert
                return prevAlerts.map(alert => {
                  const alertSecurity = alert.security || alert.security_code || '';
                  const newSecurity = alertData.security || alertData.security_code || '';
                  
                  return alertSecurity === newSecurity ? alertData : alert;
                });
              } else {
                // Add new alert
                toast.info(`New trade alert for ${securityValue}`);
                return [alertData, ...prevAlerts];
              }
            });
          } catch (err) {
            console.error('Failed to parse alert event:', err);
          }
        });
        
        // Handle heartbeat events
        eventSource.addEventListener('heartbeat', (event: MessageEvent) => {
          setLastHeartbeat(new Date().toISOString());
          console.log('Heartbeat received:', event.data);
        });
        
        // Handle connection errors
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
        eventSourceRef.current = null;
      }
    };
  }, []);
  
  return {
    alerts,
    isConnected,
    error,
    lastHeartbeat
  };
};
