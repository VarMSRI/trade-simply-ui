
import { useState, useEffect, useRef } from 'react';
import { TradeAlert } from '@/types/alert';
import notificationService from '@/services/notificationService';
import { toast } from 'sonner';

export const useTradeAlerts = () => {
  const [alerts, setAlerts] = useState<TradeAlert[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const connectToSSE = () => {
      try {
        console.log('Attempting to connect to trade alerts SSE stream');
        setIsConnecting(true);
        
        // Clean up any existing connection
        if (eventSourceRef.current) {
          console.log('Closing existing SSE connection');
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        
        // Create a new connection
        const eventSource = notificationService.getTradeAlertsStream();
        eventSourceRef.current = eventSource;
        
        // Handle connection open
        eventSource.onopen = () => {
          console.log('SSE connection established successfully');
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
        };
        
        // Listen for all event types
        eventSource.onmessage = (event: MessageEvent) => {
          try {
            console.log('Received general SSE message:', event.data);
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
        };
        
        // Listen specifically for alert events
        eventSource.addEventListener('alert', (event: MessageEvent) => {
          try {
            console.log('Received specific alert event:', event.data);
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
          const now = new Date().toISOString();
          setLastHeartbeat(now);
          console.log('Heartbeat received:', event.data, now);
        });
        
        // Handle connection errors
        eventSource.onerror = (err) => {
          console.error('SSE connection error:', err);
          setIsConnected(false);
          setIsConnecting(false);
          
          // Check if it's a CORS error
          if ((err as any)?.message?.includes('CORS') || 
              (err as any)?.target?.status === 0) {
            setError('CORS error: The server is not allowing cross-origin requests. Please check server configuration.');
          } else {
            setError('Connection to alerts feed lost. Reconnecting...');
          }
          
          // Close the current connection
          eventSource.close();
          eventSourceRef.current = null;
          
          // Clear any existing reconnect timeout
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }
          
          // Attempt to reconnect after a delay
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connectToSSE();
          }, 5000);
        };
      } catch (err) {
        console.error('SSE connection setup error:', err);
        setIsConnected(false);
        setIsConnecting(false);
        setError(`Failed to connect to alerts feed: ${(err as Error).message}`);
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
        }
        
        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectToSSE();
        }, 5000);
      }
    };
    
    connectToSSE();
    
    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        console.log('Closing SSE connection on unmount');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);
  
  return {
    alerts,
    isConnecting,
    isConnected,
    error,
    lastHeartbeat
  };
};
