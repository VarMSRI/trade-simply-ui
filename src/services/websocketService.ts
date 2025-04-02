
import { Client, IMessage } from '@stomp/stompjs';
import { toast } from "sonner";
import { getUserIdFromToken } from "./apiUtils";
import { MarketDataUpdate, WebSocketConnectionStatus } from '@/types/market';

class WebSocketService {
  private stompClient: Client | null = null;
  private isConnected: boolean = false;
  private reconnectTimer: number | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectInterval: number = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private subscriptions: Set<string> = new Set();
  private url: string = "wss://app.intuitifi.com/ws";
  
  constructor() {
    // Initialize listeners map for different message types
    this.listeners.set("marketData", new Set());
    this.listeners.set("orderUpdate", new Set());
    this.listeners.set("connectionStatus", new Set());
  }

  public connect(): void {
    if (this.stompClient && this.stompClient.connected) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found for WebSocket connection");
        return;
      }

      // Create a new STOMP client
      this.stompClient = new Client({
        brokerURL: this.url,
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: function (str) {
          console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });

      // Configure connection event handlers
      this.stompClient.onConnect = (frame) => {
        console.log("STOMP connection established");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyListeners("connectionStatus", { status: "connected" });
        
        // Resubscribe to all previous subscriptions
        this.resubscribeAll();
      };

      this.stompClient.onStompError = (frame) => {
        console.error('STOMP protocol error:', frame);
        this.notifyListeners("connectionStatus", { 
          status: "error", 
          error: frame 
        });
      };

      this.stompClient.onWebSocketError = (event) => {
        console.error('WebSocket error:', event);
        this.notifyListeners("connectionStatus", { 
          status: "error", 
          error: event 
        });
      };

      this.stompClient.onWebSocketClose = (event) => {
        this.isConnected = false;
        this.notifyListeners("connectionStatus", { 
          status: "disconnected", 
          code: event.code,
          reason: event.reason 
        });

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`WebSocket connection closed. Attempting to reconnect in ${this.reconnectInterval / 1000}s`);
          this.reconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error("Maximum reconnection attempts reached");
          toast.error("Failed to connect to market data stream. Please refresh the page.");
        }
      };

      // Activate the connection
      this.stompClient.activate();

    } catch (error) {
      console.error("Error establishing STOMP connection:", error);
    }
  }

  private handleMessage(destination: string, message: IMessage): void {
    try {
      const payload = JSON.parse(message.body);
      
      // Extract the message type from the destination
      if (destination.includes('/topic/market')) {
        this.notifyListeners("marketData", payload);
      } else if (destination.includes('/topic/orders')) {
        this.notifyListeners("orderUpdate", payload);
      }
    } catch (error) {
      console.error("Error handling STOMP message:", error);
    }
  }

  private notifyListeners(type: string, data: any): void {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(listener => listener(data));
    }
  }

  private reconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    this.reconnectTimer = window.setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.connect();
    }, this.reconnectInterval);
  }

  public disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate();
    }

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.isConnected = false;
    this.subscriptions.clear();
  }

  public subscribe(instrumentToken: number): boolean {
    if (!this.isConnected || !this.stompClient || !this.stompClient.connected) {
      console.warn("Cannot subscribe: STOMP client is not connected");
      return false;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("Failed to get user ID for market data subscription");
      return false;
    }

    const topic = `/topic/market/${userId}/${instrumentToken}`;
    
    // Check if already subscribed
    if (this.subscriptions.has(topic)) {
      return true;
    }

    try {
      // Subscribe to STOMP destination
      const subscription = this.stompClient.subscribe(topic, (message) => {
        this.handleMessage(topic, message);
      });
      
      this.subscriptions.add(topic);
      console.log(`Subscribed to ${topic}`);
      return true;
    } catch (error) {
      console.error(`Error subscribing to ${topic}:`, error);
      return false;
    }
  }

  public unsubscribe(instrumentToken: number): boolean {
    if (!this.isConnected || !this.stompClient || !this.stompClient.connected) {
      return false;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      return false;
    }

    const topic = `/topic/market/${userId}/${instrumentToken}`;
    
    if (!this.subscriptions.has(topic)) {
      return true; // Already unsubscribed
    }

    try {
      // Find and unsubscribe from the specific subscription
      this.stompClient.unsubscribe(topic);
      
      this.subscriptions.delete(topic);
      return true;
    } catch (error) {
      console.error(`Error unsubscribing from ${topic}:`, error);
      return false;
    }
  }

  public subscribeToMarketData(callback: (data: MarketDataUpdate) => void): () => void {
    const marketDataListeners = this.listeners.get("marketData");
    if (marketDataListeners) {
      marketDataListeners.add(callback);
    }

    // Return unsubscribe function
    return () => {
      if (marketDataListeners) {
        marketDataListeners.delete(callback);
      }
    };
  }

  public subscribeToConnectionStatus(callback: (data: WebSocketConnectionStatus) => void): () => void {
    const connectionListeners = this.listeners.get("connectionStatus");
    if (connectionListeners) {
      connectionListeners.add(callback);
    }

    return () => {
      if (connectionListeners) {
        connectionListeners.delete(callback);
      }
    };
  }

  private resubscribeAll(): void {
    if (!this.isConnected || !this.stompClient || !this.stompClient.connected) {
      return;
    }

    // Re-establish all previous subscriptions
    this.subscriptions.forEach(topic => {
      try {
        this.stompClient?.subscribe(topic, (message) => {
          this.handleMessage(topic, message);
        });
        console.log(`Resubscribed to ${topic}`);
      } catch (error) {
        console.error(`Error resubscribing to ${topic}:`, error);
      }
    });
  }

  public isSocketConnected(): boolean {
    return this.isConnected;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
