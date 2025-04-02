
import { MarketDataUpdate, WebSocketConnectionStatus } from '@/types/market';
import { StompWebSocketClient } from './stompClient';
import { MESSAGE_TYPES } from './config';
import { WebSocketServiceInterface } from './types';

class WebSocketService implements WebSocketServiceInterface {
  private client: StompWebSocketClient;
  
  constructor() {
    this.client = new StompWebSocketClient();
  }

  public connect(): void {
    this.client.connect();
  }

  public disconnect(): void {
    this.client.disconnect();
  }

  public subscribe(instrumentToken: number): boolean {
    return this.client.subscribe(instrumentToken);
  }

  public unsubscribe(instrumentToken: number): boolean {
    return this.client.unsubscribe(instrumentToken);
  }

  public subscribeToMarketData(callback: (data: MarketDataUpdate) => void): () => void {
    return this.client.addListener(MESSAGE_TYPES.MARKET_DATA, callback);
  }

  public subscribeToConnectionStatus(callback: (data: WebSocketConnectionStatus) => void): () => void {
    return this.client.addListener(MESSAGE_TYPES.CONNECTION_STATUS, callback);
  }

  public isSocketConnected(): boolean {
    return this.client.isActive();
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
