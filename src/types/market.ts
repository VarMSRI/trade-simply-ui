
export interface MarketDataUpdate {
  instrumentToken: number;
  tradingSymbol?: string;
  lastPrice?: number;
  change?: number;
  changePercent?: number;
  highPrice?: number;
  lowPrice?: number;
  volume?: number;
  openPrice?: number;
  closePrice?: number;
  bidPrice?: number;
  askPrice?: number;
  lastUpdated?: string;
}

export interface WebSocketConnectionStatus {
  status: 'connected' | 'disconnected' | 'error';
  code?: number;
  reason?: string;
  error?: any;
}
