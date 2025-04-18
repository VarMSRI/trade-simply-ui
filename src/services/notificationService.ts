
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
    
    // Create headers for EventSource - Remove Cache-Control header to fix CORS issue
    const headers = {
      'Accept': 'text/event-stream',
      'Authorization': `Bearer ${token}`,
      'X-Internal-Request': 'true'
    };
    
    // Use our polyfill to support custom headers and better connection handling
    return new EventSourcePolyfill(url, { 
      headers,
      withCredentials: true,
      mode: 'cors' // Explicitly set CORS mode
    }) as unknown as EventSource;
  }
};

// EventSource polyfill to support custom headers
class EventSourcePolyfill implements CustomEventSource {
  private options: any;
  private abortController: AbortController | null = null;
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
  private _readyState: number = 0;
  private lastHeartbeat: number = 0;
  private heartbeatInterval: number | null = null;
  private processStreamPromise: Promise<void> | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 2000;
  
  constructor(url: string, options: any) {
    this.url = url;
    this.options = options || {};
    this.withCredentials = !!options.withCredentials;
    console.log('Creating new EventSourcePolyfill with URL:', url);
    console.log('Options:', JSON.stringify(this.options));
    
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
      this._readyState = this.CONNECTING;
      console.log('Connecting to SSE endpoint:', this.url);
      
      // Create abort controller for fetch
      this.abortController = new AbortController();
      
      // Add credentials option for CORS - Remove Cache-Control header that's causing CORS issues
      const fetchOptions: RequestInit = {
        method: 'GET',
        headers: this.options.headers,
        credentials: this.options.withCredentials ? 'include' : 'same-origin',
        signal: this.abortController.signal,
        mode: this.options.mode || 'cors',
      };
      
      console.log('Fetch options:', JSON.stringify(fetchOptions));
      
      // Use fetch API to make a request with custom headers
      const response = await fetch(this.url, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SSE connection failed with status:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      if (!response.body) {
        console.error('ReadableStream not supported');
        throw new Error('ReadableStream not supported');
      }

      console.log('SSE connection established, processing stream');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Process the stream
      this.processStreamPromise = this.processStream(reader, decoder, buffer);
      
      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
      
      // Dispatch open event
      this._readyState = this.OPEN;
      this.dispatchEvent(new Event('open'));
      this.lastHeartbeat = Date.now(); // Initialize heartbeat time on connection
      
    } catch (err: any) {
      console.error('Connection error:', err);
      this._readyState = this.CLOSED;
      
      // Check if it's a CORS error and create a more specific event for it
      if (err.message && (
        err.message.includes('CORS') || 
        err.message.includes('Network error') || 
        err.message.includes('Failed to fetch')
      )) {
        // Create a custom error event with CORS information
        const corsError = new ErrorEvent('error', {
          message: 'CORS error: The server is not allowing cross-origin requests with the specified headers',
          error: err
        });
        
        // Dispatch the custom error event
        this.dispatchEvent(corsError as unknown as Event);
      } else {
        // Dispatch regular error for other types of errors
        this.dispatchEvent(new Event('error'));
      }
      
      this.reconnect();
    }
  }
  
  private async processStream(reader: ReadableStreamDefaultReader<Uint8Array>, decoder: TextDecoder, buffer: string): Promise<void> {
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream closed by server');
          this._readyState = this.CLOSED;
          this.dispatchEvent(new Event('close'));
          this.reconnect();
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        
        // Log raw incoming data for debugging
        console.log('RAW SSE data received:', buffer);
        
        // Process complete events in buffer
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';
        
        for (const event of events) {
          if (event.trim() === '') continue;
          
          // Log each event separately
          console.log('RAW SSE event (before parsing):', event);
          
          // Parse event
          const eventParts = event.split('\n');
          let eventType = 'message';
          let data = '';
          let eventId = '';
          let retry = '';
          
          // Create a structured object of all event parts for debugging
          const eventPartsObj: Record<string, string> = {};
          
          for (const part of eventParts) {
            // Log each line of the event
            console.log('SSE event part:', part);
            
            if (part.startsWith('event:')) {
              eventType = part.slice(6).trim();
              eventPartsObj['event'] = eventType;
            } else if (part.startsWith('data:')) {
              data = part.slice(5).trim();
              eventPartsObj['data'] = data;
            } else if (part.startsWith('id:')) {
              eventId = part.slice(3).trim();
              eventPartsObj['id'] = eventId;
            } else if (part.startsWith('retry:')) {
              retry = part.slice(6).trim();
              eventPartsObj['retry'] = retry;
            } else if (part.trim() !== '') {
              // Capture any unexpected formats
              eventPartsObj[`unknown_${part.split(':')[0]}`] = part;
            }
          }
          
          console.log('Parsed SSE event parts:', eventPartsObj);
          console.log(`SSE event detected - Type: ${eventType}, Data: ${data}`);
          
          // Handle heartbeat events
          if (eventType === 'heartbeat') {
            this.lastHeartbeat = Date.now();
            console.log('Heartbeat received:', data, new Date().toISOString());
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
          
          console.log(`Dispatching SSE event of type: ${eventType}`);
          this.dispatchEvent(messageEvent);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream processing aborted intentionally');
        return;
      }
      
      console.error('Stream processing error:', err);
      this._readyState = this.CLOSED;
      this.dispatchEvent(new Event('error'));
      this.reconnect();
    }
  }
  
  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Maximum reconnect attempts (${this.maxReconnectAttempts}) reached, giving up`);
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(1.5, Math.min(this.reconnectAttempts - 1, 5));
    
    console.log(`Attempting to reconnect SSE (attempt ${this.reconnectAttempts}) after ${delay}ms...`);
    
    // Close current connection if any
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    // Give some time before reconnecting with exponential backoff
    setTimeout(() => {
      this.init();
    }, delay);
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
      try {
        if (typeof listener === 'function') {
          (listener as any)(event);
        } else if (typeof listener === 'object' && 'handleEvent' in listener) {
          (listener as any).handleEvent(event);
        }
      } catch (err) {
        console.error(`Error in event listener for ${event.type}:`, err);
      }
    }
    return !event.defaultPrevented;
  }

  close(): void {
    console.log('Closing SSE connection');
    
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    this._readyState = this.CLOSED;
    this.listeners = {
      open: [],
      message: [],
      error: [],
      close: [],
      heartbeat: []
    };
  }
  
  get readyState(): number {
    return this._readyState;
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
