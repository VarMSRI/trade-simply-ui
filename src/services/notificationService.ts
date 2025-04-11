
import { TradeAlert } from '@/types/alert';
import { BASE_URL, getAuthHeaders } from './apiUtils';

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
    const eventSource = new EventSourcePolyfill(url, { 
      headers,
      withCredentials: true 
    });
    
    return eventSource;
  }
};

// EventSource polyfill to support custom headers
class EventSourcePolyfill implements EventSource {
  private url: string;
  private options: any;
  private eventSource: EventSource | null = null;
  private listeners: { [key: string]: EventListener[] } = {
    open: [],
    message: [],
    error: [],
    close: []
  };
  
  constructor(url: string, options: any) {
    this.url = url;
    this.options = options;
    this.init();
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
              
              // Dispatch event
              const messageEvent = new MessageEvent(eventType, {
                data: data,
                origin: window.location.origin
              });
              
              this.dispatchEvent(messageEvent);
            }
          }
        } catch (err) {
          this.dispatchEvent(new Event('error'));
        }
      };

      // Start processing and dispatch open event
      processStream();
      this.dispatchEvent(new Event('open'));
    } catch (err) {
      this.dispatchEvent(new Event('error'));
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
    listeners.forEach(listener => {
      if (event instanceof MessageEvent) {
        (listener as EventListenerObject).handleEvent 
          ? (listener as EventListenerObject).handleEvent(event) 
          : listener(event);
      } else {
        (listener as EventListenerObject).handleEvent 
          ? (listener as EventListenerObject).handleEvent(event) 
          : listener(event);
      }
    });
    return !event.defaultPrevented;
  }

  close(): void {
    this.listeners = {
      open: [],
      message: [],
      error: [],
      close: []
    };
  }

  // EventSource interface properties
  readonly CLOSED: number = 2;
  readonly CONNECTING: number = 0;
  readonly OPEN: number = 1;
  
  get readyState(): number {
    return 1; // Always return OPEN for simplicity
  }
  
  get url(): string {
    return this.url;
  }

  // Event handlers
  set onopen(handler: ((this: EventSource, ev: Event) => any) | null) {
    this.listeners.open = handler ? [handler] : [];
  }
  
  set onmessage(handler: ((this: EventSource, ev: MessageEvent) => any) | null) {
    this.listeners.message = handler ? [handler] : [];
  }
  
  set onerror(handler: ((this: EventSource, ev: Event) => any) | null) {
    this.listeners.error = handler ? [handler] : [];
  }
}

export default notificationService;
