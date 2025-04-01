
import React, { useEffect, useState } from 'react';
import DashboardWatchlist from '@/components/dashboard/DashboardWatchlist';
import OrderForm from '@/components/trading/OrderForm';
import MarketNews from '@/components/dashboard/MarketNews';
import instrumentService from '@/services/instrumentService';
import { Instrument } from '@/types/watchlist';

const Dashboard: React.FC = () => {
  const [defaultInstrument, setDefaultInstrument] = useState<Instrument | null>(null);
  
  // Load a default instrument (RELIANCE)
  useEffect(() => {
    const loadDefaultInstrument = async () => {
      try {
        // Try to get RELIANCE first
        const instruments = await instrumentService.searchInstruments('RELIANCE');
        if (instruments && instruments.length > 0) {
          setDefaultInstrument(instruments[0]);
        } else {
          // If RELIANCE is not found, get any available instrument
          const anyInstrument = await instrumentService.searchInstruments('NSE');
          if (anyInstrument && anyInstrument.length > 0) {
            setDefaultInstrument(anyInstrument[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load default instrument:', error);
      }
    };
    
    loadDefaultInstrument();
  }, []);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your portfolio.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {defaultInstrument && (
            <OrderForm 
              symbol={defaultInstrument.tradingsymbol}
              instrumentToken={defaultInstrument.instrument_token}
              currentPrice={defaultInstrument.last_price || 500}
              name={defaultInstrument.name}
            />
          )}
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
