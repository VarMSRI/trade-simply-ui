
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getUserIdFromToken } from "../apiUtils";
import { WS_CONFIG, MESSAGE_TYPES } from './config';
import { toast } from 'sonner';
import { MarketDataUpdate, WebSocketConnectionStatus } from '@/types/market';

export class StompWebSocketClient {
  private stompClient: Client | null = null;
  private isConnected: boolean = false;
  private reconnectTimer: number | null = null;
  private reconnectAttempts: number = 0;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private subscriptions: Set<string> = new Set();
  
  constructor() {
    // Initialize listeners map for different message types
    this.listeners.set(MESSAGE_TYPES.MARKET_DATA, new Set());
    this.listeners.set(MESSAGE_TYPES.ORDER_UPDATE, new Set());
    this.listeners.set(MESSAGE_TYPES.CONNECTION_STATUS, new Set());
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

      // Create a new STOMP client with SockJS
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_CONFIG.URL),
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
      this.stompClient.onConnect = this.handleConnect.bind(this);
      this.stompClient.onStompError = this.handleStompError.bind(this);
      this.stompClient.onWebSocketError = this.handleWebSocketError.bind(this);
      this.stompClient.onWebSocketClose = this.handleWebSocketClose.bind(this);

      // Activate the connection
      this.stompClient.activate();

    } catch (error) {
      console.error("Error establishing STOMP connection:", error);
    }
  }

  private handleConnect(frame: any): void {
    console.log("STOMP connection established");
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.notifyListeners(MESSAGE_TYPES.CONNECTION_STATUS, { status: "connected" });
    
    // Resubscribe to all previous subscriptions
    this.resubscribeAll();
  }

  private handleStompError(frame: any): void {
    console.error('STOMP protocol error:', frame);
    this.notifyListeners(MESSAGE_TYPES.CONNECTION_STATUS, { 
      status: "error", 
      error: frame 
    });
  }

  private handleWebSocketError(event: any): void {
    console.error('WebSocket error:', event);
    this.notifyListeners(MESSAGE_TYPES.CONNECTION_STATUS, { 
      status: "error", 
      error: event 
    });
  }

  private handleWebSocketClose(event: CloseEvent): void {
    this.isConnected = false;
    this.notifyListeners(MESSAGE_TYPES.CONNECTION_STATUS, { 
      status: "disconnected", 
      code: event.code,
      reason: event.reason 
    });

    if (this.reconnectAttempts < WS_CONFIG.RECONNECT.MAX_ATTEMPTS) {
      console.log(`WebSocket connection closed. Attempting to reconnect in ${WS_CONFIG.RECONNECT.INTERVAL / 1000}s`);
      this.reconnect();
    } else if (this.reconnectAttempts >= WS_CONFIG.RECONNECT.MAX_ATTEMPTS) {
      console.error("Maximum reconnection attempts reached");
      toast.error("Failed to connect to market data stream. Please refresh the page.");
    }
  }

  private handleMessage(destination: string, message: IMessage): void {
    try {
      const payload = JSON.parse(message.body);
      
      // Extract the message type from the destination
      if (destination.includes('/topic/market')) {
        this.notifyListeners(MESSAGE_TYPES.MARKET_DATA, payload);
      } else if (destination.includes('/topic/orders')) {
        this.notifyListeners(MESSAGE_TYPES.ORDER_UPDATE, payload);
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
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${WS_CONFIG.RECONNECT.MAX_ATTEMPTS}`);
      this.connect();
    }, WS_CONFIG.RECONNECT.INTERVAL);
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

  public addListener(type: string, callback: (data: any) => void): () => void {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.add(callback);
    }

    // Return unsubscribe function
    return () => {
      if (typeListeners) {
        typeListeners.delete(callback);
      }
    };
  }

  public isActive(): boolean {
    return this.isConnected;
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
}
