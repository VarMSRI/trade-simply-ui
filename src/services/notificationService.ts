
import { TradeAlert } from '@/types/alert';
import { BASE_URL, getAuthHeaders } from './apiUtils';

// Custom EventSource interface to avoid extending the built-in one
interface CustomEventSource {
  url: string;
  withCredentials: boolean;
  readyState: number;
  onopen: ((this: EventSource, ev: Event) => any) | null;
  onmessage: ((this: EventSource, ev: MessageEvent) => any) | null;
  onerror: ((this: EventSource, ev: Event) => any) | null;
  addEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListener, options?: boolean | EventListenerOptions): void;
  dispatchEvent(event: Event): boolean;
  close(): void;
  readonly CONNECTING: number;
  readonly OPEN: number;
  readonly CLOSED: number;
}

const notificationService = {
  // Returns an EventSource for SSE connection
  getTradeAlertsStream: (): EventSource => {
    const token = localStorage.getItem('token');
    const url = `${BASE_URL}/api/notifications/stream`;
    
    // Create headers for fetch
    const headers = {
      'Accept': 'text/event-stream',
      'Authorization': `Bearer ${token}`,
      'X-Internal-Request': 'true'
    };
    
    // Create an EventSource with headers using fetch + ReadableStream
    // Since native EventSource doesn't support custom headers
    return new EventSourcePolyfill(url, { 
      headers,
      withCredentials: true 
    }) as unknown as EventSource;
  }
};

// EventSource polyfill to support custom headers
class EventSourcePolyfill implements CustomEventSource {
  private options: any;
  private eventSource: EventSource | null = null;
  private listeners: { [key: string]: EventListener[] } = {
    open: [],
    message: [],
    error: [],
    close: [],
    heartbeat: []
  };
  
  readonly CLOSED: number = 2;
  readonly CONNECTING: number = 0;
  readonly OPEN: number = 1;
  
  url: string;
  withCredentials: boolean;
  private lastHeartbeat: number = 0;
  private heartbeatInterval: number | null = null;
  
  constructor(url: string, options: any) {
    this.url = url;
    this.options = options;
    this.withCredentials = !!options.withCredentials;
    this.init();
    
    // Monitor heartbeats to detect disconnections
    this.heartbeatInterval = window.setInterval(() => {
      const now = Date.now();
      // If no heartbeat for more than 40 seconds (server sends every 30 seconds)
      if (this.lastHeartbeat > 0 && now - this.lastHeartbeat > 40000) {
        console.warn('Heartbeat timeout detected, reconnecting...');
        this.reconnect();
      }
    }, 10000); // Check every 10 seconds
  }

  private async init() {
    try {
      // Use fetch API to make a request with custom headers
      const response = await fetch(this.url, {
        method: 'GET',
        headers: this.options.headers,
        credentials: this.options.withCredentials ? 'include' : 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Process the stream
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              this.dispatchEvent(new Event('close'));
              this.reconnect();
              break;
            }
            
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete events in buffer
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.trim() === '') continue;
              
              // Parse event
              const eventParts = line.split('\n');
              let eventType = 'message';
              let data = '';
              
              for (const part of eventParts) {
                if (part.startsWith('event:')) {
                  eventType = part.slice(6).trim();
                } else if (part.startsWith('data:')) {
                  data = part.slice(5).trim();
                }
              }
              
              // Handle heartbeat events
              if (eventType === 'heartbeat') {
                this.lastHeartbeat = Date.now();
                this.dispatchEvent(new MessageEvent('heartbeat', {
                  data: data
                }));
                continue;
              }
              
              // Dispatch event
              const messageEvent = new MessageEvent(eventType, {
                data: data,
                origin: window.location.origin
              });
              
              this.dispatchEvent(messageEvent);
            }
          }
        } catch (err) {
          console.error('Stream processing error:', err);
          this.dispatchEvent(new Event('error'));
          this.reconnect();
        }
      };

      // Start processing and dispatch open event
      processStream();
      this.dispatchEvent(new Event('open'));
      this.lastHeartbeat = Date.now(); // Initialize heartbeat time on connection
    } catch (err) {
      console.error('Connection error:', err);
      this.dispatchEvent(new Event('error'));
      this.reconnect();
    }
  }
  
  private reconnect() {
    console.log('Attempting to reconnect SSE...');
    
    // Close current connection if any
    try {
      // Clean up any existing resources
      // Give some time before reconnecting to avoid rapid reconnection attempts
      setTimeout(() => {
        this.init();
      }, 2000);
    } catch (e) {
      console.error('Error during reconnection:', e);
    }
  }

  addEventListener(type: string, listener: EventListener): void {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: EventListener): void {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(l => l !== listener);
  }

  dispatchEvent(event: Event): boolean {
    const listeners = this.listeners[event.type] || [];
    for (const listener of listeners) {
      if (typeof listener === 'function') {
        (listener as any)(event);
      } else if (typeof listener === 'object' && 'handleEvent' in listener) {
        (listener as any).handleEvent(event);
      }
    }
    return !event.defaultPrevented;
  }

  close(): void {
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    this.listeners = {
      open: [],
      message: [],
      error: [],
      close: [],
      heartbeat: []
    };
  }
  
  get readyState(): number {
    return this.lastHeartbeat > 0 ? this.OPEN : this.CONNECTING;
  }

  // Event handlers
  set onopen(handler: ((this: EventSource, ev: Event) => any) | null) {
    this.listeners.open = handler ? [handler as unknown as EventListener] : [];
  }
  
  set onmessage(handler: ((this: EventSource, ev: MessageEvent) => any) | null) {
    this.listeners.message = handler ? [handler as unknown as EventListener] : [];
  }
  
  set onerror(handler: ((this: EventSource, ev: Event) => any) | null) {
    this.listeners.error = handler ? [handler as unknown as EventListener] : [];
  }
}

export default notificationService;
