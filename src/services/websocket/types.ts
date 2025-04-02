
import { MarketDataUpdate, WebSocketConnectionStatus } from '@/types/market';

export interface WebSocketListener {
  unsubscribe: () => void;
}

export interface WebSocketServiceInterface {
  connect(): void;
  disconnect(): void;
  subscribe(instrumentToken: number): boolean;
  unsubscribe(instrumentToken: number): boolean;
  subscribeToMarketData(callback: (data: MarketDataUpdate) => void): () => void;
  subscribeToConnectionStatus(callback: (data: WebSocketConnectionStatus) => void): () => void;
  isSocketConnected(): boolean;
}
