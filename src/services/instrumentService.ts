
import { Instrument } from '@/types/watchlist';
import Papa from 'papaparse';

class InstrumentService {
  private instruments: Instrument[] = [];
  private isLoaded = false;
  private isLoading = false;

  constructor() {
    this.loadInstruments();
  }

  private async loadInstruments() {
    try {
      if (this.isLoading) return;
      this.isLoading = true;
      
      const response = await fetch('/instruments.csv');
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      
      const { data } = Papa.parse<Instrument>(csvText, {
        header: true,
        dynamicTyping: true, // Automatically convert strings to numbers where appropriate
        skipEmptyLines: true,
      });

      this.instruments = data.filter(instrument => 
        instrument.instrument_token && 
        instrument.tradingsymbol
      );
      
      this.isLoaded = true;
      this.isLoading = false;
      console.log('Instruments loaded:', this.instruments.length);
    } catch (error) {
      console.error('Failed to load instruments:', error);
      this.isLoading = false;
      
      // Fallback to mock data in case the file isn't available
      this.loadMockInstruments();
    }
  }
  
  private loadMockInstruments() {
    console.warn('Loading mock instruments as fallback');
    // Mock CSV content with a few instruments
    const csvContent = `instrument_token,exchange_token,tradingsymbol,name,last_price,tick_size,instrument_type,segment,exchange,strike,lot_size,expiry
256265,1000,RELIANCE,Reliance Industries Ltd.,2750.25,0.05,EQ,NSE,NSE,0,1,
60193,235,TCS,Tata Consultancy Services Ltd.,3640.80,0.05,EQ,NSE,NSE,0,1,
738561,2886,HDFCBANK,HDFC Bank Ltd.,1590.45,0.05,EQ,NSE,NSE,0,1,
895745,3499,INFY,Infosys Ltd.,1480.20,0.05,EQ,NSE,NSE,0,1,
2885377,11270,TATAMOTORS,Tata Motors Ltd.,850.15,0.05,EQ,NSE,NSE,0,1,
3861249,15083,ICICIBANK,ICICI Bank Ltd.,1080.70,0.05,EQ,NSE,NSE,0,1,
3001089,11724,ITC,ITC Ltd.,445.60,0.05,EQ,NSE,NSE,0,1,
2953217,11536,SBIN,State Bank of India,750.30,0.05,EQ,NSE,NSE,0,1,
2815745,11001,AXISBANK,Axis Bank Ltd.,1125.90,0.05,EQ,NSE,NSE,0,1,
779521,3045,KOTAKBANK,Kotak Mahindra Bank Ltd.,1950.65,0.05,EQ,NSE,NSE,0,1,
1207553,4716,LT,Larsen & Toubro Ltd.,3320.40,0.05,EQ,NSE,NSE,0,1,
81153,317,BAJFINANCE,Bajaj Finance Ltd.,6850.75,0.05,EQ,NSE,NSE,0,1,
325121,1270,ASIANPAINT,Asian Paints Ltd.,2980.25,0.05,EQ,NSE,NSE,0,1,
341249,1333,BHARTIARTL,Bharti Airtel Ltd.,1420.80,0.05,EQ,NSE,NSE,0,1,
2714625,10604,HINDUNILVR,Hindustan Unilever Ltd.,2510.95,0.05,EQ,NSE,NSE,0,1,`;

    const { data } = Papa.parse<Instrument>(csvContent, {
      header: true,
      dynamicTyping: true,
    });

    this.instruments = data;
    this.isLoaded = true;
  }

  public async searchInstruments(query: string): Promise<Instrument[]> {
    // Wait for instruments to load if they haven't already
    if (!this.isLoaded) {
      await new Promise(resolve => {
        const checkLoaded = () => {
          if (this.isLoaded) {
            resolve(true);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    if (!query) return [];

    const normalizedQuery = query.toLowerCase();
    return this.instruments.filter(
      instrument => 
        instrument.tradingsymbol?.toLowerCase().includes(normalizedQuery) || 
        instrument.name?.toLowerCase().includes(normalizedQuery)
    ).slice(0, 15); // Limit results to 15
  }

  public getInstrumentByToken(token: number): Instrument | undefined {
    return this.instruments.find(i => i.instrument_token === token);
  }
  
  public async getFundamentals(instrumentToken: number): Promise<any> {
    try {
      const response = await fetch(`http://13.201.200.220:2020/oauth/get-fundamentals?instrumentToken=${instrumentToken}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch fundamentals: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching fundamentals:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const instrumentService = new InstrumentService();
export default instrumentService;
