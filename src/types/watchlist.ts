
export interface WatchlistItem {
  id: number;
  watchlist_id: number;
  instrument_key: number;
  created_at: string;
  trading_symbol: string;
  instrument_name: string;
  lastPrice: number | null;
  change: number | null;
  changePercent: number | null;
}

export interface Watchlist {
  id: number;
  user_id: string;
  name: string;
  created_at: string;
  items: WatchlistItem[];
}

export interface CreateWatchlistRequest {
  name: string;
}

export interface UpdateWatchlistRequest {
  name: string;
}

export interface AddInstrumentDTO {
  instrument_key: number;
  trading_symbol: string;
  instrument_name: string;
}

export interface Instrument {
  instrument_token: number;
  exchange_token: number;
  tradingsymbol: string;
  name: string;
  last_price: number;
  tick_size: number;
  instrument_type: string;
  segment: string;
  exchange: string;
  strike: number;
  lot_size: number;
  expiry: string;
}
