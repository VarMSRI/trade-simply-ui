
export interface InstrumentFundamentals {
  instrument_token: number;
  instrument_name: string;
  instrument_symbol: string;
  instrument_exchange: string;
  last_price: number;
  fundamentals: {
    metadata: {
      'Market Cap': number;
      'Current Price': number;
      'High / Low': string;
      'Stock P/E': number;
      'Book Value': number;
      'Dividend Yield': number;
      'ROCE': number;
      'ROE': number;
      'Face Value': number;
      quick_ratios: {
        [key: string]: number | string;
      };
    };
  };
}
