
import { toast } from "sonner";
import { getUserIdFromToken } from "./apiUtils";

interface WebSocketMessage {
  type: string;
  data: any;
}

class WebSocketService {
  private socket: WebSocket | null = null;
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
    if (this.socket) {
      this.disconnect();
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found for WebSocket connection");
        return;
      }

      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log("WebSocket connection established");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyListeners("connectionStatus", { status: "connected" });
        
        // Resubscribe to all previous subscriptions
        this.resubscribeAll();
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.handleMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.socket.onclose = (event) => {
        this.isConnected = false;
        this.notifyListeners("connectionStatus", { 
          status: "disconnected", 
          code: event.code,
          reason: event.reason 
        });

        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`WebSocket connection closed. Attempting to reconnect in ${this.reconnectInterval / 1000}s`);
          this.reconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error("Maximum reconnection attempts reached");
          toast.error("Failed to connect to market data stream. Please refresh the page.");
        }
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.notifyListeners("connectionStatus", { status: "error", error });
      };

    } catch (error) {
      console.error("Error establishing WebSocket connection:", error);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    // Determine message type and notify appropriate listeners
    if (message.type === "market") {
      this.notifyListeners("marketData", message.data);
    } else if (message.type === "order") {
      this.notifyListeners("orderUpdate", message.data);
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
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.isConnected = false;
    this.subscriptions.clear();
  }

  public subscribe(instrumentToken: number): boolean {
    if (!this.isConnected || !this.socket) {
      console.warn("Cannot subscribe: WebSocket is not connected");
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
      this.socket.send(JSON.stringify({
        type: "SUBSCRIBE",
        topic
      }));
      
      this.subscriptions.add(topic);
      console.log(`Subscribed to ${topic}`);
      return true;
    } catch (error) {
      console.error(`Error subscribing to ${topic}:`, error);
      return false;
    }
  }

  public unsubscribe(instrumentToken: number): boolean {
    if (!this.isConnected || !this.socket) {
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
      this.socket.send(JSON.stringify({
        type: "UNSUBSCRIBE",
        topic
      }));
      
      this.subscriptions.delete(topic);
      return true;
    } catch (error) {
      console.error(`Error unsubscribing from ${topic}:`, error);
      return false;
    }
  }

  public subscribeToMarketData(callback: (data: any) => void): () => void {
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

  public subscribeToConnectionStatus(callback: (data: any) => void): () => void {
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
    if (!this.isConnected || !this.socket) {
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      return;
    }

    // Re-establish all previous subscriptions
    this.subscriptions.forEach(topic => {
      try {
        this.socket?.send(JSON.stringify({
          type: "SUBSCRIBE",
          topic
        }));
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
