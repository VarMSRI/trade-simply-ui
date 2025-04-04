
import { getUserIdFromToken } from "../apiUtils";
import { WS_CONFIG, MESSAGE_TYPES } from './config';
import { toast } from 'sonner';
import { MarketDataUpdate, WebSocketConnectionStatus } from '@/types/market';
import { SubscriptionManager } from './subscriptionManager';

export class StompWebSocketClient {
  private subscriptionManager: SubscriptionManager;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  
  constructor() {
    this.subscriptionManager = new SubscriptionManager();
    
    // Initialize listeners map for different message types
    this.listeners.set(MESSAGE_TYPES.MARKET_DATA, new Set());
    this.listeners.set(MESSAGE_TYPES.ORDER_UPDATE, new Set());
    this.listeners.set(MESSAGE_TYPES.CONNECTION_STATUS, new Set());
    
    // Setup connection status listener
    this.subscriptionManager.addConnectionListener((isConnected, error) => {
      if (isConnected) {
        this.notifyListeners(MESSAGE_TYPES.CONNECTION_STATUS, { status: "connected" });
      } else {
        const status: WebSocketConnectionStatus = { 
          status: "error", 
          error: error 
        };
        
        if (error instanceof CloseEvent) {
          status.status = "disconnected";
          status.code = error.code;
          status.reason = error.reason;
        }
        
        this.notifyListeners(MESSAGE_TYPES.CONNECTION_STATUS, status);
        
        if (status.status === "disconnected" && 
            this.subscriptionManager.isActive() === false && 
            error instanceof CloseEvent && 
            error.code !== 1000) {
          toast.error("Failed to connect to market data stream. Please refresh the page.");
        }
      }
    });
    
    // Setup message handlers for market data and order updates
    this.subscriptionManager.addMessageHandler('/topic/market', (data) => {
      this.notifyListeners(MESSAGE_TYPES.MARKET_DATA, data);
    });
    
    this.subscriptionManager.addMessageHandler('/topic/orders', (data) => {
      this.notifyListeners(MESSAGE_TYPES.ORDER_UPDATE, data);
    });
  }

  public connect(): void {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found for WebSocket connection");
      return;
    }
    
    this.subscriptionManager.connect(token);
  }

  public disconnect(): void {
    this.subscriptionManager.disconnect();
  }

  public subscribe(instrumentToken: number): boolean {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("Failed to get user ID for market data subscription");
      return false;
    }

    return this.subscriptionManager.subscribe('/topic/market', userId, instrumentToken);
  }

  public unsubscribe(instrumentToken: number): boolean {
    const userId = getUserIdFromToken();
    if (!userId) {
      return false;
    }

    return this.subscriptionManager.unsubscribe('/topic/market', userId, instrumentToken);
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
    return this.subscriptionManager.isActive();
  }

  private notifyListeners(type: string, data: any): void {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(listener => listener(data));
    }
  }
}
