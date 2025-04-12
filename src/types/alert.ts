
export interface TradeAlert {
  security: string;
  security_code?: string; // Some alerts might use security_code instead of security
  entry_price: number;
  target_price: number;
  stop_loss: number;
  sentiment_score: number;
  fundamental_score: number;
  volume_score: number;
  liquidity: number;
  event_score: number;
  atr: number;
  volume30: number;
  summary: string;
}
