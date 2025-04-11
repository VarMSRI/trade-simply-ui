
export interface TradeAlert {
  security: string;
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
