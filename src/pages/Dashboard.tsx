
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardWatchlist from '@/components/dashboard/DashboardWatchlist';
import OrderForm from '@/components/trading/OrderForm';
import MarketNews from '@/components/dashboard/MarketNews';
import instrumentService from '@/services/instrumentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Instrument } from '@/types/watchlist';
import { ArrowRight, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DEFAULT_INSTRUMENTS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
  'SBIN', 'BAJFINANCE', 'HINDUNILVR', 'BHARTIARTL', 'LT'
];

const Dashboard: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Load default instruments
  useEffect(() => {
    const loadDefaultInstruments = async () => {
      setIsLoading(true);
      try {
        const loadedInstruments: Instrument[] = [];
        
        // Load each default instrument
        for (const symbol of DEFAULT_INSTRUMENTS) {
          const results = await instrumentService.searchInstruments(symbol);
          if (results.length > 0) {
            loadedInstruments.push(results[0]);
          }
        }
        
        // Fallback to any instruments if we couldn't load defaults
        if (loadedInstruments.length === 0) {
          const anyInstruments = await instrumentService.searchInstruments('NSE');
          loadedInstruments.push(...anyInstruments.slice(0, 10));
        }
        
        setInstruments(loadedInstruments);
        if (loadedInstruments.length > 0) {
          setSelectedInstrument(loadedInstruments[0]);
        }
      } catch (error) {
        console.error('Failed to load default instruments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDefaultInstruments();
  }, []);

  const handleInstrumentSelect = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
  };

  const handleGoToTrading = () => {
    navigate('/trading');
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your portfolio.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-xl font-semibold">Quick Trade</h2>
              <Button variant="outline" size="sm" onClick={handleGoToTrading}>
                <Search className="h-4 w-4 mr-1" />
                Find More Instruments
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <CardContent className="pt-6">
              <Tabs defaultValue={instruments[0]?.tradingsymbol} className="mt-2">
                <TabsList className="mb-4 flex flex-wrap h-auto">
                  {instruments.map((instrument) => (
                    <TabsTrigger
                      key={instrument.instrument_token}
                      value={instrument.tradingsymbol}
                      onClick={() => handleInstrumentSelect(instrument)}
                      className="mb-1"
                    >
                      {instrument.tradingsymbol}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {instruments.map((instrument) => (
                  <TabsContent key={instrument.instrument_token} value={instrument.tradingsymbol}>
                    {selectedInstrument && (
                      <OrderForm 
                        symbol={instrument.tradingsymbol}
                        instrumentToken={instrument.instrument_token}
                        currentPrice={instrument.last_price || 500}
                        name={instrument.name}
                      />
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DashboardWatchlist />
          <MarketNews />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
