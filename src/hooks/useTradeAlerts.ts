
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
  const allEventsRef = useRef<{type: string, data: string, timestamp: string}[]>([]);

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
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Received general SSE message:`, event.data);
            
            // Log event to history
            allEventsRef.current.push({
              type: 'message', 
              data: event.data,
              timestamp
            });
            
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
        
        // Set up global event listener to capture ALL incoming events
        eventSource.addEventListener('message', (event: MessageEvent) => {
          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] Generic 'message' event received:`, event.data);
          
          // Add to event history
          allEventsRef.current.push({
            type: 'message', 
            data: event.data,
            timestamp
          });
        });
        
        // Listen specifically for alert events
        eventSource.addEventListener('alert', (event: MessageEvent) => {
          try {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Received specific 'alert' event:`, event.data);
            
            // Add to event history
            allEventsRef.current.push({
              type: 'alert', 
              data: event.data,
              timestamp
            });
            
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
          console.log(`[${now}] Heartbeat received:`, event.data);
          
          // Add to event history
          allEventsRef.current.push({
            type: 'heartbeat', 
            data: event.data,
            timestamp: now
          });
          setIsConnected(true);
          setLastHeartbeat(now);
        });
        
        // Set up listeners for any other event types
        ['update', 'notification', 'trade', 'market', 'system'].forEach(eventType => {
          eventSource.addEventListener(eventType, (event: MessageEvent) => {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Received '${eventType}' event:`, event.data);
            
            // Add to event history
            allEventsRef.current.push({
              type: eventType, 
              data: event.data,
              timestamp
            });
            
            try {
              // Attempt to parse and handle as an alert if it has the right structure
              const data = JSON.parse(event.data);
              if (data.security || data.security_code) {
                console.log(`Treating '${eventType}' event as an alert:`, data);
                
                // Make sure we have a consistent security field
                if (data.security_code && !data.security) {
                  data.security = data.security_code;
                }
                
                setAlerts(prevAlerts => {
                  const securityValue = data.security || data.security_code || '';
                  const exists = prevAlerts.some(a => 
                    (a.security === securityValue) || 
                    (a.security_code && a.security_code === securityValue)
                  );
                  
                  if (exists) {
                    return prevAlerts.map(alert => {
                      const alertSecurity = alert.security || alert.security_code || '';
                      const newSecurity = data.security || data.security_code || '';
                      
                      return alertSecurity === newSecurity ? data : alert;
                    });
                  } else {
                    toast.info(`New trade alert from '${eventType}' event for ${securityValue}`);
                    return [data, ...prevAlerts];
                  }
                });
              }
            } catch (err) {
              console.log(`Event '${eventType}' is not in JSON format or doesn't contain alert data`);
            }
          });
        });
        
        // Handle connection errors
        eventSource.onerror = (err) => {
          console.error('SSE connection error:', err);
          setIsConnected(false);
          setIsConnecting(false);
          
          // Check if it's a CORS error
          if ((err as any)?.message?.includes('CORS') || 
              (err as any)?.target?.status === 0 ||
              (err as ErrorEvent)?.message?.includes('CORS')) {
            setError('CORS error: Unable to connect due to cross-origin restrictions. This is likely a server configuration issue.');
            toast.error('Connection blocked by CORS policy');
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
          
          // Attempt to reconnect after a delay (longer delay for CORS errors)
          const delay = (err as any)?.message?.includes('CORS') ? 10000 : 5000;
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connectToSSE();
          }, delay);
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
    
    // Create a periodic logger to show all captured events
    const logInterval = window.setInterval(() => {
      if (allEventsRef.current.length > 0) {
        console.log('---- EVENT HISTORY LOG ----');
        console.log('Total events captured:', allEventsRef.current.length);
        console.log('Last 10 events:', allEventsRef.current.slice(-10));
        console.log('Event type counts:', 
          allEventsRef.current.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        );
      }
    }, 30000); // Log every 30 seconds
    
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
      
      if (logInterval) {
        window.clearInterval(logInterval);
      }
    };
  }, []);
  
  // Expose a function to get event history for debugging
  const getEventHistory = () => {
    console.log('All SSE events received:', allEventsRef.current);
    return allEventsRef.current;
  };
  
  return {
    alerts,
    isConnecting,
    isConnected,
    error,
    lastHeartbeat,
    getEventHistory
  };
};
